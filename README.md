# CLI for Udacity Review API
##### API location: https://review.udacity.com/api-doc/index.html

### Description
A CLI for configuring and running API calls.

### Installation
**IMPORTANT** This project has not been published to npm yet, so the code below won't work.
```shell
npm install rqcli -g
```

### Setup
1. Start by running `rqcli token <yourToken>`. This will create the `apiConfig.json` file in which your account information will be stored.
2. Run `rqcli certs` which will get the projects you are certified for and save them in the config.
3. Check if you have any submissions currently assigned by running `rqcli assigned`.

### CLI commands

**token**
- _Stores an API Auth token_
- Arguments: `<token>`, your token which you can copy from your dashboard > API Access.

**certs**
- _Displays all of the project names with ids for which you are certified._
- Options: `-u`, `--update`, updates your certifications.

**assigned**
-_Notifies the user of submissions that are assigned to them._

### Project Styleguide

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
