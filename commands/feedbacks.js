#!/usr/bin/env node

const apiCall = require('../utils').apiCall
const path = require('path')
const notifier = require('node-notifier')

function desktopNotification (unread) {
  unread.forEach(fb => {
    notifier.notify({
      title: `New ${fb.rating}-star Feedback!`,
      message: `Project: ${fb.project.name}`,
      open: `https://review.udacity.com/#!/submissions/${fb.submission_id}`,
      icon: path.join(__dirname, 'clipboard.png'),
      sound: 'Pop'
    })
  })
}

/**
* Gets the feedbacks for the last 30 days. All new feedbacks are saved.
*/
module.exports = (({auth: {token}}, options) => {
  return new Promise((resolve, reject) => {
    apiCall(token, 'feedbacks')
    .then(res => {
      let unread = res.body.filter(fb => fb.read_at === null)
      if (options.notify) {
        desktopNotification(unread)
      }
      resolve(unread)
    })
  })
})
