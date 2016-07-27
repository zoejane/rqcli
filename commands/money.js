#!/usr/bin/env node

const moment = require('moment')
const chalk = require('chalk')
const apiCall = require('../utils').apiCall

let errorMsg = ''
let selectedIntervals = []
let report

module.exports = ({auth: {token}}, months, options) => {
  validate(months, options)
  getDates(months, options)

  return new Promise((resolve, reject) => {
    apiCall(token, 'completed')
    .then(res => {
      selectedIntervals.forEach(interval => {
        report = newReport()
        res.body.forEach(review => {
          if (isInInterval(review, interval)) {
            countProject(review)
          }
        })
        printProject()
      })
      resolve()
    })
  })
}

// Reports

function newReport () {
  return {
    ungradeable: {},
    projects: {},
    totalEarned: 0
  }
}

function isInInterval (review, interval) {
  let completed_at = Date.parse(review.completed_at)
  return completed_at > interval[0] && completed_at < interval[1]
}

function countProject (review) {
  let id = review.project.id
  if (review.result === 'ungradeable') {
    if (report.ungradeable[id]) {
      report.ungradeable[id] += 1
    } else {
      report.ungradeable[id] = 1
    }
  } else {
    if (report.projects[id]) {
      report.projects[id] += 1
    } else {
      report.projects[id] = 1
    }
  }
  report.totalEarned += parseInt(review.price)
}

function printProject() {
  let {projects, ungradeable, totalEarned} = report
  console.log(chalk.white(`Projects: ${JSON.stringify(projects)}`))
  console.log(chalk.white(`Ungradeable: ${JSON.stringify(ungradeable)}`))
  console.log(chalk.blue(`Total Earned: ${totalEarned}`))
  console.log('---')
}

// Dates

function getDates (months, {from, to}) {
  if (months.length) {
    months.forEach(month => {
      let start = getMonthStart(month)
      let end = moment(start).add(1, 'M')
      selectedIntervals.push([Date.parse(start), Date.parse(end)])
    })
  }
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

// Validation

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

function validateMonth (month) {
  return true
}

function validateOptions (from, to) {
  return true
}

function printHelp () {
  console.log('printing help.')
}
