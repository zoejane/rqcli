#!/usr/bin/env node

const path = require('path')
const readline = require('readline')
const moment = require('moment')
const chalk = require('chalk')
const assigned = require('./assigned')

const rl = readline.createInterface(process.stdin, process.stdout)

const actions = {
  start (review, restart=false) {
    if (!restart) {
      runScript(review)
      startLog(review)
    }
    askUser('Pause or end? (end):', 'end', ['pause', 'end'])
    .then(answer => {
      actions[answer](review)
    })
  },
  end (review) {
    endLog(review)
    console.log('Review done.')
    process.exit(0)
  },
  pause (review) {
    askUser('unpause or end? (unpause):', 'unpause', ['unpause', 'end'])
    .then(answer => {
      actions[answer]
    })
  },
  unpause (review) {
    restartLog(review)
    actions.start(review, true)
  }
}

module.exports = (config) => {
  return new Promise((resolve, reject) => {
    getReviews(config)
    .then(reviews => {
      printReviews(reviews)

      askUser('Start review? (0):', '0', reviews.map((r, i) => i.toString()))
      .then(answer => {
        actions.start(reviews[answer])
      })
      .catch(err => {
        console.log(err)
      })
    })
  })
}

function startLog (review) {
  console.log('starting logs')
}

function restartLog (review) {
  console.log('restarting logs')
}

function endLog (review) {
  console.log('ending logs')
}

function askUser (query, preselected, accept) {
  valid = new Set(['exit', ...accept])
  return new Promise((resolve, reject) => {
    rl.question(`${query} `, answer => {
      if (answer === 'exit') {
        console.log('Exiting...')
        process.exit(0)
      }
      if (answer === '') {
        resolve(preselected)
      } else if (!valid.has(answer)) {
        console.log('Invalid command. Please select one of the following commands:')
        console.log([...valid].join(', '))
        askUser(query, preselected, accept)
      } else {
        resolve(answer)
      }
    })
  })
}

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

function runScript (submission) {
  const script = checkForScript(submission.project_id)

  if (!script) {
    console.log('No script found')
  } else {
    script(submission)
  }
}

function checkForScript (folderName) {
  try {
    return require(path.resolve(`${folderName}`))
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') {
      throw new Error(e)
    }
  }
}

function printReviews (reviews) {
  console.log('Project(s) ready for review:')
  reviews.forEach((review, i) => {
    const when = moment(review.assigned_at).fromNow()
    console.log(chalk.blue(
      `    [${i}] ${review.project.name} (${review.project.id}), assigned ${when}`))
  })
}
