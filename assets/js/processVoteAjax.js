function processVoteAjax(request_id, action, csrf_token) {
  var loader_img_html   = '<img src="/images/loader.gif" width="35px" height="35px" />';
  var vote_btns         = document.getElementById('vote-btns-' + request_id);
  var vote_count_number = document.getElementById('vote-count-number-' + request_id);
  var vote_count_noun   = document.getElementById('vote-count-noun-' + request_id);
  vote_btns.innerHTML   = loader_img_html;
  $.ajax({
    url: action,
    method: 'POST',
    contentType: 'application/json', 
    processData: false,
    data: JSON.stringify({
      request_id: request_id,
      _csrf: csrf_token
     }),
    success: function() {
      var vote_btns_html = '';
      if (action == '/user/giveVote') {
        // Change the voting buttons.
        vote_btns_html += '<a title="Ya has votado" class="btn-vote btn-give-vote-voted">';
        vote_btns_html += '  <i class="glyphicon glyphicon-chevron-up"></i>';
        vote_btns_html += '</a>';
        vote_btns_html += '<a title="Quitar mi voto" class="btn-vote-small btn-remove-vote" onclick="processVoteAjax(' + request_id + ', \'/user/removeVote\', \'' + csrf_token + '\');">';
        vote_btns_html += '  <i class="glyphicon glyphicon-remove"></i>';
        vote_btns_html += '</a>';

        // Change the vote count locally.
        vote_count_number.innerHTML = parseInt(vote_count_number.innerHTML) + 1;
      } else if (action == '/user/removeVote') {
        // Change the voting buttons.
        vote_btns_html += '<a title="Dar mi voto" class="btn-vote btn-give-vote-unvoted" onclick="processVoteAjax(' + request_id + ', \'/user/giveVote\', \'' + csrf_token + '\');">';
        vote_btns_html += '   <i class="glyphicon glyphicon-chevron-up"></i>';
        vote_btns_html += '</a>';

        // Change the vote count locally.
        vote_count_number.innerHTML = parseInt(vote_count_number.innerHTML) - 1;
      }
      vote_btns.innerHTML = vote_btns_html;
      vote_count_noun.innerHTML = vote_count_number.innerHTML == 1 ? 'voto' : 'votos';
    },
    failure: function(msg) {
      alert('Error al votar. Favor de volver a intentar en unos minutos.');
    },
    error: function(xhr, status, text) {
      alert('Error al votar. Favor de volver a intentar en unos minutos.');
    }
  });
}
