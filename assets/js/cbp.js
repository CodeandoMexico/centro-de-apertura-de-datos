var menuLeft        = document.getElementById('cbp-spmenu-s1');
var showLeftPush    = document.getElementById('show-left-push');
var body            = document.body;
 
showLeftPush.onclick = function() {
  $(this).toggleClass('active');
  $(body).toggleClass('cbp-spmenu-push-toright');
  $(menuLeft).toggleClass('cbp-spmenu-open');
  disableOther('show-left-push');
};
 
function disableOther(button) {
  if(button !== 'show-left-push') {
    $(showLeftPush).toggleClass('disabled');
  }
}

document.getElementById('main-content-div').onclick = function() {
  if ($(menuLeft).hasClass('cbp-spmenu-open')) {
    $(body).toggleClass('cbp-spmenu-push-toright');
    $(menuLeft).toggleClass('cbp-spmenu-open');
  }
}

document.getElementById('intro').onclick = function() {
  if ($(menuLeft).hasClass('cbp-spmenu-open')) {
    $(body).toggleClass('cbp-spmenu-push-toright');
    $(menuLeft).toggleClass('cbp-spmenu-open');
  }
}

// If the users zooms out (like in a desktop), hide the
// responsive menu and show the regular one.
$(document).ready(function() {
    var $window = $(window);

    function checkWidth() {
        var windowsize = $window.width();
        if (windowsize > 1024) {
            if ($(menuLeft).hasClass('cbp-spmenu-open')) {
              $(body).toggleClass('cbp-spmenu-push-toright');
              $(menuLeft).toggleClass('cbp-spmenu-open');
            }
        }
    }
    // Execute on load
    checkWidth();
    // Bind event listener
    $(window).resize(checkWidth);
});
