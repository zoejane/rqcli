const apiCall = require('../utils').apiCall

module.exports = ({certs, reqOptions, auth: {token}}, options) => {
  const update = options.update || !certs.certified
  return new Promise((resolve, reject) => {
    if (update) {
      const opts = reqOptions(token)
      apiCall(opts, 'certifications')
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
          resolve(updatedCerts)
        })
    } else {
      resolve(certs.certified)
    }
  })
}
