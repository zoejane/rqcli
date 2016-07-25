#!/usr/bin/env node

const moment = require('moment')
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
      if (!validateOptions(options)) {
        throw Error('Error caused by invalid options.')
      }
      let selected = res.body

      let lastCompletedAt = selected[0].completed_at
      let monthStart = Date.parse(`2016-${options.month}`)
      let monthEnd = Date.parse(moment(monthStart).add(1, 'M'))

      selected.forEach(review => {
        let completed_at = Date.parse(review.completed_at)
        if (completed_at > monthStart && completed_at < monthEnd) {
          countProject(review)
        }
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

function validateOptions ({month}) {
  if (month) {
    month = validateMonth(month)
  }
  return month
}

function validateMonth (month) {
  if (options.month > 12 || options.month < 1) {
    return false
  }
  return true
}

function dateFromMonth(month) {
  // get current date
  // get the current month
  // if current month is less than seleceted month, subtract one year
  month = month < 10 ? `0${month}` : month
  return Date.parse()
}
