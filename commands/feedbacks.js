#!/usr/bin/env node

const apiCall = require('../utils').apiCall

/**
* Gets the feedbacks for the last 30 days. All new feedbacks are saved.
*/
module.exports = ((config, options = {}) => {
  return new Promise((resolve, reject) => {
    apiCall(config.auth.token, 'feedbacks')
    .then(res => {
      let unread = res.body.filter(fb => fb.read_at === null)
      if (options.notify) {
        unread.forEach(fb => {
          config.feedbacks.notify(fb)
        })
      }
      resolve(unread)
    })
  })
})
