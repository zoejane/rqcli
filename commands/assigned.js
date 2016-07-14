#!/usr/bin/env node

const apiCall = require('../utils').apiCall

/**
* Gets information on currently assigned submissions, if the user has any.
* @param: token The users active token.
* @returns: {Array} assigned A list of assigned submissions.
*/
module.exports = (({auth: {token}}) => {
  return new Promise((resolve, reject) => {
    apiCall(token, 'assigned')
      .then(res => {
        let assigned = res.body.map(sub => {
          return {
            projectName: sub.project.name,
            id: sub.id
          }
        })
        resolve(assigned)
      })
  })
})
