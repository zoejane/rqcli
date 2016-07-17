# CLI for Udacity Review API
##### API Documentation: https://review.udacity.com/api-doc/index.html

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

# :clipboard: Setup

##### LEGEND
- Arguments inside `< >` are required.
- Arguments inside `[ ]` are optional.
- Arguments that start with `--` are options.
- Arguments that start with `-` are shortcuts for an option.

##### Step-by-step guide
1. Navigate to the top level of your reviews folders. If you don't have your resources collected in one top-level folder, I suggest you take this opportunity to make that happen :smile:.
1. Get the token from the API.
    - Navigate to the [Reviews Dashboard](https://review.udacity.com/#!/submissions/dashboard).
    - Click on API Access:
    - ![API Access](ss_api_access.png)
    - Copy the token.
1. Run `rqcli setup <yourToken>`. Some tokens include dashes (`-`) and these must be in quotes (`"token-moretoken"`). This will create the `api` folder where your token and certifications are stored.
    - The command lets you know if any submissions are currently assigned to you, and also retrieves any unread feedbacks from the last 30 days.
    - You can add the option `--notify` to get desktop notifications of any unread feedbacks and active reviews.
1. You can do many things from here, but the most common task will be to start requesting reviews from the review queue. You do this by using the `assign` command.

You can read all about the commands in the following section.

# :nut_and_bolt: CLI commands

#### `token`
- Command: `rqcli token <token>`
- Description: _Stores an API Auth token and the day-of-year to be able to calculate the tokens age._
- Arguments: `<token>`, your token which you can copy from your dashboard > API Access. Some tokens include dashes (`-`) and these must be in quotes (`"token-moretoken"`).

#### `certs`
- Command: `rqcli certs --update`
- Description: _Displays all of the project names with ids for which you are certified._
- Options: `-u`, `--update`, updates your certifications.

#### `assigned`
- Command: `rqcli assigned`
- Description: _Notifies the user of all submissions that are currently assigned to them._
- Options: `-n`, `--notify`, uses desktop notifications to notify the user of updates.

#### `feedbacks`
- Command: `rqcli feedbacks`
- Description: _Checks for unread feedbacks_
- Options: `-n`, `--notify`, uses desktop notifications to notify the user of updates.

#### `assign`
- Command: `rqcli assign <projectId> [moreIds] --feedbacks --notify`
- Description: _Starts requesting the Udacity Review API queue for assignments of the type specified in the commands arguments._
- Arguments: `<projectId> [moreIds...]`, space separated list of project ids to request for.
- Options:
    - `-f`, `--feedbacks`, periodically checks for new feedbacks (default is set to once per hour).
    - `-n`, `--notify`, uses desktop notifications to notify the user of updates.
- Tip: You can use the list of arguments to weigh the requested projects. If for instance, your list looked like this `rqcli assign 144 144 134 4`, the project `144` would take up half of all the calls to the API.
- Example Usage: `rqcli assign 144 144 144 134 -fn`. This will request assignments for project 144 three times and then 134 one time. It will keep doing that in a loop. It will also use desktop notifications to notify the user of new assignments and any unread feedbacks.

#### `setup`
- Command: `rqcli setup <token>`
- Description: _Sets up a folder, `api`, in the current directory, with all the information needed to start authenticating against the Udacity Reviews API. This command combines the four commands, `token`, `certs`, `assigned` and `feedbacks` into one._
- Arguments: `<token>`, your token which you can copy from your dashboard > API Access. Some tokens include dashes (`-`) and these must be in quotes (`"token-moretoken"`).
- Options: `-n`, `--notify`, uses desktop notifications to notify the user of updates.

# :black_nib: Project Styleguide

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

[Why no simecolons?](https://www.youtube.com/watch?v=Qlr-FGbhKaI&index=11&list=PL0zVEGEvSaeH21VDycWYNWU7VKUA-xLzg)

# :+1: Contribution Guidelines

##### Steps

1. Fork this repository
2. `git clone` your fork down to your local machine
3. `cd` into the directory for your fork
4. run `npm install -g`
5. Submit a PR for any contributions.

# License

ISC. See [LICENSE](LICENSE).
