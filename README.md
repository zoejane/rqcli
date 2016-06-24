# CLI for Udacity Review API
##### API location: https://review.udacity.com/api-doc/index.html

# Description
A CLI for configuring and running API calls against the Udacity Review API.

# Installation
```shell
npm install rqcli -g
```

# Setup

##### LEGEND
- Arguments inside `< >` are required.
- Arguments inside `[ ]` are optional.
- Arguments that start with `--` are options.
- Arguments that start with `-` are shortcuts for an option.

Start by running `rqcli setup <yourToken>`. Some tokens include dashes (`-`) and these must be in quotes (`"token-moretoken"`).
- This will create the `rqConfig.json` file where your token, certifications, and feedbacks are then stored.
- You will be notified of any submissions currently assigned.
- You will also be notified of any unread feedbacks.

# CLI commands

#### `setup`
- Command: `rqcli setup <token>`
- Description: _Sets up the config file with token, certifications and feedbacks. Also notifies the user of any submissions that are currently assigned._
- Arguments: `<token>`, your token which you can copy from your dashboard > API Access. Some tokens include dashes (`-`) and these must be in quotes (`"token-moretoken"`).

#### `assign`
- Command: `rqcli assign <projectId> [moreIds] --feedbacks`
- Description: _Starts requesting the Udacity Review API queue for assignments of the type specified in the commands arguments._
- Arguments: `<projectId> [moreIds...]`, space separated list of project ids to request for.
- Options: `-f`, `--feedbacks`, periodically checks for new feedbacks (default is set to once per hour).
- Tip: You can use the list of arguments to weigh the requested projects. If for instance, your list looked like this `rqcli assign 144 144 134 4`, the project `144` would take up half of all the calls to the API.

#### `token`
- Command: `rqcli token <token>`
- Description: _Stores an API Auth token and the day-of-year to be able to calculate the tokens age_
- Arguments: `<token>`, your token which you can copy from your dashboard > API Access. Some tokens include dashes (`-`) and these must be in quotes (`"token-moretoken"`).

#### `certs`
- Command: `rqcli certs --update`
- Description: _Displays all of the project names with ids for which you are certified._
- Options: `-u`, `--update`, updates your certifications.

#### `assigned`
- Command: `rqcli assigned`
- _Notifies the user of all submissions that are currently assigned to them._

#### `feedbacks`
- Command: `rqcli feedbacks`
- Description: _Gets the feedbacks for the last 30 days. All new feedbacks are saved._

# Project Styleguide

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

# Contribution Guidelines

##### Setup

1. Fork this repository
2. `git clone` your fork down to your local machine
3. `cd` into the directory for your fork
4. run `npm install`
5. Submit a PR for any contributions.

# License

ISC. See [LICENSE](LICENSE).
