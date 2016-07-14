#!/usr/bin/env node

const moment = require('moment')

/**
* Saves a new token and the day of the year as the tokenAge.
* @param: config The config object.
* @param: token The token to be saved.
* @returns: {String} token The token that was saved.
*/
module.exports = (({auth: {save}}, newToken) => {
  return new Promise((resolve, reject) => {
    let tokenAge = moment().dayOfYear() + 30
    save(newToken, tokenAge)
    resolve(newToken)
  })
})
