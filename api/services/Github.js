var deasync = require('deasync');

var gh = sails.config.globals.github.api;
var user = sails.config.globals.github.user;
var repo = sails.config.globals.github.repo;

var ghIssue = deasync(gh.issues.getRepoIssue)

var _issues = []
module.exports = {
  getIssue: function (number) {
    var issue =  _.findWhere(_issues, {number: number});
    console.log("Existe el issue: "  + issue);
    if (issue === undefined) {
      try {
        issue = ghIssue({user: user, repo: repo, number: number })
        console.log("Issue descargado: " + issue);
        _issues.push(issue);
      } catch (err) {
        console.log("Este issue" + number + " no existe");
        issue = {};
      }
    }
    return issue;
  }
}
