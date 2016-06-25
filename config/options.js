#!/usr/bin/env node

module.exports = token => {
  return {
    method: 'GET',
    headers: {
      Authorization: token
    },
    json: true
  }
}
