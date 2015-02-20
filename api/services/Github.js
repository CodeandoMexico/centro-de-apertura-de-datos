var deasync = require('deasync');

var gh = sails.config.globals.github.api;
var gh_user = sails.config.globals.github.user;
var gh_repo = sails.config.globals.github.repo;

var ghIssue = deasync(gh.issues.getRepoIssue)

var _issues = []

function updateIssues() {
  _issues = _.map(_issues, function (issue) { 
    try {
      var verify = ghIssue({user: gh_user, repo: gh_repo, number: issue.number });
      Request.findOne({issue: issue.number}).exec(function (err, request) {
        if (err || !request)  console.log("No se pudo encontrar el issue para buscar actualizaciones");
	else {
	  if (request.state == 1 && verify.assignee != null) {
	    Request.update({id: request.id}, {state: 2} , function (err, requests) {
              if (err || !requests[0]) return console.warning('Error al actualizar el estado de requests: ' + issue.number);
	      console.log("Estado actualizado correctamente de request: " + issue.number);
	    });
	  } else if (request.state == 2 && verify.state == "closed") {
	    Request.update({id: request.id}, {state: 3} , function (err, requests) {
              if (err || !requests[0]) return console.warning('Error al actualizar el estado de requests: ' + issue.number);
	      console.log("Estado actualizado correctamente de request: " + issue.number);
	    });
	  }
	}
      });
      return verify;
    } catch (err) {
      return {};
    }
  });
  setTimeout(updateIssues, 30000);
}
updateIssues();

module.exports = {
  createIssue: function (id, user, issue) {
    gh.issues.create({
      user: gh_user,
      repo: gh_repo,
      title: "Abrir dataset " + issue.title,
      labels: [],
      body: 'Abrir dataset [' + issue.title + '](' +
            issue.url + '), solicitado por ' + '[' +
            user.name + ']('+ "https://twitter.com/" + user.screen_name + ')'
    }, function (err, result) {
      if (err) console.error("Verificar creacion de " + err);
      else Request.update({
          id: id,
          user: user.id
        }, {
          issue: result.number
        }).exec(function(err, requests) {
          if (err || !requests[0]) return console.warning('Error al actualizar el numero de issue');
	  console.log("Issue asignado correctamente");
        })})},
  getIssue: function (number) {
    var issue =  _.findWhere(_issues, {number: number});
    if (issue === undefined) {
      try {
        issue = ghIssue({user: gh_user, repo: gh_repo, number: number })
        _issues.push(issue);
        console.log("Issue descargado");
      } catch (err) {
        console.log("Este issue" + number + " no existe");
        issue = {};
      }
    }
    return issue;
  },
  updateIssue: function (id, user, issue) {
    if (issue.issue != undefined || issue.issue != null) {
    gh.issues.edit({
      user: gh_user,
      repo: gh_repo,
      number: issue.issue,
      title: "Abrir dataset " + issue.title,
      labels: [],
      body: 'Abrir dataset [' + issue.title + '](' +
            issue.url + '), solicitado por ' + '[' +
            user.name + ']('+ "https://twitter.com/" + user.screen_name + ')'
    }, function (err, result) {
      if (err) console.error("Verificar actualizacion de " + err);
      console.log("Actualizacion de los datos locales a github");
    })} else console.log("numero de issue no definido");
  }
}
