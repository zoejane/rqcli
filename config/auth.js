#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

let auth = {
  save (token, tokenAge) {
    try {
      fs.mkdirSync(path.resolve('api'))
    } catch (e) {
      if (e.code !== 'EEXIST') {
        throw new Error(e)
      }
    }
    fs.writeFileSync(path.resolve('api/auth.json'), JSON.stringify({
      token: token,
      tokenAge: tokenAge
    }, null, 2))
  }
}

// Try to get the token and create an auth file if it doesn't exist.
try {
  auth.token = require(path.resolve('api/auth.json')).token
  auth.tokenAge = require(path.resolve('api/auth.json')).tokenAge
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') {
    throw new Error(e)
  }
}

module.exports = auth
