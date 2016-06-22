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
3. Optionally check if you have any submissions currently assigned by running `rqcli assigned`.
4. Optionally check for new feedbacks by running `rqcli feedbacks`. This also saves all new feedbacks to the config file.

### CLI commands

**token**
- _Stores an API Auth token and the day-of-year to be able to calculate the tokens age_
- Arguments: `<token>`, your token which you can copy from your dashboard > API Access.

**certs**
- _Displays all of the project names with ids for which you are certified._
- Options: `-u`, `--update`, updates your certifications.

**assigned**
- _Notifies the user of submissions that are assigned to them._

**assign**
- _Starts requesting the Udacity Review API queue for assignments of the type specified in the commands arguments._
- Arguments: `<projectId> [moreIds...]`, space separated list of project ids to request for.
- Options: `-f`, `--feedbacks`, periodically checks for new feedbacks (default is set to once per hour).
- Tip: You can use the list of arguments to weigh the requested projects. If for instance, your list looked like this `rqcli assign 144 144 134 4`, the project `144` would take up half of all the calls to the API.

**feedbacks**
- _Gets the feedbacks for the last 30 days. All new feedbacks are saved._

### Project Styleguide

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
