#!/usr/bin/env node

const path = require('path')
const notifier = require('node-notifier')

module.exports = {
  notify (fb) {
    notifier.notify({
      title: `New ${fb.rating}-star Feedback!`,
      message: `Project: ${fb.project.name}`,
      open: `https://review.udacity.com/#!/reviews/${fb.submission_id}`,
      icon: path.join(__dirname, 'clipboard.png'),
      sound: 'Pop'
    })
  }
}
