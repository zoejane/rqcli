#!/usr/bin/env node

const moment = require('moment')
const chalk = require('chalk')
const apiCall = require('../utils').apiCall

let selectedIntervals = []
let report

module.exports = ({auth: {token}}, months, options) => {
  validate(months, options)
  makeSelectedIntervals(months, options)

  return new Promise((resolve, reject) => {
    apiCall(token, 'completed')
    .then(res => {
      printReports(res.body)
      resolve()
    })
    .catch(err => {
      reject(`API call returned an error: ${err}`)
    })
  })
}

/**
* Validates the dates the user input.
* @param {Array} months - The months the user selected.
* @param {Object} options - The options the user selected.
* @throws Will throw an error if any dates are invalid.
*/
function validate (months, options) {
  if (months.length) {
    months.forEach(month => {
      if (!validateMonth(month)) {
        throw new Error(`Invalid month: ${month}.`)
      }
    })
  }
  if (options.from || options.to) {
    if (!validateOptions(options)) {
      throw new Error('Invalid options.')
    }
  }
}

function validateMonth (month) {
  // We are assuming that a month-string with more than two characters includes
  // the year. In that case moment(date)._pf.iso evaluates to true if the
  // argument is a valid date.
  return month.length <= 2 ? parseInt(month) > 0 && parseInt(month) < 13
                           : moment(month)._pf.iso
}

function validateOptions ({from, to}) {
  // moment(date)._pf.iso evaluates to true if the argument is a valid date.
  return (from && to) ? moment(from)._pf.iso && moment(to)._pf.iso
                      : moment(from)._pf.iso || moment(to)._pf.iso
}

/**
* Creates the start and end dates for each interval the user has selected.
* @param {Array} months - The months the user selected.
* @param {string} from - The --from option.
* @param {string} to - The --to option.
*/
function makeSelectedIntervals (months, {from, to}) {
  // Make month intervals
  if (months.length) {
    months.forEach(month => {
      let start = getMonthStart(month)
      let end = moment(start).add(1, 'M')
      selectedIntervals.push([Date.parse(start), Date.parse(end)])
    })
  }
  // Make opiton intervals
  if (from || to) {
    let start = from ? Date.parse(from) : 0
    let end = to ? Date.parse(to) : Date.parse(new Date())
    selectedIntervals.push([start, end])
  }
  // Make default intervals
  if (!months.length && !from && !to) {
    let start = getMonthStart(moment().month() + 1)
    let end = new Date()
    selectedIntervals.push([Date.parse(start), Date.parse(end)])
    selectedIntervals.push([Date.parse(0), Date.parse(end)])
  }
}

// Returns a correctly formatted string for the start of a month.
function getMonthStart (month) {
  if (month.length > 2) {
    return month
  }
  let currentYear = moment().year()
  if (month.length === 1) {
    return `${currentYear}-0${month}`
  }
  return `${currentYear}-${month}`
}

/**
* Creates an earnings report for each interval the user has selected, and prints
* it to the console.
* @param {Array} reviews - The list of completed reviews returned by the API.
*/
function printReports (reviews) {
  selectedIntervals.forEach(interval => {
    createReport(reviews, interval)
    printReport(interval)
  })
}

// Makes an earnings report for a given interval.
function createReport (reviews, interval) {
  report = {
    projects: {},
    totalEarned: 0
  }
  reviews.forEach(review => {
    if (isInInterval(review, interval)) {
      countReview(review)
    }
  })
}

// Chekcs if the review was completed within the interval.
function isInInterval (review, interval) {
  let completedAt = Date.parse(review.completed_at)
  return completedAt > interval[0] && completedAt < interval[1]
}

// Counts a review for an earnings report when it's included int the interval.
function countReview (review) {
  let id = review.project_id
  let price = parseInt(review.price)

  // If the report does not yet contain an entry for the project type, create
  // the entry and try counting the review again.
  if (!report.projects[id]) {
    report.projects[id] = {
      name: review.project.name,
      id: id,
      passed: 0,
      failed: 0,
      ungradeable: 0,
      earned: 0
    }
    countReview(review)
  }
  report.projects[id][review.result] += 1
  report.projects[id].earned += price
  report.totalEarned += price
}

// Logs an eanings report to the console.
function printReport (interval) {
  let {projects, totalEarned} = report
  let startDate = moment(interval[0]).format('YYYY-MM-DD')
  let endDate = moment(interval[1]).format('YYYY-MM-DD')

  console.log('========================================')
  console.log(chalk.blue(`Earnings Report for ${startDate} to ${endDate}:`))
  for (project in projects) {
    let {name, id, ungradeable, passed, failed, earned} = projects[project]
    console.log(`
    ${chalk.white(`Project: ${name} (${id}):`)}
        ${chalk.white(`Total reviewed: ${passed + failed}`)}
        ${chalk.white(`Ungradeable: ${ungradeable}`)}
        ${chalk.white(`Total earned: ${earned}`)}
        `)
  }
  console.log(chalk.bgBlack.white(`Total Earned: ${totalEarned}`))
  console.log('========================================')
}
