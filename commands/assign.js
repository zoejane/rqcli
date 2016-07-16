#!/usr/bin/env node

const path = require('path')
const moment = require('moment')
const apiCall = require('../utils').apiCall
const notifier = require('node-notifier')
const readline = require('readline')
const feedbacks = require('./feedbacks')

module.exports = (config, projectQueue, options) => {
  // Using sets to validate input ids.
  const certIds = new Set(config.certs.certified.map(x => x.id))
  const invalidIds = new Set(projectQueue.filter(id => !certIds.has(id)))
  if (invalidIds.size) {
    throw new Error(
      `Illegal Action: Not certified for project(s) ${[...invalidIds].join(', ')}`)
  }

  const {auth: {token, tokenAge}} = config
  const startTime = moment()
  const assignedInterval = 60
  const feedbacksInterval = 3600

  let assigned = 0
  let unreadFeedbacks = 0
  let callsTotal = 0
  let errorMsg = ''
  let tick = 0

  const checkInterval = seconds => tick % seconds === 0
  const countdown = interval => interval - tick % interval
  const tokenExpiryWarning = () => tokenAge - moment().dayOfYear() < 5

  /**
  * Checks how many submissions are currently assigned to the user at a
  * constant interval. If it's 2, it waits the length of the interval and
  * checks again. As long as it's less than 2 it requests a new assignment
  * once every second.
  */
  function requestNewAssignment () {
    // Check for new feedbacks every hour
    if (options.feedbacks && checkInterval(feedbacksInterval)) {
      feedbacks(config, options)
      .then(unread => {
        unreadFeedbacks = unread.length
      })
    }
    // Check how many submissions have been assigned at a given interval.
    if (checkInterval(assignedInterval)) {
      apiCall(token, 'assigned')
      .then(res => {
        assigned = res.body.length
      })
    }
    // If the max number of submissions is assigned we wait the interval.
    // Otherwise we request an assignment from the API.
    if (assigned === 2) {
      setPrompt(`Max submissions assigned. Checking again in ${countdown(assignedInterval)} seconds.`)
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
    setTimeout(() => {
      tick++
      requestNewAssignment()
    }, 1000)
  }
  requestNewAssignment()

  /**
  * Writes the current information to the terminal.
  */
  function setPrompt (msg) {
    readline.cursorTo(process.stdout, 0, 0)
    readline.clearScreenDown(process.stdout)
    if (tokenExpiryWarning()) {
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
}

