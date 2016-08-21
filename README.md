## CLI tool for Udacity Reviews API

`rqcli` is a CLI tool for configuring and running API calls against the Udacity Reviews API v1. You can find the API documentation here: https://review.udacity.com/api-doc/index.html.

## :arrow_double_down: Installation

#### Requirements
- [Node.js](https://nodejs.org/en/download/) v6.0.0 or higher
- NPM (v3.0.0+ recommended) (this comes with Node.js)

#### Installation

`rqcli` is a [Node](https://nodejs.org/) module. So as long as you have Node.js and NPM installed, installing `rqcli` is as simple as running the following command in a terminal:

```sh
$ npm install rqcli --global
```

#### Notifications

The CLI uses [node-notifier](https://www.npmjs.com/package/node-notifier) for destop notifications.

Desktop Notifications on a Mac:

![Desktop Notifications](README/ss_desktop_notification.png)

Sample CLI prompt

![CLI Prompt](README/ss_cli_prompt.png)

## :clipboard: Setup

##### LEGEND
- Arguments inside `< >` are required.
- Arguments inside `[ ]` are optional.
- Arguments that start with `--` are options.
- Arguments that start with `-` are shortcuts for an option.

##### Step-By-Step Guide
1. Navigate to the folder you want to use for your work with reviews.
1. Get the token from the API.
    - Navigate to the [Reviews Dashboard](https://review.udacity.com/#!/submissions/dashboard).
    - Click on API Access:
    - ![API Access](README/ss_api_access.png)
    - Copy the token.
1. Run `rqcli setup "<token>"`. Because tokens often contain dashes (`-`), remember to put your token inside of quotation marks (`"`). Otherwise the cli will think that everything after the first dash is an attempt to set an option.
    - The command **_creates a new folder_** in your current working directory, called `api`, where your token and certifications are stored.
    - The command lets you know if any submissions are currently assigned to you, and also if there are any unread feedbacks from the last 30 days.
    - You can add the option `--notify` to get desktop notifications of any unread feedbacks and active reviews.
1. The most common task when using this CLI, will be to start requesting assignments from the Udacity Reviews API. Do this by using the `assign` command.

## :nut_and_bolt: CLI commands

#### `setup`
- Command: `rqcli setup "<token>"`
- Description: _Creates a new folder, `api`, in the current working directory, with all the information needed to start authenticating against the Udacity Reviews API. This command combines the four commands, `token`, `certs`, `assigned` and `feedbacks` into one._
- Arguments: `"<token>"`, because tokens often contain dashes (`-`), remember to put your token inside of quotation marks (`"`). Otherwise the cli will think that everything after the first dash is an attempt to set an option.
- Options: `-n`, `--notify`, uses desktop notifications.

#### `assign`
- Command: `rqcli assign <projectId> [moreIds] --feedbacks --notify`
- Description: _Starts requesting the Udacity Reviews API queue for assignments of the type specified in the commands arguments._
    - The default interval for requesting assignments is 1 second.
    - The default interval for checking assignments is 60 seconds.
    - The default interval for checking unread feedbacks is 5 minutes.
- Arguments: `<projectId> [moreIds...]`, space separated list of project ids to request for.
- Options:
    - `-f`, `--feedbacks`, periodically checks for new feedbacks.
    - `-n`, `--notify`, uses desktop notifications.
- Example Usage: `rqcli assign 144 134 -fn`. This will request an assignment for project 144 and then 134. It will keep doing that in a loop. It will also use desktop notifications to notify the user of new assignments and any unread feedbacks.
- Tips:
    + Run `rqcli certs` to get a list of projects you are certified for, including their ids.

#### `money`
- Command: `rqcli money [months] --from <date> --to <date>`
- Description: _Gets all completed reviews and returns an earnings reports for the periods specified by the user._
- Arguments: `[months]`, space separated list of months to report on.
- Options:
    - `-f`, `--from <date>`, date in the format, `YYYY-MM-DDT00:00:00` , from which to calculate earnings (where `YYYY-MM` is required and `DD-T00:00:00` is optional). If the `--to` option is not defined, the period reported on will be from the `<date>` to now.
    - `-t`, `--to <date>`, date in the format, `YYYY-MM-DDT00:00:00`, to which to calculate earnings (where `YYYY-MM` is required and `DD-T00:00:00` is optional). If the `--from` option is not defined, the period reported on will be from sometime in the 70's to the `<date>`.
- Example Usage: `rqcli money 3 4 --from 2016-01 --to 2016-07-26`. This request will return three earnings reports:
    - An earnings report for the full month of March 2016.
    - An earnings report for the full month of April 2016.
    - An earnings report for the year 2016 up to (but _not_ including) July 26th.
- Tips:
    - If you simply use `rqcli money` you will get a total of all you have earned up to now as well as an earnings report for the current month.
    - To add a month from the previous year, simply use the format `YYYY-MM`: `rqcli money 2015-11`.
    - If you add a month that is in the future, the command will return information from the month of the previous year instead.

#### `review`

`review` is a somewhat experimental command. It's meant to log your review activity so that you can eventually check things like how long you spend on a review type and so on. It's also meant to be able to run scripts for automation. Such a script might be a download and unzip-script or something similar and it can run both pre- and post-scripts. It does require some setup, so unless you need it, you may want to just use this command for logging reviews.

- Command: `rqcli review`
- Description: _Logs a review. Potentially also runs scritps for certain project types._
- Example Usage: `rqcli review`.
    + This will allow you to select an assigned submission to start reviewing.
    + During the review you can pause, unpause and end the review. Each action will be logged.
    + `pre` and `post` scripts will be run if they are defined.
- Tips:
    + You can place an `index.js` in the folder of the project type you are reviewing with scripts to be run on that project type. It supports running the following scripts:
        * `pre`: Will be run _before_ the review is logged and started.
        * `post`: Will be run right _after_ you log the end of the review.
    + You can `exit` a review, thereby avoiding running any post-scripts. You might do this if your post-script is deleting the submission and you want to keep it.

#### `token`
- Command: `rqcli token "<token>"`
- Description: _Stores an API Auth token and the day-of-year to be able to calculate the tokens age._
- Arguments: `"<token>"`, because tokens often contain dashes (`-`), remember to put your token inside of quotation marks (`"`). Otherwise the cli will think that everything after the first dash is an attempt to set an option.

#### `certs`
- Command: `rqcli certs --update`
- Description: _Displays all of the project names with ids for which the authenticated user is certified._
- Options: `-u`, `--update`, updates the stored certification information with the current information from the API.

#### `assigned`
- Command: `rqcli assigned`
- Description: _Gets all submissions that are currently assigned to the user._
- Options: `-n`, `--notify`, uses desktop notifications.

#### `feedbacks`
- Command: `rqcli feedbacks`
- Description: _Checks for unread feedbacks from the last 30 days_
- Options: `-n`, `--notify`, uses desktop notifications.

## :black_nib: Project Styleguide

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

## :+1: Contribution Guidelines

##### Steps

1. Fork this repository
2. `git clone` your fork down to your local machine
3. Submit a PR for any contributions.

## License

[ISC](LICENSE) © Mikkel Trolle Larsen.
