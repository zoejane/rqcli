#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const winston = require('winston')
const readline = require('readline')
const moment = require('moment')
const chalk = require('chalk')
const assigned = require('./assigned')

winston.add(winston.transports.File, {
  filename: 'api/reviews.log'
})
const rl = readline.createInterface(process.stdin, process.stdout)

class Review {
  constructor (submission) {
    this.submission = submission
    this.id = submission.id
    this.script = this.loadScript(submission.project.id)
  }

  // Load a script if it exists in the project type folder
  loadScript (folderName) {
    try {
      return require(path.resolve(`${folderName}`))
    } catch (e) {
      if (e.code !== 'MODULE_NOT_FOUND') {
        throw new Error(e)
      }
    }
  }

  // Actions
  start () {
    winston.info({
      action: 'start',
      id: this.id,
      submission: this.submission
    })
    // Run scripts for the project type
    if (this.script) {
      this.script.pre(this.submission)
    }
    this.pauseOrEnd()
  }

  pause () {
    winston.info({
      action: 'pause',
      id: this.id
    })
    this.unpauseOrEnd()
  }

  unpause () {
    winston.info({
      action: 'unpause',
      id: this.id
    })
    this.pauseOrEnd()
  }

  end () {
    winston.info({
      action: 'end',
      id: this.id
    })
    // Run any cleanup scripts
    if (this.script) {
      this.script.post(this.submission)
    }
    process.exit(0)
  }

  exit () {
    winston.info({
      action: 'exit',
      id: this.id
    })
    process.exit(0)
  }

  // Prompting the user
  unpauseOrEnd () {
    Review.prompt('end or unpause?', ['unpause', 'end'])
    .then(answer => {
      this[answer]()
    })
  }

  pauseOrEnd () {
    Review.prompt('pause or end?', ['end', 'pause'])
    .then(answer => {
      this[answer]()
    })
  }

  static prompt (question, accept) {
    const preselected = accept[0]
    const valid = new Set(['exit', ...accept])

    return new Promise((resolve, reject) => {
      rl.question(`${question} (${preselected}): `, answer => {
        if (answer === '') {
          resolve(preselected)
        } else if (!valid.has(answer)) {
          reject('Invalid Command')
        } else {
          resolve(answer)
        }
      })
    })
    .catch(reason => {
      console.log(`${reason}. Available commands: ${[...valid].join(', ')}`)
      return this.prompt(question, accept)
    })
  }
}

// Choose when to start and which submission to review.
module.exports = (config) => {
  getAssignedSubmissions(config)
  .then(submissions => {
    printSubmissions(submissions)
    let accept = [...submissions.keys()].forEach(k => k.toString())
    Review.prompt('Start review?', accept)
    .then(answer => {
      const review = new Review(submissions[answer])
      review.start()
    })
  })
  .catch(reason => {
    console.log(reason)
    process.exit(0)
  })
}

// Get currently assigned submissions from the Udacity Reviews API.
function getAssignedSubmissions (config) {
  return new Promise((resolve, reject) => {
    assigned(config, {})
    .then(submissions => {
      if (!submissions.length) {
        reject('No submissions are currently assigned to you.')
      } else {
        resolve(submissions)
      }
    })
  })
}

// Print assigned submissions to the terminal
function printSubmissions (submissions) {
  console.log('Submission(s) ready for review:')
  submissions.forEach((sub, index) => {
    const when = moment(sub.assigned_at).fromNow()
    console.log(chalk.blue(`    ${chalk.white(`[${index}]`)} ${sub.project.name} (${sub.project.id}), assigned ${when}`))
  })
}
