#!/usr/bin/env node

const apiCall = require('../utils').apiCall
const notifier = require('node-notifier')

function desktopNotification (assigned) {
  assigned.forEach(fb => {
    notifier.notify({
      title: 'New Review Assigned!',
      message: `${projectName}, ID: ${id}`,
      open: `https://review.udacity.com/#!/submissions/${id}`,
      icon: path.join(__dirname, 'clipboard.svg'),
      sound: 'Ping'
    })
  })
}

/**
* Gets information on currently assigned submissions, if the user has any.
* @param: token The users active token.
* @returns: {Array} assigned A list of assigned submissions.
*/
module.exports = (({auth: {token}}, options) => {
  return new Promise((resolve, reject) => {
    apiCall(token, 'assigned')
    .then(res => {
      let assigned = res.body.map(sub => {
        return {
          projectName: sub.project.name,
          id: sub.id
        }
      })
      if (options.notify) {
        desktopNotification(assigned)
      }
      resolve(assigned)
    })
  })
})
