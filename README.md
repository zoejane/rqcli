# CLI for Udacity Review API
##### API location: https://review.udacity.com/api-doc/index.html

### Description
A CLI for configuring and running API calls.

### Setup
1. Start by running `rqcli token <yourToken>`. This will create the `apiConfig.json` file in which your account information will be stored.
2. Run `rqcli certs` which will get the projects you are certified for and save them in the config.

### CLI commands

**token**
_Stores an API Auth token_
- Argument: `<token>`, your token which you can copy from your dashboard > API Access.

**certs**
_Displays all of the project names with ids for which you are certified._
- Options: `-u`, `--update`, updates your certifications.

### Project Styleguide

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
