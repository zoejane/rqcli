#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const colors = require('colors')
const moment = require('moment')
const cli = require('commander')
const notifier = require('node-notifier')
const pkg = require('./package')
const apiCall = require('./utils').apiCall
const cmd = require('./commands')
let config = require('./config')

const readline = require('readline')
const rl = readline.createInterface(process.stdin, process.stdout)

let opts = config.reqOptions(config.auth.token)

// Instantiate the CLI
cli.name('rqcli')
cli.version(pkg.version)
  .usage('<command> <args> [options]')

/**
* Accepts a token and saves it to the config file.
*/
cli.command('token <token>')
  .description('set the token')
  .action(token => {
    let tokenAge = moment().dayOfYear() + 30
    config.auth.save(token, tokenAge)
    console.log(config)
    process.exit(0)
  })

/**
* Logs the users certifications to the console.
* Options: --update, updates the certifications and logs them to the console.
*/
cli.command('certs')
  .option('-u, --update', 'update certificatons')
  .description('get project certifications')
  .action(options => {
    cmd.certs(config, options)
      .then(certs => {
        config.certs.show(certs)
        process.exit(0)
      })
  })

/**
* Sets up the config file with token, certifications and feedbacks. Also
* notifies the user of any submissions that are currently assigned.
*/
cli.command('init <token>')
  .description('set up your review environment')
  .action(token => {
    // Save the token
    let tokenAge = moment().dayOfYear() + 30
    config.auth.save(token, tokenAge)

    // Set the authorization header for the API request
    opts.headers.Authorization = token
    apiCall(opts, 'certifications')
      .then(res => {
        let certs = res.body
          .filter(cert => cert.status === 'certified')
          .map(cert => {
            return {
              name: cert.project.name,
              id: cert.project_id.toString()
            }
          })
        config.certs.save(certs)
        return apiCall(opts, 'assigned')
      })
      .then(res => {
        res.body.forEach(sub => {
          notifier.notify({
            title: 'Currently Assigned:',
            message: `${sub.project.name}, ID: ${sub.id}`,
            open: `https://review.udacity.com/#!/submissions/${sub.id}`,
            icon: path.join(__dirname, 'clipboard.svg'),
            sound: 'Ping'
          })
        })
        process.exit(0)
      })
  })

