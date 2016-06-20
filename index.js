#!/usr/bin/env node

const fs = require('fs')
const readline = require('readline')
const colors = require('colors')
const path = require('path')
const moment = require('moment')
const program = require('commander')
const notifier = require('node-notifier')
const apiCall = require('./apiCall')
const config = require('./apiConfig')

let rl = readline.createInterface(process.stdin, process.stdout)

/**
* Gets the feedbacks for the last 30 days. All new feedbacks are saved.
*/
program
  .command('feedbacks')
  .description('save recent feedbacks from the API')
  .action(() => {
    apiCall('feedbacks')
      .then(res => {
        let feedbacks = []
        res.body.forEach(fb => {
          feedbacks.push({
            id: fb.id,
            projectName: fb.project.name,
            rating: fb.rating,
            body: fb.body,
            projectURL: `https://review.udacity.com/#!/submissions/${fb.submission_id}`,
            createdAt: fb.created_at
          })
        })
        if (config.feedbacks) {
          let savedFeedbackIds = new Set(config.feedbacks.map(fb => fb.id))
          let newIds = feedbacks.filter(fb => !savedFeedbackIds.has(fb.id))
          if (newIds) {
            newIds.reverse().forEach(fb => config.feedbacks.unshift(fb))
            fs.writeFileSync('apiConfig.json', JSON.stringify(config, null, 2))
          }
        } else {
          config.feedbacks = feedbacks
          fs.writeFileSync('apiConfig.json', JSON.stringify(config, null, 2))
        }
        process.exit()
      })
  })

/**
* Starts requesting the Udacity Review API queue for assignments. Accepts
* a space separated list of project ids to request for.
*/
program
  .command('assign <projectId> [moreIds...]')
  .description('poll the Review queue for submissions')
  .action((projectId, moreIds) => {
    const startTime = moment()
    const reqAssignedInterval = 60
    let reqAssignedIn = 0
    let assigned = 0
    let callsTotal = 0

    let projectQueue = [projectId]
    if (moreIds) {
      moreIds.forEach(id => projectQueue.push(id))
    }

    // Start by validating the project ids entered by the user.
    let inputProjectIds = new Set(projectQueue)
    let certifiedProjectIds = new Set(config.certified.map(project => project.id))
    let validIds = new Set([...inputProjectIds].filter(id => certifiedProjectIds.has(id)))
    if (inputProjectIds.size !== validIds.size) {
      let difference = new Set([...inputProjectIds].filter(id => !validIds.has(id)))
      throw new Error(`Illegal Action: Not certified for project(s) ${[...difference].join(', ')}`)
    }

    let errorMsg = ''

    /**
    * Every 30 seconds it checks how many submissions are currently assigned
    * to the user. If it's 2, it waits the length of the interval const and
    * checks again. As long as it's less than 2 it requests a new assignment
    * every second.
    */
    function requestNewAssignment () {
      if (reqAssignedIn === 0) {
        setPrompt('checking assigned')
        callsTotal++
        apiCall('assigned')
          .then(res => {
            assigned = res.body.length
          })
      } else {
        if (assigned === 2) {
          setPrompt(`Max submissions assigned. Checking again in ${reqAssignedInterval - reqAssignedIn} seconds.`)
        } else {
          let id = projectQueue[callsTotal % projectQueue.length]
          setPrompt(`Requesting assignment for project ${id}`)
          errorMsg = ''
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
                errorMsg = res.statusCode
              }
            })
        }
      }
      setTimeout(() => {
        reqAssignedIn = moment().seconds() % reqAssignedInterval
        requestNewAssignment()
      }, 1000)
    }

    /**
    * Writes the current information to the terminal.
    */
    function setPrompt (msg) {
      readline.cursorTo(process.stdout, 0, 0)
      readline.clearScreenDown(process.stdout)
      if (config.tokenAge - moment().dayOfYear() < 5) {
        rl.write(`Token expires ${moment().dayOfYear(config.tokenAge).fromNow()}\n`.red)
      }
      rl.write(`Uptime: ${startTime.fromNow(true).white}\n`)
      rl.write(`Current task: ${msg.white}\n`)
      rl.write(`Total server requests: ${callsTotal}\n`.green)
      rl.write(`Currently assigned: ${assigned}\n`.green)
      if (errorMsg) rl.write(`Server responded with ${errorMsg}\n`.yellow)
      rl.write(`Press ${'ctrl+c'} to exit`)
    }

    requestNewAssignment()
  })

/**
* Accepts a token and saves it to the config file.
*/
program
  .command('token <token>')
  .description('set the token')
  .action(token => {
    config.token = token
    config.tokenAge = moment().dayOfYear() + 30
    fs.writeFileSync('apiConfig.json', JSON.stringify(config, null, 2))
  })

/**
* Logs the users certifications to the console.
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
    function showCerts () {
      config.certified.forEach(elem => {
        rl.write(`Project Name: ${elem.name.white}, Project ID: ${elem.id.white}\n`)
      })
    }
  })

/**
* Sends a desctop notifications to the user with the name of the projects
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
          rl.write('No reviews are assigned at this time.\n'.yellow)
        }
      })
  })

program.parse(process.argv)
