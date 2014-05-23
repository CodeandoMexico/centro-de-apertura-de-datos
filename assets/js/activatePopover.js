$(function() {
  $.get('/templates/requestDataForm.html', function(data) {
    var content = data;
    $("#request-data-btn").popover({container: 'body', html: true, content: content});
  });
});
