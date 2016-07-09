const apiCall = require('../utils').apiCall

function shouldUpdate (config, options) {
  return options.update || !config.certs.certified
}

function getCerts (config) {
  let opts = config.reqOptions(config.auth.token)
  apiCall(opts, 'certifications')
    .then(res => {
      let certs = res.body
        .filter(cert => cert.status === 'certified')
        .map(cert => {
          return {
            name: cert.project.name,
            id: cert.project_id.toString()
          }
        })
      config.certs.save(certs)
      return certs
    })
    .then(certs => {
      config.certs.show(certs)
      process.exit(0)
    })
}

module.exports = (config, options = {}) => {
  if (shouldUpdate(config, options)) {
    getCerts(config)
  } else {
    config.certs.show(config.certs.certified)
    process.exit(0)
  }
}
