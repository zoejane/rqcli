#!/usr/bin/env node

const moment = require('moment')
const chalk = require('chalk')
const apiCall = require('../utils').apiCall

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
        printReport(interval)
      })
      resolve()
    })
  })
}

// Reports
function newReport () {
  return {
    projects: {},
    totalEarned: 0
  }
}

function isInInterval (review, interval) {
  let completed_at = Date.parse(review.completed_at)
  return completed_at > interval[0] && completed_at < interval[1]
}

function countProject (review) {
  let id = review.project_id
  let price = parseInt(review.price)

  if (!report.projects[id]) {
    report.projects[id] = {
      name: review.project.name,
      id: id,
      passed: 0,
      failed: 0,
      ungradeable: 0,
      earned: 0
    }
    countProject(review)
  }

  report.projects[id][review.result] += 1
  report.projects[id].earned += price
  report.totalEarned += price
}

function printReport (interval) {
  let {projects, totalEarned} = report
  let startDate = moment(interval[0]).format('YYYY-MM-DD')
  let endDate = moment(interval[1]).format('YYYY-MM-DD')
  console.log('========================================')
  console.log(chalk.blue(`Earnings Report for ${startDate} to ${endDate}:\n`))
  for (project in projects) {
    let {name, id, ungradeable, passed, failed, earned} = projects[project]
    console.log(`    Project: ${name} (${id}):`)
    console.log(chalk.white(`        Total reviewed: ${passed + failed}`))
    console.log(chalk.white(`        Ungradeable: ${ungradeable}`))
    console.log(chalk.white(`        Total earned: ${earned}\n`))
  }
  console.log(chalk.bgBlack.white(`Total Earned: ${totalEarned}`))
  console.log('========================================')
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
  if (from || to) {
    let start = from ? Date.parse(from) : 0
    let end = to ? Date.parse(to) : Date.parse(new Date())
    selectedIntervals.push([start, end])
  }
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
function validate (months, options) {
  if (months.length) {
    months.forEach(month => {
      if (!validateMonth(month)) {
        throw new Error('Invalid month: ${month}.')
      }
    })
  } else if (options.from || options.to) {
    if (!validateOptions(options)) {
      throw new Error('Invalid options.')
    }
  }
}

// Really basic validation of date input.
function validateMonth (month) {
  let currentMonth = moment().month() + 1
  if (month.length > 2) {
    return moment(month)._pf.iso
  } else if (month.length <= 2) {
    if (month.length > 12 || month.length < 1 || parseInt(month) > currentMonth) {
      return false
    }
    return true
  }
}

function validateOptions ({from, to}) {
  console.log(moment(from)._pf.iso, moment(to)._pf.iso)
  if (from && to) {
    return moment(from)._pf.iso && moment(to)._pf.iso
  }
  if (from) {
    return moment(from)._pf.iso
  }
  return moment(to)._pf.iso
}
