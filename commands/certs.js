#!/usr/bin/env node

const apiCall = require('../utils').apiCall

module.exports = ({certs, auth: {token}}, options) => {
  const update = options.update || !certs.certified
  return new Promise((resolve, reject) => {
    if (update) {
      console.log('Updating certifications...')
      apiCall(token, 'certifications')
        .then(res => {
          if (res.statusCode === 200) {
            let updatedCerts = res.body
              .filter(cert => cert.status === 'certified')
              .map(cert => {
                return {
                  name: cert.project.name,
                  id: cert.project_id.toString()
                }
              })
            certs.save(updatedCerts)
            certs.show(updatedCerts)
            resolve()
          } else if (res.statusCode === 500) {
            console.log('An error has occured.')
            console.log('This is probably because of a bad/outdated token.')
            reject(`    Internal Server Error: statusCode: ${res.statusCode}.`)
          } else {
            reject(`Error: statusCode: ${res.statusCode}`)
          }
        })
        .catch(err => {
          // If the API call returns an error.
          console.log(`API call returned an error: ${err}`)
          process.exit(0)
        })
    } else {
      certs.show(certs.certified)
      resolve()
    }
  })
}
