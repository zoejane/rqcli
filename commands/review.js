#!/usr/bin/env node

const path = require('path')
const readline = require('readline')
const moment = require('moment')
const chalk = require('chalk')
const assigned = require('./assigned')

const rl = readline.createInterface(process.stdin, process.stdout)

function askUser (query) {
  return new Promise((resolve, reject) => {
    rl.question(`${query} `, function (value) {
      resolve(value)
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

module.exports = (config) => {
  return new Promise((resolve, reject) => {
    getReviews(config)
    .then(reviews => {
      let activeReview = reviews[0]
      if (reviews.length > 1) {
        console.log('Projects ready for review:')
        reviews.forEach((review, i) => {
          const when = moment(review.assigned_at).fromNow()
          console.log(chalk.blue(
            `    [${i}] ${review.project.name} (${review.project.id}), assigned ${when}`))
        })
        askUser('Choose a project (0):')
        .then(val => {
          if (val) {
            activeReview = reviews[1]
          }
        })
      }
      console.log('hi')
      process.exit(0)
    })
    .catch(() => {
      console.log('caught')
      process.exit(0)
    })
  })
}

function runScript (project) {
  let script = checkForScript(project.project_id)
  if (script === undefined) {
    console.log('No script found')
  } else {
    script(project)
  }
}

function checkForScript (projectId) {
  let script
  try {
    script = require(path.resolve(`${projectId}`))
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') {
      throw new Error(e)
    }
    console.log('No scripts to run.')
  }
  return script
}

function validateInput (input, defaultValue, valid) {
  let answer = input === '' ? defaultValue : input
  if (typeof valid[0] === 'number') {
    answer = parseInt(answer)
  }
  if (!valid.has(answer)) {
    throw new Error('Wrong input.')
  }
  return answer
}
