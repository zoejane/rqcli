# CLI for Udacity Review API
##### API location: https://review.udacity.com/api-doc/index.html

# Description
A CLI for configuring and running API calls against the Udacity Review API.

# :arrow_double_down: Installation

### Requirements
- [Node.js](https://nodejs.org/en/download/) v6.0.0 or higher
- NPM (v3.0.0+ highly recommended) (this comes with Node.js)

### Instructions

`rqcli` is a [Node](https://nodejs.org/) module. So, as long as you have Node.js and NPM installed, installing `rqcli` is as simple as running this in a terminal at the root of your project:

```sh
$ npm install rqcli -g
```

_Note: requires a node version >= 6 and an npm version >= 3._

# Setup

##### LEGEND
- Arguments inside `< >` are required.
- Arguments inside `[ ]` are optional.
- Arguments that start with `--` are options.
- Arguments that start with `-` are shortcuts for an option.

Start by running `rqcli token <yourToken>`. Some tokens include dashes (`-`) and these must be in quotes (`"token-moretoken"`). This will create the `api` folder where your token and certifications are stored.

Then run `rqcli certs` which will request your certifications from the API and save them for later use.

Now you are ready to run any of `assign`, `assigned`, and `feebacks`.

# CLI commands

#### `token`
- Command: `rqcli token <token>`
- Description: _Stores an API Auth token and the day-of-year to be able to calculate the tokens age_
- Arguments: `<token>`, your token which you can copy from your dashboard > API Access. Some tokens include dashes (`-`) and these must be in quotes (`"token-moretoken"`).

#### `certs`
- Command: `rqcli certs --update`
- Description: _Displays all of the project names with ids for which you are certified._
- Options: `-u`, `--update`, updates your certifications.

#### `assign`
- Command: `rqcli assign <projectId> [moreIds] --feedbacks`
- Description: _Starts requesting the Udacity Review API queue for assignments of the type specified in the commands arguments._
- Arguments: `<projectId> [moreIds...]`, space separated list of project ids to request for.
- Options: `-f`, `--feedbacks`, periodically checks for new feedbacks (default is set to once per hour).
- Tip: You can use the list of arguments to weigh the requested projects. If for instance, your list looked like this `rqcli assign 144 144 134 4`, the project `144` would take up half of all the calls to the API.

#### `assigned`
- Command: `rqcli assigned`
- _Notifies the user of all submissions that are currently assigned to them._

#### `feedbacks`
- Command: `rqcli feedbacks`
- Description: _Checks for unread feedbacks_

# Project Styleguide

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

# Contribution Guidelines

##### Steps

1. Fork this repository
2. `git clone` your fork down to your local machine
3. `cd` into the directory for your fork
4. run `npm install -g`
5. Submit a PR for any contributions.

# License

ISC. See [LICENSE](LICENSE).
