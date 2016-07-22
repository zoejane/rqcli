#!/usr/bin/env node

const readline = require('readline')
const moment = require('moment')
const chalk = require('chalk')
const apiCall = require('../utils').apiCall

const rl = readline.createInterface(process.stdin, process.stdout)

const alt = require('../api/test.json')

module.exports = ({auth: {token}}) => {
  return new Promise((resolve, reject) => {
    apiCall(token, 'assigned')
    .then(res => {
      let assigned = res.body
      let activeReview = 0
      let chosenAssignment
      if (assigned.length === 0) {
        assigned = alt // testing
        // console.log('No reviews are currently assigned to you.')
        // reject()
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
          if (chosenAssignment === undefined) {
            activeReview = answer === '' ? 0 : parseInt(answer)
            if (activeReview !== 0 && activeReview !== 1) throw new Error('Invalid answer.')
            chosenAssignment = assigned[activeReview]
            console.log(`Project URL: https://review.udacity.com/#!/reviews/${chosenAssignment.id}`)
            rl.setPrompt(`Starting review. Press any key when you are done.`)
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

function printAssignment (review) {
  const when = moment(review.assigned_at).fromNow()
  return `${review.project.name} (${review.project.id}), assigned ${when}`
}
