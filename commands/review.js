#!/usr/bin/env node

const path = require('path')
const readline = require('readline')
const moment = require('moment')
const chalk = require('chalk')
const apiCall = require('../utils').apiCall

const rl = readline.createInterface(process.stdin, process.stdout)

module.exports = ({auth: {token}}) => {
  return new Promise((resolve, reject) => {
    apiCall(token, 'assigned')
    .then(res => {
      let assigned = res.body
      let activeReview = 0
      let project
      if (assigned.length === 0) {
        console.log('No reviews are currently assigned to you.')
        return reject()
      }
      // Display assigned
      if (assigned.length > 1) {
        console.log(`Projects ready for review:`)
        assigned.forEach((review, i) => {
          console.log(chalk.blue(`    [${i}] ${printAssignment(review)}`))
        })

        rl.setPrompt(chalk.white('Choose a project: (0) '))
        rl.prompt()

        rl.on('line', answer => {
          if (project === undefined) {
            console.log(answer)
            let valid = new Set([0, 1])
            activeReview = validateInput(answer, 0, valid)
            project = assigned[activeReview]
            console.log(chalk.blue(`Project URL: https://review.udacity.com/#!/reviews/${project.id}`))
            console.log(chalk.blue(`Checking scripts for project ${project.project_id}`))
            runScript(project)
            rl.setPrompt(chalk.white(`Starting review. Press any key when you are done.`))
            rl.prompt()
          } else {
            console.log(`Review done at: ${moment().format('HH:mm')}`)
            rl.close()
          }
        })
      }
    })
  })
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

function printAssignment (review) {
  const when = moment(review.assigned_at).fromNow()
  return `${review.project.name} (${review.project.id}), assigned ${when}`
}

function checkForScript (projectId) {
  let script
  try {
    script = require(path.resolve(`${projectId}`))
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') {
      throw new Error(e)
    }
    console.log(e)
  }
  return script
}

function runScript (project) {
  let script = checkForScript(project.project_id)
  if (script === undefined) {
    console.log('No script found')
  } else {
    script(project)
  }
}
