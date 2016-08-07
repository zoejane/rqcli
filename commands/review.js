#!/usr/bin/env node

const path = require('path')
const readline = require('readline')
const moment = require('moment')
const chalk = require('chalk')
const bunyan = require('bunyan')
const assigned = require('./assigned')

// Creating a logger for reviewing projects.
const log = bunyan.createLogger({
  name: 'rqcli',
  streams: [{
    path: 'api/reviews.log'
  }]
})

const rl = readline.createInterface(process.stdin, process.stdout)

// Choose when to start and which submission to review.
function reviewSubmission (config) {
  getReviews(config)
  .then(reviews => {
    printReviews(reviews)
    let query = {
      question: 'Start review?',
      accept: reviews.map((r, i) => i.toString())
    }
    prompt(query)
    .then(answer => {
      actions.start(reviews[answer])
    })
  })
}

// Get currently assigned submissions from the Udacity Reviews API.
function getReviews (config) {
  return new Promise((resolve, reject) => {
    assigned(config, {})
    .then(reviews => {
      // Testcode
      reviews = require('../api/test.json')
      // Testcode
      if (!reviews.length) {
        console.log('No reviews are currently assigned to you.')
        return reject()
      }
      resolve(reviews)
    })
  })
}

// Ask the user a question.
function prompt (query) {
  // The first element of the accepted values will be the default.
  const preselected = query.accept[0]
  const accept = new Set(['exit', ...query.accept])

  return new Promise((resolve, reject) => {
    rl.question(`${query.question} (${preselected}): `, answer => {
      if (answer === 'exit') {
        process.exit(0)
      }
      if (answer === '') {
        resolve(preselected)
      } else if (!accept.has(answer)) {
        reject(answer)
      } else {
        resolve(answer)
      }
    })
  })
  .catch(answer => {
    console.log(`Invalid command. Use one of: ${[...accept].join(', ')}`)
    return prompt(query)
  })
}

// Run a script from the project type folder if there is any to run.
function runScript (submission) {
  const script = checkForScript(submission.project_id)

  if (!script) {
    console.log('No script found')
  } else {
    script(submission)
  }
}

// See if a script exists in the project type folder
function checkForScript (folderName) {
  try {
    return require(path.resolve(`${folderName}`))
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') {
      throw new Error(e)
    }
  }
}

// Print assigned submissions to the terminal
function printReviews (reviews) {
  console.log('Project(s) ready for review:')
  reviews.forEach((review, i) => {
    const when = moment(review.assigned_at).fromNow()
    console.log(chalk.blue(
      `    [${i}] ${review.project.name} (${review.project.id}), assigned ${when}`))
  })
}

// Actions available while reviewing.
const actions = {
  start (review, restart=false) {
    if (!restart) {
      // Run any scripts associated with a project type.
      runScript(review)
      log.info({review: review}, 'start')
    }
    let query = {
      question: 'pause or end?',
      accept: ['end', 'pause']
    }
    prompt(query)
    .then(answer => {
      actions[answer](review)
    })
  },
  pause (review) {
    let query = {
      question: 'end or unpause?',
      accept: ['unpause', 'end']
    }
    prompt(query)
    .then(answer => {
      actions[answer](review)
    })
  },
  unpause (review) {
    log.info({review: review}, 'restart')
    actions.start(review, true)
  },
  end (review) {
    log.info({review: review}, 'end')
    process.exit(0)
  }
}

module.exports = reviewSubmission
