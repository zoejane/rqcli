#!/usr/bin/env node

const chalk = require('chalk')
const apiCall = require('../utils').apiCall

let earned = 0
let reviewsCount = 0
let projects = {}
let ungradeable = {}

function countProject (review) {
  let id = review.project.id
  if (review.result === 'ungradeable') {
    ungradeable[id] = (ungradeable[id]) ? ungradeable[id] += 1 : 1
  } else {
    projects[id] = (projects[id]) ? projects[id] += 1 : 1
  }
  earned += parseInt(review.price)
}

module.exports = ({auth: {token}}, options) => {
  return new Promise((resolve, reject) => {
    apiCall(token, 'completed')
    .then(res => {
      reviewsCount = res.body.length
      let selected = selectedReviews(res.body, options)
      selected.forEach(review => {
        countProject(review)
      })
      print()
      resolve()
    })
  })
}

function print() {
  console.log(chalk.blue(`${earned}, ${reviewsCount}`))
  console.log(chalk.white(`${JSON.stringify(projects)}`))
  console.log(chalk.white(`${JSON.stringify(ungradeable)}`))
}

function selectedReviews (reviews, options) {
  if (options.from && options.to && options.days) {
    throw new Error('Too many options.')
  } else if (options.from && options.to) {
    console.log('from and to')    // Test if from > to: fail
  } else if (options.from && options.days) {
    console.log('from and days')
  } else if (options.to && option.days) {
    console.log('to and days')
  } else if (options.from) {
    console.log('from only')
  } else if (options.to) {
    console.log('to only')
  } else if (options.days) {
    console.log('days only')
  }
  return reviews
}
