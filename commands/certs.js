#!/usr/bin/env node

const apiCall = require('../utils').apiCall

module.exports = ({certs, auth: {token}}, options) => {
  const update = options.update || !certs.certified
  return new Promise((resolve, reject) => {
    if (update) {
      apiCall(token, 'certifications')
        .then(res => {
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
        })
    } else {
      certs.show(certs.certified)
      resolve()
    }
  })
}
