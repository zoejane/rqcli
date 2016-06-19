#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const moment = require('moment')
const program = require('commander')
const notifier = require('node-notifier')
const apiCall = require('./apiCall')
const config = require('./apiConfig')


/**
* @desc Starts requesting the Udacity Review API queue for assignments. Accepts
* a space separated list of project ids to request for.
*/
program
  .command('assign <projectId> [moreIds...]')
  .description('poll the API queue for submissions')
  .action((projectId, moreIds) => {
    // How often we check the number of submissions that are already assigned.
    const reqAssignedInterval = 30
    let ids = [projectId]
    if (moreIds) {
      moreIds.forEach(id => ids.push(id))
    }
    let renewToken = false
    let secondsSinceStart = 0
    let callsTotal = 0
    let assigned = 0
    let reqAssignedIn = 0
    // Since the user can add the same id multiple times to weigh the requests
    // to a particular project, we have to validate the Set() of the ids.
    validateProjectIds(new Set(ids))
    requestNewAssignment()
    /**
    * @desc Every 30 seconds it checks how many submissions are currently assigned
    * to the user. If it's 2, it waits the length of the interval const and checks
    * again. As long as it's less than 2 it requests a new assignment every second.
    */
    function requestNewAssignment () {
      // Test the age of the token every one days
      if (!renewToken && !(secondsSinceStart % 86400)) {
        console.log('Checking renewal')
        if (moment().dayOfYear - config.tokenAge > 25) {
          renewToken = true
        }
      }
      if (reqAssignedIn === 0) {
        console.log('checking assigned')
        apiCall('assigned')
          .then(res => {
            if (res.body.length) {
              assigned = res.body.length
            } else {
              console.log('No reviews are assigned at this time.')
            }
          })
      } else {
        if (assigned === 2) {
          console.log(`Max submissions assigned. Checking again in ${reqAssignedInterval - reqAssignedIn} seconds.`)
        } else {
          let id = ids[callsTotal % ids.length]
          console.log(`Requesting assignment for project ${id}`)
          callsTotal++
          apiCall('assign', 'POST', id)
            .then(res => {
              if (res.statusCode === 201) {
                let projectName = res.body.project.name
                let submissionId = res.body.id
                notifier.notify({
                  title: 'New Review Assigned!',
                  message: `${projectName}, ID: ${submissionId}`,
                  open: `https://review.udacity.com/#!/submissions/${submissionId}`,
                  icon: path.join(__dirname, 'clipboard.svg'),
                  sound: 'Ping'
                })
              } else if (res.statusCode !== 404) {
                console.log(`Server responded with an error: ${res.statusCode}`)
              }
              callsTotal++
            })
        }
      }
      setTimeout(() => {
        console.log('setting timeout')
        secondsSinceStart++
        reqAssignedIn = moment().seconds() % reqAssignedInterval
        requestNewAssignment()
      }, 1000)
    }
  })

/**
* Throws an error if not all of the ids are in the list of certified projects.
*/
function validateProjectIds (ids) {
  let certified = new Set(config.certified.map(project => project.id))
  let intersection = new Set([...ids].filter(id => certified.has(id)))
  if (intersection.size < ids.size) {
    let difference = new Set([...ids].filter(id => !intersection.has(id)))
    console.log(`Not certified for the following projects ${[...difference].join(', ')}`)
    throw new Error(`Illegal Action: Not certified.`)
  }
}

/**
* @desc Accepts a token and saves it to the config file.
*/
program
  .command('token <token>')
  .description('set the token')
  .action(token => {
    config.token = token
    config.tokenAge = moment().dayOfYear()
    fs.writeFileSync('apiConfig.json', JSON.stringify(config, null, 2))
  })

/**
* @desc Logs the users certifications to the console.
* Options: --update, updates the certifications and logs them to the console.
*/
program
  .command('certs')
  .option('-u, --update', 'update certificatons')
  .description('get project certifications')
  .action(options => {
    if (options.update || !config.certified) {
      config.certified = []
      apiCall('certifications')
        .then(res => {
          res.body.filter(elem => {
            if (elem.status === 'certified') {
              config.certified.push({
                name: elem.project.name,
                id: elem.project_id.toString()
              })
            }
          })
          fs.writeFileSync('apiConfig.json', JSON.stringify(config, null, 2))
          showCerts()
        })
    } else {
      showCerts()
    }
  })

function showCerts () {
  config.certified.forEach(elem => {
    console.log(`Project Name: ${elem.name}, Project ID: ${elem.id}`)
  })
}

/**
* @desc Sends a desctop notifications to the user with the name of the projects
* that have been assigned and the id. It opens the review page for the
* submission if you click on the notification.
*/
program
  .command('assigned')
  .description('get the submissions that are assigned to you')
  .action(() => {
    apiCall('assigned')
      .then(res => {
        if (res.body.length) {
          res.body.forEach(sub => {
            notifier.notify({
              title: 'Currently Assigned:',
              message: `${sub.project.name}, ID: ${sub.id}`,
              open: `https://review.udacity.com/#!/submissions/${sub.id}`,
              icon: path.join(__dirname, 'clipboard.svg'),
              sound: 'Ping'
            })
          })
        } else {
          console.log('No reviews are assigned at this time.')
        }
      })
  })

program.parse(process.argv)
