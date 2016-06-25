#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

let certs = {
  save (certs) {
    try {
      fs.mkdirSync('api')
    } catch (e) {
      if (e.code !== 'EEXIST') {
        throw new Error(e)
      }
    }
    fs.writeFileSync(path.resolve('api/certs.json'), JSON.stringify(certs), null, 2)
    console.log('Certifications have been saved.')
  },
  show (certs) {
    certs.forEach(elem => {
      console.log(`Project Name: ${elem.name}, Project ID: ${elem.id}`)
    })
    process.exit(0)
  }
}

try {
  certs.certified = require(path.resolve('api/certs.json'))
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') {
    throw new Error(e)
  }
}

module.exports = certs
