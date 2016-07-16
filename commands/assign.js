#!/usr/bin/env node

const path = require('path')
const moment = require('moment')
const apiCall = require('../utils').apiCall
const notifier = require('node-notifier')
const readline = require('readline')
const feedbacks = require('./feedbacks')

const REQ_ASSIGNED_INTERVAL = 60
const startTime = moment()
const projectQueue = []
let token, tokenAge

let assigned = 0
let unreadFeedbacks = 0
let callsTotal = 0
let tick = 0
let errorMsg = ''

const checkInterval = seconds => tick % seconds === 0
const countdown = interval => interval - tick % interval

/**
* Checks how many submissions are currently assigned to the user at a
* constant interval. If it's 2, it waits the length of the interval and
* checks again. As long as it's less than 2 it requests a new assignment
* once every second.
*/
function requestNewAssignment (config, options) {
  // Check for new feedbacks every hour
  if (options.feedbacks && checkInterval(3600)) {
    feedbacks(config, options)
    .then(unread => {
      unreadFeedbacks = unread.length
    })
  }
  // Check how many submissions have been assigned at a given interval.
  if (checkInterval(REQ_ASSIGNED_INTERVAL)) {
    setPrompt('checking assigned')
    apiCall(token, 'assigned')
    .then(res => {
      assigned = res.body.length
    })
  } else {
    // If the max number of submissions is assigned we wait the interval.
    // Otherwise we request an assignment from the API.
    if (assigned === 2) {
      setPrompt(`Max submissions assigned. Checking again in ${countdown(REQ_ASSIGNED_INTERVAL)} seconds.`)
    } else {
      let projectId = projectQueue[callsTotal % projectQueue.length]
      setPrompt(`Requesting assignment for project ${projectId}`)
      errorMsg = ''
      callsTotal++
      apiCall(token, 'assign', projectId)
      .then(res => {
        if (res.statusCode === 201) {
          assigned++
          let name = res.body.project.name
          let id = res.body.id
          notifier.notify({
            title: 'New Review Assigned!',
            message: `${name}, ID: ${id}`,
            open: `https://review.udacity.com/#!/submissions/${id}`,
            icon: path.join(__dirname, 'clipboard.svg'),
            sound: 'Ping'
          })
        } else if (res.statusCode !== 404) {
          errorMsg = res.statusCode
        }
      })
    }
  }
  setTimeout(() => {
    tick++
    requestNewAssignment(config, options)
  }, 1000)
}

/**
* Writes the current information to the terminal.
*/
function setPrompt (msg) {
  readline.cursorTo(process.stdout, 0, 0)
  readline.clearScreenDown(process.stdout)
  if (tokenAge - moment().dayOfYear() < 5) {
    console.log(`Token expires ${moment().dayOfYear(tokenAge).fromNow()}`)
  }
  console.log(`Uptime: ${startTime.fromNow(true)}`)
  console.log(`Current task: ${msg}`)
  console.log(`Total server requests: ${callsTotal}`)
  console.log(`Currently assigned: ${assigned}`)
  if (unreadFeedbacks) {
    console.log(`You have ${unreadFeedbacks} unread feedbacks.`)
  }
  if (errorMsg) {
    console.log(`Server responded with ${errorMsg}`)
  }
  console.log(`Press ${'ctrl+c'} twice to exit`)
}

// Make a list of all the project ids entered by the user.
function createProjectQueue (projectId, moreIds) {
  projectQueue.push(projectId)
  moreIds.forEach(id => {
    projectQueue.push(id)
  })
}

// Validate user input
function validate (certs) {
  const certifiedIds = new Set(certs.map(p => p.id))
  const userInputIds = new Set(projectQueue)
  const validIds = new Set([...userInputIds].filter(id => certifiedIds.has(id)))
  if (userInputIds.size !== validIds.size) {
    const difference = new Set([...userInputIds].filter(id => !validIds.has(id)))
    throw new Error(`Illegal Action: Not certified for project(s) ${[...difference].join(', ')}`)
  }
}

module.exports = (config, projectId, moreIds, options) => {
  tokenAge = config.auth.tokenAge
  token = config.auth.token
  createProjectQueue(projectId, moreIds)
  validate(config.certs.certified)
  requestNewAssignment(config, options)
}

