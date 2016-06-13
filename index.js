#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const program = require('commander')
const notifier = require('node-notifier')
const apiCall = require('./apiCall')
const config = require('./apiConfig')

/**
* @desc Accepts a token and saves it to the config file.
*/
program
  .command('token <token>')
  .description('set the token')
  .action(token => {
    config.token = token
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
                id: elem.project_id
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
