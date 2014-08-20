var menuLeft     = document.getElementById('cbp-spmenu-s1');
var showLeftPush = document.getElementById('show-left-push');
var body         = document.body;
 
showLeftPush.onclick = function() {
  classie.toggle(this, 'active');
  classie.toggle(body, 'cbp-spmenu-push-toright');
  classie.toggle(menuLeft, 'cbp-spmenu-open');
  disableOther('show-left-push');
};
 
function disableOther(button) {
  if(button !== 'show-left-push') {
    classie.toggle(showLeftPush, 'disabled');
  }
}
