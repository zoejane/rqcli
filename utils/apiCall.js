#!/usr/bin/env node

const request = require('request')

/**
* Concatenate the parts of an endpoint url from a task and an id.
* @param {string} task The name of the task to be requested
* @param {string} id The id of either a project or a submission
* @return {string} The endpoint URL
*/
function url (task, id) {
  let base = 'https://review-api.udacity.com/api/v1'
  return {
    'certifications': `${base}/me/certifications/`,
    'assigned': `${base}/me/submissions/assigned/`,
    'submissions': `${base}/me/submissions/`,
    'feedbacks': `${base}/me/student_feedbacks/`,
    'stats': `${base}/me/student_feedbacks_stats/`,
    'completed': `${base}/me/submissions/completed/`,
    'assign': `${base}/projects/${id}/submissions/assign`,
    'unassign': `${base}/submissions/${id}/unassign`
  }[task]
}

let options = {
  method: 'GET',
  headers: {
    Authorization: ''
  },
  json: true
}

/**
* @desc apiCall Calls an endpoint.
* @param {string} options The options object.
* @param {string} task The task to be requested.
* @param {string} id The id of the project or the submission.
* @return Promise with the response.
*/
module.exports = (options, task, id = '') => {
  options.url = url(task, id)
  return new Promise((resolve, reject) => {
    request(options, (err, res, body) => {
      if (err) {
        reject(err)
      } else if (res.statusCode === 401) {
        throw new Error('401: Unauthorized')
      }
      resolve(res)
    })
  })
}