/**
* Starts requesting the Udacity Review API queue for assignments. Accepts
* a space separated list of project ids to request for.
*/
cli.command('assign <projectId> [moreIds...]')
  .description('poll the review queue for submissions')
  .option('-f, --feedbacks', 'periodically check for new feedbacks')
  .action((projectId, moreIds, options) => {
    const REQ_ASSIGNED_INTERVAL = 60
    const startTime = moment()
    let assigned = 0
    let callsTotal = 0
    let tick = 0
    let errorMsg = ''

    // Make a list of all the project ids entered by the user.
    let projectQueue = [projectId]
    if (moreIds) moreIds.forEach(id => projectQueue.push(id))

    validateInputIds(new Set(projectQueue))
    requestNewAssignment()

    /**
    * Checks how many submissions are currently assigned to the user at a
    * constant interval. If it's 2, it waits the length of the interval and
    * checks again. As long as it's less than 2 it requests a new assignment
    * once every second.
    */
    function requestNewAssignment () {
      // Check for new feedbacks every hour
      if (options.feedbacks && checkInterval(3600)) {
        setPrompt('checking feedbacks')
        apiCall(opts, 'feedbacks')
          .then(res => {
            processFeedbacks(res)
          })
      }
      // Check how many submissions have been assigned at a given interval.
      if (checkInterval(REQ_ASSIGNED_INTERVAL)) {
        setPrompt('checking assigned')
        apiCall(opts, 'assigned')
          .then(res => {
            assigned = res.body.length
          })
      } else {
        // If the max number of submissions is assigned we wait the interval.
        // Otherwise we request an assignment from the API.
        if (assigned === 2) {
          setPrompt(`Max submissions assigned. Checking again in ${REQ_ASSIGNED_INTERVAL - tick % REQ_ASSIGNED_INTERVAL} seconds.`)
        } else {
          let id = projectQueue[callsTotal % projectQueue.length]
          setPrompt(`Requesting assignment for project ${id}`)
          errorMsg = ''
          callsTotal++
          opts.method = 'POST'
          apiCall(opts, 'assign', id)
            .then(res => {
              if (res.statusCode === 201) {
                assigned++
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
        tick++
        requestNewAssignment()
      }, 1000)
    }

    function checkInterval (seconds) {
      return tick % seconds === 0
    }

    /**
    * Writes the current information to the terminal.
    */
    function setPrompt (msg) {
      readline.cursorTo(process.stdout, 0, 0)
      readline.clearScreenDown(process.stdout)
      if (config.auth.tokenAge - moment().dayOfYear() < 5) {
        rl.write(`Token expires ${moment().dayOfYear(config.auth.tokenAge).fromNow()}\n`.red)
      }
      rl.write(`Uptime: ${startTime.fromNow(true).white}\n`)
      rl.write(`Current task: ${msg.white}\n`)
      rl.write(`Total server requests: ${callsTotal}\n`.green)
      rl.write(`Currently assigned: ${assigned}\n`.green)
      if (errorMsg) rl.write(`Server responded with ${errorMsg}\n`.yellow)
      rl.write(`Press ${'ctrl+c'} twice to exit`)
    }

    /**
    * projectQueue can have multiple instances of the same project id, so we
    * test against the set of input ids.
    */
    function validateInputIds (ids) {
      const certifiedIds = new Set(config.certs.certified.map(p => p.id))
      const validIds = new Set([...ids].filter(id => certifiedIds.has(id)))
      if (ids.size !== validIds.size) {
        const difference = new Set([...ids].filter(id => !validIds.has(id)))
        throw new Error(`Illegal Action: Not certified for project(s) ${[...difference].join(', ')}`)
      }
    }
  })

/**
* Sends a desktop notifications to the user with the name of the projects
* that have been assigned and the id. It opens the review page for the
* submission if you click on the notification.
*/
cli.command('assigned')
  .description('get the submissions that are assigned to you')
  .action(() => {
    apiCall(opts, 'assigned')
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
        process.exit(0)
      })
  })

/**
* Gets the feedbacks for the last 30 days. All new feedbacks are saved.
*/
cli.command('feedbacks')
  .description('save recent feedbacks from the API')
  .action(() => {
    apiCall(opts, 'feedbacks')
      .then(res => {
        processFeedbacks(res)
        process.exit(0)
      })
  })

cli.arguments('<cmd>')
  .action((cmd) => {
    console.log(
        `\n ${`[ERROR] - Invalid command: ${cmd}`.red}
        \n Run "rqcli --help" for a list of available commands.\n`
      );
    process.exit(0);
  });

cli.parse(process.argv)

if (!cli.args.length) {
  cli.parse([process.argv[0], process.argv[1], '-h']);
  process.exit(0);
}

/**
* Saves every new feedback and notifies the user if it's unread.
*/
function processFeedbacks (res) {
  const savedIds = new Set(config.feedbacks.map(fb => fb.id))
  res.body
    // Find all the new feedbacks.
    .filter(fb => !savedIds.has(fb.id))
    .reverse()
    .forEach(fb => {
      // Notify the user if the feedback is unread.
      if (fb.read_at === null) {
        notifier.notify({
          title: `New ${fb.rating}-star Feedback!`,
          message: `Project: ${fb.project.name}`,
          open: `https://review.udacity.com/#!/submissions/${fb.submission_id}`,
          icon: path.join(__dirname, 'clipboard.png'),
          sound: 'Pop'
        })
      }
      config.feedbacks.unshift(fb)
    })
  // Save any new feedbacks.
  fs.writeFileSync('rqConfig.json', JSON.stringify(config, null, 2))
}
