function vote(request_id, action, csrf_token) {
  var url = action == 'up' ? '/solicitud/' + request_id + '/voteup' : '/solicitud/' + request_id + '/votedown';
  var loader_img_html   = '<img src="/images/loader.gif" width="35px" height="35px" />';
  var vote_btns         = document.getElementById('vote-btns-' + request_id);
  var vote_count_number = document.getElementById('vote-count-number-' + request_id);
  var vote_count_noun   = document.getElementById('vote-count-noun-' + request_id);
  vote_btns.innerHTML   = loader_img_html;
  $.ajax({
    url: url,
    method: 'POST',
    contentType: 'application/json', 
    processData: false,
    data: JSON.stringify({
      request_id: request_id,
      _csrf: csrf_token
     }),
    success: function() {
      var vote_btns_html = '';
      if (action == 'up') {
        // Change the voting buttons.
        vote_btns_html += '<a title="Ya has votado" class="btn-vote btn-give-vote-voted">';
        vote_btns_html += '  <i class="glyphicon glyphicon-chevron-up"></i>';
        vote_btns_html += '</a>';
        vote_btns_html += '<a title="Quitar mi voto" class="btn-vote-small btn-remove-vote" onclick="vote(' + request_id + ', \'down\', \'' + csrf_token + '\');">';
        vote_btns_html += '  <i class="glyphicon glyphicon-remove"></i>';
        vote_btns_html += '</a>';

        // Change the vote count locally.
        vote_count_number.innerHTML = parseInt(vote_count_number.innerHTML) + 1;
      } else if (action == 'down') {
        // Change the voting buttons.
        vote_btns_html += '<a title="Dar mi voto" class="btn-vote btn-give-vote-unvoted" onclick="vote(' + request_id + ', \'up\', \'' + csrf_token + '\');">';
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
