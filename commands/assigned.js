#!/usr/bin/env node

const apiCall = require('../utils').apiCall
const moment = require('moment')
const notifier = require('node-notifier')

function desktopNotification (reviews) {
  reviews.forEach(review => {
    let when = moment(review.assigned_at).format('HH:mm')

    notifier.notify({
      title: `Project: ${review.project.name}: `,
      message: `Assigned: ${when}, ID: ${review.id}`,
      open: `https://review.udacity.com/#!/submissions/${review.id}`,
      sound: 'Ping'
    })
  })
}

/**
* Gets information on currently assigned submissions, if the user has any.
* @param: token The users active token.
* @returns: {Array} res.body A list of submissions assigned for review.
*/
module.exports = ({auth: {token}}, options) => {
  return new Promise((resolve, reject) => {
    apiCall(token, 'assigned')
    .then(res => {
      if (options.notify) {
        desktopNotification(res.body)
      }
      resolve(res.body)
    })
  })
}
