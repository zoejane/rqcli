const fs = require('fs')
const chalk = require('chalk')

module.exports = dir => {
  try {
    fs.statSync(dir)
  } catch (e) {
    if (e.code !== 'ENOENT') {
      throw new Error(e)
    } else {
      console.log(chalk.red('Warning: No authentication information found.'))
      console.log(chalk.blue('    Are you sure you are in the right folder?'))
      console.log(chalk.blue('    Run the "setup" command to get started using the CLI.'))
      process.exit(0)
    }
  }
}
