#!/usr/bin/env node

const fs = require('fs')
const program = require('commander')
const config = require('./apiConfig')

program
  .command('token <token>')
  .description('set the token')
  .action(token => {
    config.token = token
    fs.writeFileSync('apiConfig.json', JSON.stringify(config, null, 2))
  })

program.parse(process.argv)
