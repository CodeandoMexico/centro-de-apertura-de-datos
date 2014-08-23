var menuLeft        = document.getElementById('cbp-spmenu-s1');
var showLeftPush    = document.getElementById('show-left-push');
var body            = document.body;
var respMenuIsOpen  = false;
 
showLeftPush.onclick = function() {
  classie.toggle(this, 'active');
  classie.toggle(body, 'cbp-spmenu-push-toright');
  classie.toggle(menuLeft, 'cbp-spmenu-open');
  disableOther('show-left-push');
  respMenuIsOpen = true;
};
 
function disableOther(button) {
  if(button !== 'show-left-push') {
    classie.toggle(showLeftPush, 'disabled');
  }
}

document.getElementById('main-content-div').onclick = function() {
  if (respMenuIsOpen) {
    classie.toggle(body, 'cbp-spmenu-push-toright');
    classie.toggle(menuLeft, 'cbp-spmenu-open');
    respMenuIsOpen = false;
  }
}

document.getElementById('intro').onclick = function() {
  if (respMenuIsOpen) {
    classie.toggle(body, 'cbp-spmenu-push-toright');
    classie.toggle(menuLeft, 'cbp-spmenu-open');
    respMenuIsOpen = false;
  }
}
