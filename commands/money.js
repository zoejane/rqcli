#!/usr/bin/env node

const moment = require('moment')
const chalk = require('chalk')
const apiCall = require('../utils').apiCall

let earned = 0
let reviewsCount = 0
let projects = {}
let ungradeable = {}
let errorMsg = ''
let selectedIntervals = []

function countProject (review) {
  let id = review.project.id
  if (review.result === 'ungradeable') {
    ungradeable[id] = (ungradeable[id]) ? ungradeable[id] += 1 : 1
  } else {
    projects[id] = (projects[id]) ? projects[id] += 1 : 1
  }
  earned += parseInt(review.price)
}

module.exports = ({auth: {token}}, months, options) => {
  validate(months, options)
  getDates(months, options)

  return new Promise((resolve, reject) => {
    apiCall(token, 'completed')
    .then(res => {
      selectedIntervals.forEach(interval => {
        earned = 0
        reviewsCount = 0
        projects = {}
        ungradeable = {}
        res.body.forEach(review => {
          let completed_at = Date.parse(review.completed_at)
          if (completed_at > interval[0] && completed_at < interval[1]) {
            countProject(review)
          }
        })
        print()
      })
      resolve()
    })
  })
}

function getDates (months, {from, to}) {
  if (months.length) {
    months.forEach(month => {
      let start = getMonthStart(month)
      let end = moment(start).add(1, 'M')
      selectedIntervals.push([Date.parse(start), Date.parse(end)])
    })
  }
  if (!from && !to) return
  let start = from ? Date.parse(from) : 0
  let end = to ? Date.parse(to) : Date.parse(new Date())
  selectedIntervals.push([start, end])
}

function getMonthStart (month) {
  let currentYear = moment().year()
  if (month.length > 2) {
    return month
  }
  if (month.length === 1) {
    return `${currentYear}-0${month}`
  }
  return `${currentYear}-${month}`
}

function validate (months, {from, to}) {
  if (months.length) {
    months.forEach(month => {
      if (!validateMonth(month)) {
        throw new Error(errorMsg)
      }
    })
  } else if (from || to) {
    if (!validateOptions(from, to)) {
      throw new Error(errorMsg)
    }
  } else {
    printHelp()
  }
}

function print() {
  console.log(chalk.blue(`${earned}, ${reviewsCount}`))
  console.log(chalk.white(`${JSON.stringify(projects)}`))
  console.log(chalk.white(`${JSON.stringify(ungradeable)}`))
  console.log('---')
}

function validateMonth (month) {
  return true
}

function validateOptions (from, to) {
  return true
}
