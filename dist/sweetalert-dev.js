;(function(window, document, undefined) {
  "use strict";
  
  (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// SweetAlert
// 2014-2015 (c) - Tristan Edwards
// github.com/t4t5/sweetalert

/*
 * jQuery-like functions for manipulating the DOM
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _modulesHandleDom = require('./modules/handle-dom');

/*
 * Handy utilities
 */

var _modulesUtils = require('./modules/utils');

/*
 *  Handle sweetAlert's DOM elements
 */

var _modulesHandleSwalDom = require('./modules/handle-swal-dom');

// Handle button events and keyboard events

var _modulesHandleClick = require('./modules/handle-click');

var _modulesHandleKey = require('./modules/handle-key');

var _modulesHandleKey2 = _interopRequireDefault(_modulesHandleKey);

// Default values

var _modulesDefaultParams = require('./modules/default-params');

var _modulesDefaultParams2 = _interopRequireDefault(_modulesDefaultParams);

var _modulesSetParams = require('./modules/set-params');

var _modulesSetParams2 = _interopRequireDefault(_modulesSetParams);

/*
 * Remember state in cases where opening and handling a modal will fiddle with it.
 * (We also use window.previousActiveElement as a global variable)
 */
var previousWindowKeyDown;
var lastFocusedButton;

/*
 * Global sweetAlert function
 * (this is what the user calls)
 */
var sweetAlert, swal;

exports['default'] = sweetAlert = swal = function () {
  var customizations = arguments[0];

  (0, _modulesHandleDom.addClass)(document.body, 'stop-scrolling');
  (0, _modulesHandleSwalDom.resetInput)();

  /*
   * Use argument if defined or default value from params object otherwise.
   * Supports the case where a default value is boolean true and should be
   * overridden by a corresponding explicit argument which is boolean false.
   */
  function argumentOrDefault(key) {
    var args = customizations;
    return args[key] === undefined ? _modulesDefaultParams2['default'][key] : args[key];
  }

  if (customizations === undefined) {
    (0, _modulesUtils.logStr)('SweetAlert expects at least 1 attribute!');
    return false;
  }

  var params = (0, _modulesUtils.extend)({}, _modulesDefaultParams2['default']);

  switch (typeof customizations) {

    // Ex: swal("Hello", "Just testing", "info");
    case 'string':
      params.title = customizations;
      params.text = arguments[1] || '';
      params.type = arguments[2] || '';
      break;

    // Ex: swal({ title:"Hello", text: "Just testing", type: "info" });
    case 'object':
      if (customizations.title === undefined) {
        (0, _modulesUtils.logStr)('Missing "title" argument!');
        return false;
      }

      params.title = customizations.title;

      for (var customName in _modulesDefaultParams2['default']) {
        params[customName] = argumentOrDefault(customName);
      }

      // Show "Confirm" instead of "OK" if cancel button is visible
      params.confirmButtonText = params.showCancelButton ? 'Confirm' : _modulesDefaultParams2['default'].confirmButtonText;
      params.confirmButtonText = argumentOrDefault('confirmButtonText');

      // Callback function when clicking on "OK"/"Cancel"
      params.doneFunction = arguments[1] || null;

      break;

    default:
      (0, _modulesUtils.logStr)('Unexpected type of argument! Expected "string" or "object", got ' + typeof customizations);
      return false;

  }

  (0, _modulesSetParams2['default'])(params);
  (0, _modulesHandleSwalDom.fixVerticalPosition)();
  (0, _modulesHandleSwalDom.openModal)(arguments[1]);

  // Modal interactions
  var modal = (0, _modulesHandleSwalDom.getModal)();

  /*
   * Make sure all modal buttons respond to all events
   */
  var $buttons = modal.querySelectorAll('button');
  var buttonEvents = ['onclick', 'onmouseover', 'onmouseout', 'onmousedown', 'onmouseup', 'onfocus'];
  var onButtonEvent = function onButtonEvent(e) {
    return (0, _modulesHandleClick.handleButton)(e, params, modal);
  };

  for (var btnIndex = 0; btnIndex < $buttons.length; btnIndex++) {
    for (var evtIndex = 0; evtIndex < buttonEvents.length; evtIndex++) {
      var btnEvt = buttonEvents[evtIndex];
      $buttons[btnIndex][btnEvt] = onButtonEvent;
    }
  }

  // Clicking outside the modal dismisses it (if allowed by user)
  (0, _modulesHandleSwalDom.getOverlay)().onclick = onButtonEvent;

  previousWindowKeyDown = window.onkeydown;

  var onKeyEvent = function onKeyEvent(e) {
    return (0, _modulesHandleKey2['default'])(e, params, modal);
  };
  window.onkeydown = onKeyEvent;

  window.onfocus = function () {
    // When the user has focused away and focused back from the whole window.
    setTimeout(function () {
      // Put in a timeout to jump out of the event sequence.
      // Calling focus() in the event sequence confuses things.
      if (lastFocusedButton !== undefined) {
        lastFocusedButton.focus();
        lastFocusedButton = undefined;
      }
    }, 0);
  };

  // Show alert with enabled buttons always
  swal.enableButtons();
};

/*
 * Set default params for each popup
 * @param {Object} userParams
 */
sweetAlert.setDefaults = swal.setDefaults = function (userParams) {
  if (!userParams) {
    throw new Error('userParams is required');
  }
  if (typeof userParams !== 'object') {
    throw new Error('userParams has to be a object');
  }

  (0, _modulesUtils.extend)(_modulesDefaultParams2['default'], userParams);
};

/*
 * Animation when closing modal
 */
sweetAlert.close = swal.close = function () {
  var modal = (0, _modulesHandleSwalDom.getModal)();

  (0, _modulesHandleDom.fadeOut)((0, _modulesHandleSwalDom.getOverlay)(), 5);
  (0, _modulesHandleDom.fadeOut)(modal, 5);
  (0, _modulesHandleDom.removeClass)(modal, 'showSweetAlert');
  (0, _modulesHandleDom.addClass)(modal, 'hideSweetAlert');
  (0, _modulesHandleDom.removeClass)(modal, 'visible');

  /*
   * Reset icon animations
   */
  var $successIcon = modal.querySelector('.sa-icon.sa-success');
  (0, _modulesHandleDom.removeClass)($successIcon, 'animate');
  (0, _modulesHandleDom.removeClass)($successIcon.querySelector('.sa-tip'), 'animateSuccessTip');
  (0, _modulesHandleDom.removeClass)($successIcon.querySelector('.sa-long'), 'animateSuccessLong');

  var $errorIcon = modal.querySelector('.sa-icon.sa-error');
  (0, _modulesHandleDom.removeClass)($errorIcon, 'animateErrorIcon');
  (0, _modulesHandleDom.removeClass)($errorIcon.querySelector('.sa-x-mark'), 'animateXMark');

  var $warningIcon = modal.querySelector('.sa-icon.sa-warning');
  (0, _modulesHandleDom.removeClass)($warningIcon, 'pulseWarning');
  (0, _modulesHandleDom.removeClass)($warningIcon.querySelector('.sa-body'), 'pulseWarningIns');
  (0, _modulesHandleDom.removeClass)($warningIcon.querySelector('.sa-dot'), 'pulseWarningIns');

  // Reset custom class (delay so that UI changes aren't visible)
  setTimeout(function () {
    var customClass = modal.getAttribute('data-custom-class');
    (0, _modulesHandleDom.removeClass)(modal, customClass);
  }, 300);

  // Make page scrollable again
  (0, _modulesHandleDom.removeClass)(document.body, 'stop-scrolling');

  // Reset the page to its previous state
  window.onkeydown = previousWindowKeyDown;
  if (window.previousActiveElement) {
    window.previousActiveElement.focus();
  }
  lastFocusedButton = undefined;
  clearTimeout(modal.timeout);

  return true;
};

/*
 * Validation of the input field is done by user
 * If something is wrong => call showInputError with errorMessage
 */
sweetAlert.showInputError = swal.showInputError = function (errorMessage) {
  var modal = (0, _modulesHandleSwalDom.getModal)();

  var $errorIcon = modal.querySelector('.sa-input-error');
  (0, _modulesHandleDom.addClass)($errorIcon, 'show');

  var $errorContainer = modal.querySelector('.sa-error-container');
  (0, _modulesHandleDom.addClass)($errorContainer, 'show');

  $errorContainer.querySelector('p').innerHTML = errorMessage;

  setTimeout(function () {
    sweetAlert.enableButtons();
  }, 1);

  modal.querySelector('input').focus();
};

/*
 * Reset input error DOM elements
 */
sweetAlert.resetInputError = swal.resetInputError = function (event) {
  // If press enter => ignore
  if (event && event.keyCode === 13) {
    return false;
  }

  var $modal = (0, _modulesHandleSwalDom.getModal)();

  var $errorIcon = $modal.querySelector('.sa-input-error');
  (0, _modulesHandleDom.removeClass)($errorIcon, 'show');

  var $errorContainer = $modal.querySelector('.sa-error-container');
  (0, _modulesHandleDom.removeClass)($errorContainer, 'show');
};

/*
 * Disable confirm and cancel buttons
 */
sweetAlert.disableButtons = swal.disableButtons = function (event) {
  var modal = (0, _modulesHandleSwalDom.getModal)();
  var $confirmButton = modal.querySelector('button.confirm');
  var $cancelButton = modal.querySelector('button.cancel');
  $confirmButton.disabled = true;
  $cancelButton.disabled = true;
};

/*
 * Enable confirm and cancel buttons
 */
sweetAlert.enableButtons = swal.enableButtons = function (event) {
  var modal = (0, _modulesHandleSwalDom.getModal)();
  var $confirmButton = modal.querySelector('button.confirm');
  var $cancelButton = modal.querySelector('button.cancel');
  $confirmButton.disabled = false;
  $cancelButton.disabled = false;
};

if (typeof window !== 'undefined') {
  // The 'handle-click' module requires
  // that 'sweetAlert' was set as global.
  window.sweetAlert = window.swal = sweetAlert;
} else {
  (0, _modulesUtils.logStr)('SweetAlert is a frontend module!');
}
module.exports = exports['default'];

},{"./modules/default-params":2,"./modules/handle-click":3,"./modules/handle-dom":4,"./modules/handle-key":5,"./modules/handle-swal-dom":6,"./modules/set-params":8,"./modules/utils":9}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var defaultParams = {
  title: '',
  text: '',
  type: null,
  allowOutsideClick: false,
  showConfirmButton: true,
  showCancelButton: false,
  closeOnConfirm: true,
  closeOnCancel: true,
  confirmButtonText: 'OK',
  confirmButtonColor: '#C01A7D',
  cancelButtonText: 'Cancel',
  imageUrl: null,
  imageSize: null,
  timer: null,
  customClass: '',
  html: false,
  animation: true,
  disableKeys: false,
  allowEscapeKey: true,
  allowReturnKey: true,
  inputType: 'text',
  inputPlaceholder: '',
  inputValue: '',
  showLoaderOnConfirm: false
};

exports['default'] = defaultParams;
module.exports = exports['default'];

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _utils = require('./utils');

var _handleSwalDom = require('./handle-swal-dom');

var _handleDom = require('./handle-dom');

/*
 * User clicked on "Confirm"/"OK" or "Cancel"
 */
var handleButton = function handleButton(event, params, modal) {
  var e = event || window.event;
  var target = e.target || e.srcElement;

  var targetedConfirm = target.className.indexOf('confirm') !== -1;
  var targetedOverlay = target.className.indexOf('sweet-overlay') !== -1;
  var modalIsVisible = (0, _handleDom.hasClass)(modal, 'visible');
  var doneFunctionExists = params.doneFunction && modal.getAttribute('data-has-done-function') === 'true';

  // Since the user can change the background-color of the confirm button programmatically,
  // we must calculate what the color should be on hover/active
  var normalColor, hoverColor, activeColor;
  if (targetedConfirm && params.confirmButtonColor) {
    normalColor = params.confirmButtonColor;
    hoverColor = (0, _utils.colorLuminance)(normalColor, -0.04);
    activeColor = (0, _utils.colorLuminance)(normalColor, -0.14);
  }

  function shouldSetConfirmButtonColor(color) {
    if (targetedConfirm && params.confirmButtonColor) {
      target.style.backgroundColor = color;
    }
  }

  switch (e.type) {
    case 'mouseover':
      shouldSetConfirmButtonColor(hoverColor);
      break;

    case 'mouseout':
      shouldSetConfirmButtonColor(normalColor);
      break;

    case 'mousedown':
      shouldSetConfirmButtonColor(activeColor);
      break;

    case 'mouseup':
      shouldSetConfirmButtonColor(hoverColor);
      break;

    case 'focus':
      var $confirmButton = modal.querySelector('button.confirm');
      var $cancelButton = modal.querySelector('button.cancel');

      if (targetedConfirm) {
        $cancelButton.style.boxShadow = 'none';
      } else {
        $confirmButton.style.boxShadow = 'none';
      }
      break;

    case 'click':
      var clickedOnModal = modal === target;
      var clickedOnModalChild = (0, _handleDom.isDescendant)(modal, target);

      // Ignore click outside if allowOutsideClick is false
      if (!clickedOnModal && !clickedOnModalChild && modalIsVisible && !params.allowOutsideClick) {
        break;
      }

      if (targetedConfirm && doneFunctionExists && modalIsVisible) {
        handleConfirm(modal, params);
      } else if (doneFunctionExists && modalIsVisible || targetedOverlay) {
        handleCancel(modal, params);
      } else if ((0, _handleDom.isDescendant)(modal, target) && target.tagName === 'BUTTON') {
        sweetAlert.close();
      }
      break;
  }
};

/*
 *  User clicked on "Confirm"/"OK"
 */
var handleConfirm = function handleConfirm(modal, params) {
  var callbackValue = true;

  if ((0, _handleDom.hasClass)(modal, 'show-input')) {
    callbackValue = modal.querySelector('input').value;

    if (!callbackValue) {
      callbackValue = '';
    }
  }

  params.doneFunction(callbackValue);

  if (params.closeOnConfirm) {
    sweetAlert.close();
  }
  // Disable cancel and confirm button if the parameter is true
  if (params.showLoaderOnConfirm) {
    sweetAlert.disableButtons();
  }
};

/*
 *  User clicked on "Cancel"
 */
var handleCancel = function handleCancel(modal, params) {
  params.doneFunction(false);

  if (params.closeOnCancel) {
    sweetAlert.close();
  }
};

exports['default'] = {
  handleButton: handleButton,
  handleConfirm: handleConfirm,
  handleCancel: handleCancel
};
module.exports = exports['default'];

},{"./handle-dom":4,"./handle-swal-dom":6,"./utils":9}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var hasClass = function hasClass(elem, className) {
  return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
};

var addClass = function addClass(elem, className) {
  if (!hasClass(elem, className)) {
    elem.className += ' ' + className;
  }
};

var removeClass = function removeClass(elem, className) {
  var newClass = ' ' + elem.className.replace(/[\t\r\n]/g, ' ') + ' ';
  if (hasClass(elem, className)) {
    while (newClass.indexOf(' ' + className + ' ') >= 0) {
      newClass = newClass.replace(' ' + className + ' ', ' ');
    }
    elem.className = newClass.replace(/^\s+|\s+$/g, '');
  }
};

var escapeHtml = function escapeHtml(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
};

var _show = function _show(elem) {
  elem.style.opacity = '';
  elem.style.display = 'block';
};

var show = function show(elems) {
  if (elems && !elems.length) {
    return _show(elems);
  }
  for (var i = 0; i < elems.length; ++i) {
    _show(elems[i]);
  }
};

var _hide = function _hide(elem) {
  elem.style.opacity = '';
  elem.style.display = 'none';
};

var hide = function hide(elems) {
  if (elems && !elems.length) {
    return _hide(elems);
  }
  for (var i = 0; i < elems.length; ++i) {
    _hide(elems[i]);
  }
};

var isDescendant = function isDescendant(parent, child) {
  var node = child.parentNode;
  while (node !== null) {
    if (node === parent) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
};

var getTopMargin = function getTopMargin(elem) {
  elem.style.left = '-9999px';
  elem.style.display = 'block';

  var height = elem.clientHeight,
      padding;
  if (typeof getComputedStyle !== "undefined") {
    // IE 8
    padding = parseInt(getComputedStyle(elem).getPropertyValue('padding-top'), 10);
  } else {
    padding = parseInt(elem.currentStyle.padding);
  }

  elem.style.left = '';
  elem.style.display = 'none';
  return '-' + parseInt((height + padding) / 2) + 'px';
};

var fadeIn = function fadeIn(elem, interval) {
  if (+elem.style.opacity < 1) {
    interval = interval || 16;
    elem.style.opacity = 0;
    elem.style.display = 'block';
    var last = +new Date();
    var tick = function tick() {
      elem.style.opacity = +elem.style.opacity + (new Date() - last) / 100;
      last = +new Date();

      if (+elem.style.opacity < 1) {
        setTimeout(tick, interval);
      }
    };
    tick();
  }
  elem.style.display = 'block'; //fallback IE8
};

var fadeOut = function fadeOut(elem, interval) {
  interval = interval || 16;
  elem.style.opacity = 1;
  var last = +new Date();
  var tick = function tick() {
    elem.style.opacity = +elem.style.opacity - (new Date() - last) / 100;
    last = +new Date();

    if (+elem.style.opacity > 0) {
      setTimeout(tick, interval);
    } else {
      elem.style.display = 'none';
    }
  };
  tick();
};

var fireClick = function fireClick(node) {
  // Taken from http://www.nonobtrusive.com/2011/11/29/programatically-fire-crossbrowser-click-event-with-javascript/
  // Then fixed for today's Chrome browser.
  if (typeof MouseEvent === 'function') {
    // Up-to-date approach
    var mevt = new MouseEvent('click', {
      view: window,
      bubbles: false,
      cancelable: true
    });
    node.dispatchEvent(mevt);
  } else if (document.createEvent) {
    // Fallback
    var evt = document.createEvent('MouseEvents');
    evt.initEvent('click', false, false);
    node.dispatchEvent(evt);
  } else if (document.createEventObject) {
    node.fireEvent('onclick');
  } else if (typeof node.onclick === 'function') {
    node.onclick();
  }
};

var stopEventPropagation = function stopEventPropagation(e) {
  // In particular, make sure the space bar doesn't scroll the main window.
  if (typeof e.stopPropagation === 'function') {
    e.stopPropagation();
    e.preventDefault();
  } else if (window.event && window.event.hasOwnProperty('cancelBubble')) {
    window.event.cancelBubble = true;
  }
};

exports.hasClass = hasClass;
exports.addClass = addClass;
exports.removeClass = removeClass;
exports.escapeHtml = escapeHtml;
exports._show = _show;
exports.show = show;
exports._hide = _hide;
exports.hide = hide;
exports.isDescendant = isDescendant;
exports.getTopMargin = getTopMargin;
exports.fadeIn = fadeIn;
exports.fadeOut = fadeOut;
exports.fireClick = fireClick;
exports.stopEventPropagation = stopEventPropagation;

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _handleDom = require('./handle-dom');

var _handleSwalDom = require('./handle-swal-dom');

var vk_tab = 9;
var vk_esc = 27;
var vk_enter = 13;
var vk_space = 32;
var key_codes = [vk_tab, vk_esc, vk_enter, vk_space];

var handleKeyDown = function handleKeyDown(event, params, modal) {
  var e = event || window.event;
  var keyCode = e.keyCode || e.which;

  if (key_codes.indexOf(keyCode) < 0) {
    // Don't do work on keys we don't care about.
    return;
  }

  if (params.disableKeys === true) {
    (0, _handleDom.stopEventPropagation)(e);
    return;
  }

  var $okButton = modal.querySelector('button.confirm');
  var $cancelButton = modal.querySelector('button.cancel');
  var $modalButtons = modal.querySelectorAll('button[tabindex]');

  var $targetElement = e.target || e.srcElement;

  var btnIndex = -1; // Find the button - note, this is a nodelist, not an array.
  for (var i = 0; i < $modalButtons.length; i++) {
    if ($targetElement === $modalButtons[i]) {
      btnIndex = i;
      break;
    }
  }

  if (keyCode === vk_tab) {
    if (btnIndex === -1) {
      // No button focused. Jump to the confirm button.
      $targetElement = $okButton;
    } else {
      // Cycle to the next button
      if (btnIndex === $modalButtons.length - 1) {
        $targetElement = $modalButtons[0];
      } else {
        $targetElement = $modalButtons[btnIndex + 1];
      }
    }

    (0, _handleDom.stopEventPropagation)(e);
    $targetElement.focus();

    if (params.confirmButtonColor) {
      (0, _handleSwalDom.setFocusStyle)($targetElement, params.confirmButtonColor);
    }
  } else {
    if (keyCode === vk_enter && params.allowReturnKey === true) {
      if ($targetElement.tagName === 'INPUT') {
        $targetElement = $okButton;
        $okButton.focus();
      }

      if (btnIndex === -1) {
        // ENTER/SPACE clicked outside of a button.
        $targetElement = $okButton;
      } else {
        // Do nothing - let the browser handle it.
        $targetElement = undefined;
      }
    } else if (keyCode === vk_esc && params.allowEscapeKey === true) {
      $targetElement = $cancelButton;
      (0, _handleDom.fireClick)($targetElement, e);
    } else {
      // Fallback - let the browser handle it.
      $targetElement = undefined;
    }
  }
};

exports['default'] = handleKeyDown;
module.exports = exports['default'];

},{"./handle-dom":4,"./handle-swal-dom":6}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utils = require('./utils');

var _handleDom = require('./handle-dom');

var _defaultParams = require('./default-params');

var _defaultParams2 = _interopRequireDefault(_defaultParams);

/*
 * Add modal + overlay to DOM
 */

var _injectedHtml = require('./injected-html');

var _injectedHtml2 = _interopRequireDefault(_injectedHtml);

var modalClass = '.sweet-alert';
var overlayClass = '.sweet-overlay';

var sweetAlertInitialize = function sweetAlertInitialize() {
  var sweetWrap = document.createElement('div');
  sweetWrap.innerHTML = _injectedHtml2['default'];

  // Append elements to body
  while (sweetWrap.firstChild) {
    document.body.appendChild(sweetWrap.firstChild);
  }
};

/*
 * Get DOM element of modal
 */
var getModal = function getModal() {
  var $modal = document.querySelector(modalClass);

  if (!$modal) {
    sweetAlertInitialize();
    $modal = getModal();
  }

  return $modal;
};

/*
 * Get DOM element of input (in modal)
 */
var getInput = function getInput() {
  var $modal = getModal();
  if ($modal) {
    return $modal.querySelector('input');
  }
};

/*
 * Get DOM element of overlay
 */
var getOverlay = function getOverlay() {
  return document.querySelector(overlayClass);
};

/*
 * Add box-shadow style to button (depending on its chosen bg-color)
 */
var setFocusStyle = function setFocusStyle($button, bgColor) {
  var rgbColor = (0, _utils.hexToRgb)(bgColor);
  $button.style.boxShadow = '0 0 2px rgba(' + rgbColor + ', 0.8), inset 0 0 0 1px rgba(0, 0, 0, 0.05)';
};

/*
 * Animation when opening modal
 */
var openModal = function openModal(callback) {
  var $modal = getModal();
  (0, _handleDom.fadeIn)(getOverlay(), 10);
  (0, _handleDom.show)($modal);
  (0, _handleDom.addClass)($modal, 'showSweetAlert');
  (0, _handleDom.removeClass)($modal, 'hideSweetAlert');

  window.previousActiveElement = document.activeElement;
  var $okButton = $modal.querySelector('button.confirm');
  $okButton.focus();

  setTimeout(function () {
    (0, _handleDom.addClass)($modal, 'visible');
  }, 500);

  var timer = $modal.getAttribute('data-timer');

  if (timer !== 'null' && timer !== '') {
    var timerCallback = callback;
    $modal.timeout = setTimeout(function () {
      var doneFunctionExists = (timerCallback || null) && $modal.getAttribute('data-has-done-function') === 'true';
      if (doneFunctionExists) {
        timerCallback(null);
      } else {
        sweetAlert.close();
      }
    }, timer);
  }
};

/*
 * Reset the styling of the input
 * (for example if errors have been shown)
 */
var resetInput = function resetInput() {
  var $modal = getModal();
  var $input = getInput();

  (0, _handleDom.removeClass)($modal, 'show-input');
  $input.value = _defaultParams2['default'].inputValue;
  $input.setAttribute('type', _defaultParams2['default'].inputType);
  $input.setAttribute('placeholder', _defaultParams2['default'].inputPlaceholder);

  resetInputError();
};

var resetInputError = function resetInputError(event) {
  // If press enter => ignore
  if (event && event.keyCode === 13) {
    return false;
  }

  var $modal = getModal();

  var $errorIcon = $modal.querySelector('.sa-input-error');
  (0, _handleDom.removeClass)($errorIcon, 'show');

  var $errorContainer = $modal.querySelector('.sa-error-container');
  (0, _handleDom.removeClass)($errorContainer, 'show');
};

/*
 * Set "margin-top"-property on modal based on its computed height
 */
var fixVerticalPosition = function fixVerticalPosition() {
  var $modal = getModal();
  $modal.style.marginTop = (0, _handleDom.getTopMargin)(getModal());
};

exports.sweetAlertInitialize = sweetAlertInitialize;
exports.getModal = getModal;
exports.getOverlay = getOverlay;
exports.getInput = getInput;
exports.setFocusStyle = setFocusStyle;
exports.openModal = openModal;
exports.resetInput = resetInput;
exports.resetInputError = resetInputError;
exports.fixVerticalPosition = fixVerticalPosition;

},{"./default-params":2,"./handle-dom":4,"./injected-html":7,"./utils":9}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var injectedHTML =

// Dark overlay
"<div class=\"sweet-overlay\" tabIndex=\"-1\"></div>" +

// Modal
"<div class=\"sweet-alert\">" +

// Error icon
"<div class=\"sa-icon sa-error\">\n      <span class=\"sa-x-mark\">\n        <span class=\"sa-line sa-left\"></span>\n        <span class=\"sa-line sa-right\"></span>\n      </span>\n    </div>" +

// Warning icon
"<div class=\"sa-icon sa-warning\">\n      <span class=\"sa-body\"></span>\n      <span class=\"sa-dot\"></span>\n    </div>" +

// Info icon
"<div class=\"sa-icon sa-info\"></div>" +

// Success icon
"<div class=\"sa-icon sa-success\">\n      <span class=\"sa-line sa-tip\"></span>\n      <span class=\"sa-line sa-long\"></span>\n\n      <div class=\"sa-placeholder\"></div>\n      <div class=\"sa-fix\"></div>\n    </div>" + "<div class=\"sa-icon sa-custom\"></div>" +

// Title, text and input
"<h2>Title</h2>\n    <p>Text</p>\n    <fieldset>\n      <input type=\"text\" tabIndex=\"3\" />\n      <div class=\"sa-input-error\"></div>\n    </fieldset>" +

// Input errors
"<div class=\"sa-error-container\">\n      <div class=\"icon\">!</div>\n      <p>Not valid!</p>\n    </div>" +

// Cancel and confirm buttons
"<div class=\"sa-button-container\">\n      <button class=\"cancel\" tabIndex=\"2\">Cancel</button>\n      <div class=\"sa-confirm-button-container\">\n        <button class=\"confirm\" tabIndex=\"1\">OK</button>" +

// Loading animation
"<div class=\"la-ball-fall\">\n          <div></div>\n          <div></div>\n          <div></div>\n        </div>\n      </div>\n    </div>" +

// End of modal
"</div>";

exports["default"] = injectedHTML;
module.exports = exports["default"];

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _utils = require('./utils');

var _handleSwalDom = require('./handle-swal-dom');

var _handleDom = require('./handle-dom');

/*
 * Set type, text and actions on modal
 */
var alertTypes = ['error', 'warning', 'info', 'success', 'input', 'prompt'];

var setParameters = function setParameters(params) {
  var modal = (0, _handleSwalDom.getModal)();

  var $title = modal.querySelector('h2');
  var $text = modal.querySelector('p');
  var $cancelBtn = modal.querySelector('button.cancel');
  var $confirmBtn = modal.querySelector('button.confirm');

  /*
   * Title
   */
  $title.innerHTML = params.html ? params.title : (0, _handleDom.escapeHtml)(params.title).split('\n').join('<br>');

  /*
   * Text
   */
  $text.innerHTML = params.html ? params.text : (0, _handleDom.escapeHtml)(params.text || '').split('\n').join('<br>');
  if (params.text) (0, _handleDom.show)($text);

  /*
   * Custom class
   */
  if (params.customClass) {
    (0, _handleDom.addClass)(modal, params.customClass);
    modal.setAttribute('data-custom-class', params.customClass);
  } else {
    // Find previously set classes and remove them
    var customClass = modal.getAttribute('data-custom-class');
    (0, _handleDom.removeClass)(modal, customClass);
    modal.setAttribute('data-custom-class', '');
  }

  /*
   * Icon
   */
  (0, _handleDom.hide)(modal.querySelectorAll('.sa-icon'));

  if (params.type && !(0, _utils.isIE8)()) {
    var _ret = (function () {

      var validType = false;

      for (var i = 0; i < alertTypes.length; i++) {
        if (params.type === alertTypes[i]) {
          validType = true;
          break;
        }
      }

      if (!validType) {
        logStr('Unknown alert type: ' + params.type);
        return {
          v: false
        };
      }

      var typesWithIcons = ['success', 'error', 'warning', 'info'];
      var $icon = undefined;

      if (typesWithIcons.indexOf(params.type) !== -1) {
        $icon = modal.querySelector('.sa-icon.' + 'sa-' + params.type);
        (0, _handleDom.show)($icon);
      }

      var $input = (0, _handleSwalDom.getInput)();

      // Animate icon
      switch (params.type) {

        case 'success':
          (0, _handleDom.addClass)($icon, 'animate');
          (0, _handleDom.addClass)($icon.querySelector('.sa-tip'), 'animateSuccessTip');
          (0, _handleDom.addClass)($icon.querySelector('.sa-long'), 'animateSuccessLong');
          break;

        case 'error':
          (0, _handleDom.addClass)($icon, 'animateErrorIcon');
          (0, _handleDom.addClass)($icon.querySelector('.sa-x-mark'), 'animateXMark');
          break;

        case 'warning':
          (0, _handleDom.addClass)($icon, 'pulseWarning');
          (0, _handleDom.addClass)($icon.querySelector('.sa-body'), 'pulseWarningIns');
          (0, _handleDom.addClass)($icon.querySelector('.sa-dot'), 'pulseWarningIns');
          break;

        case 'input':
        case 'prompt':
          $input.setAttribute('type', params.inputType);
          $input.value = params.inputValue;
          $input.setAttribute('placeholder', params.inputPlaceholder);
          (0, _handleDom.addClass)(modal, 'show-input');
          setTimeout(function () {
            $input.focus();
            $input.addEventListener('keyup', swal.resetInputError);
          }, 400);
          break;
      }
    })();

    if (typeof _ret === 'object') return _ret.v;
  }

  /*
   * Custom image
   */
  if (params.imageUrl) {
    var $customIcon = modal.querySelector('.sa-icon.sa-custom');

    $customIcon.style.backgroundImage = 'url(' + params.imageUrl + ')';
    (0, _handleDom.show)($customIcon);

    var _imgWidth = 80;
    var _imgHeight = 80;

    if (params.imageSize) {
      var dimensions = params.imageSize.toString().split('x');
      var imgWidth = dimensions[0];
      var imgHeight = dimensions[1];

      if (!imgWidth || !imgHeight) {
        logStr('Parameter imageSize expects value with format WIDTHxHEIGHT, got ' + params.imageSize);
      } else {
        _imgWidth = imgWidth;
        _imgHeight = imgHeight;
      }
    }

    $customIcon.setAttribute('style', $customIcon.getAttribute('style') + 'width:' + _imgWidth + 'px; height:' + _imgHeight + 'px');
  }

  /*
   * Show cancel button?
   */
  modal.setAttribute('data-has-cancel-button', params.showCancelButton);
  if (params.showCancelButton) {
    $cancelBtn.style.display = 'inline-block';
  } else {
    (0, _handleDom.hide)($cancelBtn);
  }

  /*
   * Show confirm button?
   */
  modal.setAttribute('data-has-confirm-button', params.showConfirmButton);
  if (params.showConfirmButton) {
    $confirmBtn.style.display = 'inline-block';
  } else {
    (0, _handleDom.hide)($confirmBtn);
  }

  /*
   * Custom text on cancel/confirm buttons
   */
  if (params.cancelButtonText) {
    $cancelBtn.innerHTML = (0, _handleDom.escapeHtml)(params.cancelButtonText);
  }
  if (params.confirmButtonText) {
    $confirmBtn.innerHTML = (0, _handleDom.escapeHtml)(params.confirmButtonText);
  }

  /*
   * Custom color on confirm button
   */
  if (params.confirmButtonColor) {
    // Set confirm button to selected background color
    $confirmBtn.style.backgroundColor = params.confirmButtonColor;

    // Set the confirm button color to the loading ring
    $confirmBtn.style.borderLeftColor = params.confirmLoadingButtonColor;
    $confirmBtn.style.borderRightColor = params.confirmLoadingButtonColor;

    // Set box-shadow to default focused button
    (0, _handleSwalDom.setFocusStyle)($confirmBtn, params.confirmButtonColor);
  }

  /*
   * Allow outside click
   */
  modal.setAttribute('data-allow-outside-click', params.allowOutsideClick);

  /*
   * Callback function
   */
  var hasDoneFunction = params.doneFunction ? true : false;
  modal.setAttribute('data-has-done-function', hasDoneFunction);

  /*
   * Animation
   */
  if (!params.animation) {
    modal.setAttribute('data-animation', 'none');
  } else if (typeof params.animation === 'string') {
    modal.setAttribute('data-animation', params.animation); // Custom animation
  } else {
      modal.setAttribute('data-animation', 'pop');
    }

  /*
   * Timer
   */
  modal.setAttribute('data-timer', params.timer);
};

exports['default'] = setParameters;
module.exports = exports['default'];

},{"./handle-dom":4,"./handle-swal-dom":6,"./utils":9}],9:[function(require,module,exports){
/*
 * Allow user to pass their own params
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var extend = function extend(a, b) {
  for (var key in b) {
    if (b.hasOwnProperty(key)) {
      a[key] = b[key];
    }
  }
  return a;
};

/*
 * Convert HEX codes to RGB values (#000000 -> rgb(0,0,0))
 */
var hexToRgb = function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? parseInt(result[1], 16) + ', ' + parseInt(result[2], 16) + ', ' + parseInt(result[3], 16) : null;
};

/*
 * Check if the user is using Internet Explorer 8 (for fallbacks)
 */
var isIE8 = function isIE8() {
  return window.attachEvent && !window.addEventListener;
};

/*
 * IE compatible logging for developers
 */
var logStr = function logStr(string) {
  if (window.console) {
    // IE...
    window.console.log('SweetAlert: ' + string);
  }
};

/*
 * Set hover, active and focus-states for buttons 
 * (source: http://www.sitepoint.com/javascript-generate-lighter-darker-color)
 */
var colorLuminance = function colorLuminance(hex, lum) {
  // Validate hex string
  hex = String(hex).replace(/[^0-9a-f]/gi, '');
  if (hex.length < 6) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  lum = lum || 0;

  // Convert to decimal and change luminosity
  var rgb = '#';
  var c;
  var i;

  for (i = 0; i < 3; i++) {
    c = parseInt(hex.substr(i * 2, 2), 16);
    c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
    rgb += ('00' + c).substr(c.length);
  }

  return rgb;
};

exports.extend = extend;
exports.hexToRgb = hexToRgb;
exports.isIE8 = isIE8;
exports.logStr = logStr;
exports.colorLuminance = colorLuminance;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbWFydGlqbnJvdXdlbmRhbC9LYWFydGplMmdvL3N3ZWV0YWxlcnQvZGV2L3N3ZWV0YWxlcnQuZXM2LmpzIiwiL1VzZXJzL21hcnRpam5yb3V3ZW5kYWwvS2FhcnRqZTJnby9zd2VldGFsZXJ0L2Rldi9tb2R1bGVzL2RlZmF1bHQtcGFyYW1zLmpzIiwiL1VzZXJzL21hcnRpam5yb3V3ZW5kYWwvS2FhcnRqZTJnby9zd2VldGFsZXJ0L2Rldi9tb2R1bGVzL2hhbmRsZS1jbGljay5qcyIsIi9Vc2Vycy9tYXJ0aWpucm91d2VuZGFsL0thYXJ0amUyZ28vc3dlZXRhbGVydC9kZXYvbW9kdWxlcy9oYW5kbGUtZG9tLmpzIiwiL1VzZXJzL21hcnRpam5yb3V3ZW5kYWwvS2FhcnRqZTJnby9zd2VldGFsZXJ0L2Rldi9tb2R1bGVzL2hhbmRsZS1rZXkuanMiLCIvVXNlcnMvbWFydGlqbnJvdXdlbmRhbC9LYWFydGplMmdvL3N3ZWV0YWxlcnQvZGV2L21vZHVsZXMvaGFuZGxlLXN3YWwtZG9tLmpzIiwiL1VzZXJzL21hcnRpam5yb3V3ZW5kYWwvS2FhcnRqZTJnby9zd2VldGFsZXJ0L2Rldi9tb2R1bGVzL2luamVjdGVkLWh0bWwuanMiLCIvVXNlcnMvbWFydGlqbnJvdXdlbmRhbC9LYWFydGplMmdvL3N3ZWV0YWxlcnQvZGV2L21vZHVsZXMvc2V0LXBhcmFtcy5qcyIsIi9Vc2Vycy9tYXJ0aWpucm91d2VuZGFsL0thYXJ0amUyZ28vc3dlZXRhbGVydC9kZXYvbW9kdWxlcy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7OztnQ0NnQk8sc0JBQXNCOzs7Ozs7NEJBV3RCLGlCQUFpQjs7Ozs7O29DQWNqQiwyQkFBMkI7Ozs7a0NBSXdCLHdCQUF3Qjs7Z0NBQ3hELHNCQUFzQjs7Ozs7O29DQUl0Qiww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RyxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQzNEO0FBQ0QsS0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUM7OztBQUdmLE1BQUksR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUNkLE1BQUksQ0FBQyxDQUFDO0FBQ04sTUFBSSxDQUFDLENBQUM7O0FBRU4sT0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDdEIsS0FBQyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdkMsS0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3JFLE9BQUcsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUEsQ0FBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQ3BDOztBQUVELFNBQU8sR0FBRyxDQUFDO0NBQ1osQ0FBQzs7UUFJQSxNQUFNLEdBQU4sTUFBTTtRQUNOLFFBQVEsR0FBUixRQUFRO1FBQ1IsS0FBSyxHQUFMLEtBQUs7UUFDTCxNQUFNLEdBQU4sTUFBTTtRQUNOLGNBQWMsR0FBZCxjQUFjIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIFN3ZWV0QWxlcnRcbi8vIDIwMTQtMjAxNSAoYykgLSBUcmlzdGFuIEVkd2FyZHNcbi8vIGdpdGh1Yi5jb20vdDR0NS9zd2VldGFsZXJ0XG5cbi8qXG4gKiBqUXVlcnktbGlrZSBmdW5jdGlvbnMgZm9yIG1hbmlwdWxhdGluZyB0aGUgRE9NXG4gKi9cbmltcG9ydCB7XG4gIGhhc0NsYXNzLCBhZGRDbGFzcywgcmVtb3ZlQ2xhc3MsXG4gIGVzY2FwZUh0bWwsXG4gIF9zaG93LCBzaG93LCBfaGlkZSwgaGlkZSxcbiAgaXNEZXNjZW5kYW50LFxuICBnZXRUb3BNYXJnaW4sXG4gIGZhZGVJbiwgZmFkZU91dCxcbiAgZmlyZUNsaWNrLFxuICBzdG9wRXZlbnRQcm9wYWdhdGlvblxufSBmcm9tICcuL21vZHVsZXMvaGFuZGxlLWRvbSc7XG5cbi8qXG4gKiBIYW5keSB1dGlsaXRpZXNcbiAqL1xuaW1wb3J0IHtcbiAgZXh0ZW5kLFxuICBoZXhUb1JnYixcbiAgaXNJRTgsXG4gIGxvZ1N0cixcbiAgY29sb3JMdW1pbmFuY2Vcbn0gZnJvbSAnLi9tb2R1bGVzL3V0aWxzJztcblxuLypcbiAqICBIYW5kbGUgc3dlZXRBbGVydCdzIERPTSBlbGVtZW50c1xuICovXG5pbXBvcnQge1xuICBzd2VldEFsZXJ0SW5pdGlhbGl6ZSxcbiAgZ2V0TW9kYWwsXG4gIGdldE92ZXJsYXksXG4gIGdldElucHV0LFxuICBzZXRGb2N1c1N0eWxlLFxuICBvcGVuTW9kYWwsXG4gIHJlc2V0SW5wdXQsXG4gIGZpeFZlcnRpY2FsUG9zaXRpb25cbn0gZnJvbSAnLi9tb2R1bGVzL2hhbmRsZS1zd2FsLWRvbSc7XG5cblxuLy8gSGFuZGxlIGJ1dHRvbiBldmVudHMgYW5kIGtleWJvYXJkIGV2ZW50c1xuaW1wb3J0IHsgaGFuZGxlQnV0dG9uLCBoYW5kbGVDb25maXJtLCBoYW5kbGVDYW5jZWwgfSBmcm9tICcuL21vZHVsZXMvaGFuZGxlLWNsaWNrJztcbmltcG9ydCBoYW5kbGVLZXlEb3duIGZyb20gJy4vbW9kdWxlcy9oYW5kbGUta2V5JztcblxuXG4vLyBEZWZhdWx0IHZhbHVlc1xuaW1wb3J0IGRlZmF1bHRQYXJhbXMgZnJvbSAnLi9tb2R1bGVzL2RlZmF1bHQtcGFyYW1zJztcbmltcG9ydCBzZXRQYXJhbWV0ZXJzIGZyb20gJy4vbW9kdWxlcy9zZXQtcGFyYW1zJztcblxuLypcbiAqIFJlbWVtYmVyIHN0YXRlIGluIGNhc2VzIHdoZXJlIG9wZW5pbmcgYW5kIGhhbmRsaW5nIGEgbW9kYWwgd2lsbCBmaWRkbGUgd2l0aCBpdC5cbiAqIChXZSBhbHNvIHVzZSB3aW5kb3cucHJldmlvdXNBY3RpdmVFbGVtZW50IGFzIGEgZ2xvYmFsIHZhcmlhYmxlKVxuICovXG52YXIgcHJldmlvdXNXaW5kb3dLZXlEb3duO1xudmFyIGxhc3RGb2N1c2VkQnV0dG9uO1xuXG5cbi8qXG4gKiBHbG9iYWwgc3dlZXRBbGVydCBmdW5jdGlvblxuICogKHRoaXMgaXMgd2hhdCB0aGUgdXNlciBjYWxscylcbiAqL1xudmFyIHN3ZWV0QWxlcnQsIHN3YWw7XG5cbmV4cG9ydCBkZWZhdWx0IHN3ZWV0QWxlcnQgPSBzd2FsID0gZnVuY3Rpb24oKSB7XG4gIHZhciBjdXN0b21pemF0aW9ucyA9IGFyZ3VtZW50c1swXTtcblxuICBhZGRDbGFzcyhkb2N1bWVudC5ib2R5LCAnc3RvcC1zY3JvbGxpbmcnKTtcbiAgcmVzZXRJbnB1dCgpO1xuXG4gIC8qXG4gICAqIFVzZSBhcmd1bWVudCBpZiBkZWZpbmVkIG9yIGRlZmF1bHQgdmFsdWUgZnJvbSBwYXJhbXMgb2JqZWN0IG90aGVyd2lzZS5cbiAgICogU3VwcG9ydHMgdGhlIGNhc2Ugd2hlcmUgYSBkZWZhdWx0IHZhbHVlIGlzIGJvb2xlYW4gdHJ1ZSBhbmQgc2hvdWxkIGJlXG4gICAqIG92ZXJyaWRkZW4gYnkgYSBjb3JyZXNwb25kaW5nIGV4cGxpY2l0IGFyZ3VtZW50IHdoaWNoIGlzIGJvb2xlYW4gZmFsc2UuXG4gICAqL1xuICBmdW5jdGlvbiBhcmd1bWVudE9yRGVmYXVsdChrZXkpIHtcbiAgICB2YXIgYXJncyA9IGN1c3RvbWl6YXRpb25zO1xuICAgIHJldHVybiAoYXJnc1trZXldID09PSB1bmRlZmluZWQpID8gIGRlZmF1bHRQYXJhbXNba2V5XSA6IGFyZ3Nba2V5XTtcbiAgfVxuXG4gIGlmIChjdXN0b21pemF0aW9ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgbG9nU3RyKCdTd2VldEFsZXJ0IGV4cGVjdHMgYXQgbGVhc3QgMSBhdHRyaWJ1dGUhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHBhcmFtcyA9IGV4dGVuZCh7fSwgZGVmYXVsdFBhcmFtcyk7XG5cbiAgc3dpdGNoICh0eXBlb2YgY3VzdG9taXphdGlvbnMpIHtcblxuICAgIC8vIEV4OiBzd2FsKFwiSGVsbG9cIiwgXCJKdXN0IHRlc3RpbmdcIiwgXCJpbmZvXCIpO1xuICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICBwYXJhbXMudGl0bGUgPSBjdXN0b21pemF0aW9ucztcbiAgICAgIHBhcmFtcy50ZXh0ICA9IGFyZ3VtZW50c1sxXSB8fCAnJztcbiAgICAgIHBhcmFtcy50eXBlICA9IGFyZ3VtZW50c1syXSB8fCAnJztcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gRXg6IHN3YWwoeyB0aXRsZTpcIkhlbGxvXCIsIHRleHQ6IFwiSnVzdCB0ZXN0aW5nXCIsIHR5cGU6IFwiaW5mb1wiIH0pO1xuICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICBpZiAoY3VzdG9taXphdGlvbnMudGl0bGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBsb2dTdHIoJ01pc3NpbmcgXCJ0aXRsZVwiIGFyZ3VtZW50IScpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHBhcmFtcy50aXRsZSA9IGN1c3RvbWl6YXRpb25zLnRpdGxlO1xuXG4gICAgICBmb3IgKGxldCBjdXN0b21OYW1lIGluIGRlZmF1bHRQYXJhbXMpIHtcbiAgICAgICAgcGFyYW1zW2N1c3RvbU5hbWVdID0gYXJndW1lbnRPckRlZmF1bHQoY3VzdG9tTmFtZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNob3cgXCJDb25maXJtXCIgaW5zdGVhZCBvZiBcIk9LXCIgaWYgY2FuY2VsIGJ1dHRvbiBpcyB2aXNpYmxlXG4gICAgICBwYXJhbXMuY29uZmlybUJ1dHRvblRleHQgPSBwYXJhbXMuc2hvd0NhbmNlbEJ1dHRvbiA/ICdDb25maXJtJyA6IGRlZmF1bHRQYXJhbXMuY29uZmlybUJ1dHRvblRleHQ7XG4gICAgICBwYXJhbXMuY29uZmlybUJ1dHRvblRleHQgPSBhcmd1bWVudE9yRGVmYXVsdCgnY29uZmlybUJ1dHRvblRleHQnKTtcblxuICAgICAgLy8gQ2FsbGJhY2sgZnVuY3Rpb24gd2hlbiBjbGlja2luZyBvbiBcIk9LXCIvXCJDYW5jZWxcIlxuICAgICAgcGFyYW1zLmRvbmVGdW5jdGlvbiA9IGFyZ3VtZW50c1sxXSB8fCBudWxsO1xuXG4gICAgICBicmVhaztcblxuICAgIGRlZmF1bHQ6XG4gICAgICBsb2dTdHIoJ1VuZXhwZWN0ZWQgdHlwZSBvZiBhcmd1bWVudCEgRXhwZWN0ZWQgXCJzdHJpbmdcIiBvciBcIm9iamVjdFwiLCBnb3QgJyArIHR5cGVvZiBjdXN0b21pemF0aW9ucyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgfVxuXG4gIHNldFBhcmFtZXRlcnMocGFyYW1zKTtcbiAgZml4VmVydGljYWxQb3NpdGlvbigpO1xuICBvcGVuTW9kYWwoYXJndW1lbnRzWzFdKTtcblxuICAvLyBNb2RhbCBpbnRlcmFjdGlvbnNcbiAgdmFyIG1vZGFsID0gZ2V0TW9kYWwoKTtcblxuXG4gIC8qXG4gICAqIE1ha2Ugc3VyZSBhbGwgbW9kYWwgYnV0dG9ucyByZXNwb25kIHRvIGFsbCBldmVudHNcbiAgICovXG4gIHZhciAkYnV0dG9ucyA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvbicpO1xuICB2YXIgYnV0dG9uRXZlbnRzID0gWydvbmNsaWNrJywgJ29ubW91c2VvdmVyJywgJ29ubW91c2VvdXQnLCAnb25tb3VzZWRvd24nLCAnb25tb3VzZXVwJywgJ29uZm9jdXMnXTtcbiAgdmFyIG9uQnV0dG9uRXZlbnQgPSAoZSkgPT4gaGFuZGxlQnV0dG9uKGUsIHBhcmFtcywgbW9kYWwpO1xuXG4gIGZvciAobGV0IGJ0bkluZGV4ID0gMDsgYnRuSW5kZXggPCAkYnV0dG9ucy5sZW5ndGg7IGJ0bkluZGV4KyspIHtcbiAgICBmb3IgKGxldCBldnRJbmRleCA9IDA7IGV2dEluZGV4IDwgYnV0dG9uRXZlbnRzLmxlbmd0aDsgZXZ0SW5kZXgrKykge1xuICAgICAgbGV0IGJ0bkV2dCA9IGJ1dHRvbkV2ZW50c1tldnRJbmRleF07XG4gICAgICAkYnV0dG9uc1tidG5JbmRleF1bYnRuRXZ0XSA9IG9uQnV0dG9uRXZlbnQ7XG4gICAgfVxuICB9XG5cbiAgLy8gQ2xpY2tpbmcgb3V0c2lkZSB0aGUgbW9kYWwgZGlzbWlzc2VzIGl0IChpZiBhbGxvd2VkIGJ5IHVzZXIpXG4gIGdldE92ZXJsYXkoKS5vbmNsaWNrID0gb25CdXR0b25FdmVudDtcblxuICBwcmV2aW91c1dpbmRvd0tleURvd24gPSB3aW5kb3cub25rZXlkb3duO1xuXG4gIHZhciBvbktleUV2ZW50ID0gKGUpID0+IGhhbmRsZUtleURvd24oZSwgcGFyYW1zLCBtb2RhbCk7XG4gIHdpbmRvdy5vbmtleWRvd24gPSBvbktleUV2ZW50O1xuXG4gIHdpbmRvdy5vbmZvY3VzID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIFdoZW4gdGhlIHVzZXIgaGFzIGZvY3VzZWQgYXdheSBhbmQgZm9jdXNlZCBiYWNrIGZyb20gdGhlIHdob2xlIHdpbmRvdy5cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIFB1dCBpbiBhIHRpbWVvdXQgdG8ganVtcCBvdXQgb2YgdGhlIGV2ZW50IHNlcXVlbmNlLlxuICAgICAgLy8gQ2FsbGluZyBmb2N1cygpIGluIHRoZSBldmVudCBzZXF1ZW5jZSBjb25mdXNlcyB0aGluZ3MuXG4gICAgICBpZiAobGFzdEZvY3VzZWRCdXR0b24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBsYXN0Rm9jdXNlZEJ1dHRvbi5mb2N1cygpO1xuICAgICAgICBsYXN0Rm9jdXNlZEJ1dHRvbiA9IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICB9LCAwKTtcbiAgfTtcbiAgXG4gIC8vIFNob3cgYWxlcnQgd2l0aCBlbmFibGVkIGJ1dHRvbnMgYWx3YXlzXG4gIHN3YWwuZW5hYmxlQnV0dG9ucygpO1xufTtcblxuXG5cbi8qXG4gKiBTZXQgZGVmYXVsdCBwYXJhbXMgZm9yIGVhY2ggcG9wdXBcbiAqIEBwYXJhbSB7T2JqZWN0fSB1c2VyUGFyYW1zXG4gKi9cbnN3ZWV0QWxlcnQuc2V0RGVmYXVsdHMgPSBzd2FsLnNldERlZmF1bHRzID0gZnVuY3Rpb24odXNlclBhcmFtcykge1xuICBpZiAoIXVzZXJQYXJhbXMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VzZXJQYXJhbXMgaXMgcmVxdWlyZWQnKTtcbiAgfVxuICBpZiAodHlwZW9mIHVzZXJQYXJhbXMgIT09ICdvYmplY3QnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1c2VyUGFyYW1zIGhhcyB0byBiZSBhIG9iamVjdCcpO1xuICB9XG5cbiAgZXh0ZW5kKGRlZmF1bHRQYXJhbXMsIHVzZXJQYXJhbXMpO1xufTtcblxuXG4vKlxuICogQW5pbWF0aW9uIHdoZW4gY2xvc2luZyBtb2RhbFxuICovXG5zd2VldEFsZXJ0LmNsb3NlID0gc3dhbC5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbW9kYWwgPSBnZXRNb2RhbCgpO1xuXG4gIGZhZGVPdXQoZ2V0T3ZlcmxheSgpLCA1KTtcbiAgZmFkZU91dChtb2RhbCwgNSk7XG4gIHJlbW92ZUNsYXNzKG1vZGFsLCAnc2hvd1N3ZWV0QWxlcnQnKTtcbiAgYWRkQ2xhc3MobW9kYWwsICdoaWRlU3dlZXRBbGVydCcpO1xuICByZW1vdmVDbGFzcyhtb2RhbCwgJ3Zpc2libGUnKTtcblxuICAvKlxuICAgKiBSZXNldCBpY29uIGFuaW1hdGlvbnNcbiAgICovXG4gIHZhciAkc3VjY2Vzc0ljb24gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCcuc2EtaWNvbi5zYS1zdWNjZXNzJyk7XG4gIHJlbW92ZUNsYXNzKCRzdWNjZXNzSWNvbiwgJ2FuaW1hdGUnKTtcbiAgcmVtb3ZlQ2xhc3MoJHN1Y2Nlc3NJY29uLnF1ZXJ5U2VsZWN0b3IoJy5zYS10aXAnKSwgJ2FuaW1hdGVTdWNjZXNzVGlwJyk7XG4gIHJlbW92ZUNsYXNzKCRzdWNjZXNzSWNvbi5xdWVyeVNlbGVjdG9yKCcuc2EtbG9uZycpLCAnYW5pbWF0ZVN1Y2Nlc3NMb25nJyk7XG5cbiAgdmFyICRlcnJvckljb24gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCcuc2EtaWNvbi5zYS1lcnJvcicpO1xuICByZW1vdmVDbGFzcygkZXJyb3JJY29uLCAnYW5pbWF0ZUVycm9ySWNvbicpO1xuICByZW1vdmVDbGFzcygkZXJyb3JJY29uLnF1ZXJ5U2VsZWN0b3IoJy5zYS14LW1hcmsnKSwgJ2FuaW1hdGVYTWFyaycpO1xuXG4gIHZhciAkd2FybmluZ0ljb24gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCcuc2EtaWNvbi5zYS13YXJuaW5nJyk7XG4gIHJlbW92ZUNsYXNzKCR3YXJuaW5nSWNvbiwgJ3B1bHNlV2FybmluZycpO1xuICByZW1vdmVDbGFzcygkd2FybmluZ0ljb24ucXVlcnlTZWxlY3RvcignLnNhLWJvZHknKSwgJ3B1bHNlV2FybmluZ0lucycpO1xuICByZW1vdmVDbGFzcygkd2FybmluZ0ljb24ucXVlcnlTZWxlY3RvcignLnNhLWRvdCcpLCAncHVsc2VXYXJuaW5nSW5zJyk7XG5cbiAgLy8gUmVzZXQgY3VzdG9tIGNsYXNzIChkZWxheSBzbyB0aGF0IFVJIGNoYW5nZXMgYXJlbid0IHZpc2libGUpXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGN1c3RvbUNsYXNzID0gbW9kYWwuZ2V0QXR0cmlidXRlKCdkYXRhLWN1c3RvbS1jbGFzcycpO1xuICAgIHJlbW92ZUNsYXNzKG1vZGFsLCBjdXN0b21DbGFzcyk7XG4gIH0sIDMwMCk7XG5cbiAgLy8gTWFrZSBwYWdlIHNjcm9sbGFibGUgYWdhaW5cbiAgcmVtb3ZlQ2xhc3MoZG9jdW1lbnQuYm9keSwgJ3N0b3Atc2Nyb2xsaW5nJyk7XG5cbiAgLy8gUmVzZXQgdGhlIHBhZ2UgdG8gaXRzIHByZXZpb3VzIHN0YXRlXG4gIHdpbmRvdy5vbmtleWRvd24gPSBwcmV2aW91c1dpbmRvd0tleURvd247XG4gIGlmICh3aW5kb3cucHJldmlvdXNBY3RpdmVFbGVtZW50KSB7XG4gICAgd2luZG93LnByZXZpb3VzQWN0aXZlRWxlbWVudC5mb2N1cygpO1xuICB9XG4gIGxhc3RGb2N1c2VkQnV0dG9uID0gdW5kZWZpbmVkO1xuICBjbGVhclRpbWVvdXQobW9kYWwudGltZW91dCk7XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5cbi8qXG4gKiBWYWxpZGF0aW9uIG9mIHRoZSBpbnB1dCBmaWVsZCBpcyBkb25lIGJ5IHVzZXJcbiAqIElmIHNvbWV0aGluZyBpcyB3cm9uZyA9PiBjYWxsIHNob3dJbnB1dEVycm9yIHdpdGggZXJyb3JNZXNzYWdlXG4gKi9cbnN3ZWV0QWxlcnQuc2hvd0lucHV0RXJyb3IgPSBzd2FsLnNob3dJbnB1dEVycm9yID0gZnVuY3Rpb24oZXJyb3JNZXNzYWdlKSB7XG4gIHZhciBtb2RhbCA9IGdldE1vZGFsKCk7XG5cbiAgdmFyICRlcnJvckljb24gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCcuc2EtaW5wdXQtZXJyb3InKTtcbiAgYWRkQ2xhc3MoJGVycm9ySWNvbiwgJ3Nob3cnKTtcblxuICB2YXIgJGVycm9yQ29udGFpbmVyID0gbW9kYWwucXVlcnlTZWxlY3RvcignLnNhLWVycm9yLWNvbnRhaW5lcicpO1xuICBhZGRDbGFzcygkZXJyb3JDb250YWluZXIsICdzaG93Jyk7XG5cbiAgJGVycm9yQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ3AnKS5pbm5lckhUTUwgPSBlcnJvck1lc3NhZ2U7XG5cbiAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICBzd2VldEFsZXJ0LmVuYWJsZUJ1dHRvbnMoKTtcbiAgfSwgMSk7XG5cbiAgbW9kYWwucXVlcnlTZWxlY3RvcignaW5wdXQnKS5mb2N1cygpO1xufTtcblxuXG4vKlxuICogUmVzZXQgaW5wdXQgZXJyb3IgRE9NIGVsZW1lbnRzXG4gKi9cbnN3ZWV0QWxlcnQucmVzZXRJbnB1dEVycm9yID0gc3dhbC5yZXNldElucHV0RXJyb3IgPSBmdW5jdGlvbihldmVudCkge1xuICAvLyBJZiBwcmVzcyBlbnRlciA9PiBpZ25vcmVcbiAgaWYgKGV2ZW50ICYmIGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyICRtb2RhbCA9IGdldE1vZGFsKCk7XG5cbiAgdmFyICRlcnJvckljb24gPSAkbW9kYWwucXVlcnlTZWxlY3RvcignLnNhLWlucHV0LWVycm9yJyk7XG4gIHJlbW92ZUNsYXNzKCRlcnJvckljb24sICdzaG93Jyk7XG5cbiAgdmFyICRlcnJvckNvbnRhaW5lciA9ICRtb2RhbC5xdWVyeVNlbGVjdG9yKCcuc2EtZXJyb3ItY29udGFpbmVyJyk7XG4gIHJlbW92ZUNsYXNzKCRlcnJvckNvbnRhaW5lciwgJ3Nob3cnKTtcbn07XG5cbi8qXG4gKiBEaXNhYmxlIGNvbmZpcm0gYW5kIGNhbmNlbCBidXR0b25zXG4gKi9cbnN3ZWV0QWxlcnQuZGlzYWJsZUJ1dHRvbnMgPSBzd2FsLmRpc2FibGVCdXR0b25zID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgdmFyIG1vZGFsID0gZ2V0TW9kYWwoKTtcbiAgdmFyICRjb25maXJtQnV0dG9uID0gbW9kYWwucXVlcnlTZWxlY3RvcignYnV0dG9uLmNvbmZpcm0nKTtcbiAgdmFyICRjYW5jZWxCdXR0b24gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCdidXR0b24uY2FuY2VsJyk7XG4gICRjb25maXJtQnV0dG9uLmRpc2FibGVkID0gdHJ1ZTtcbiAgJGNhbmNlbEJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG59O1xuXG4vKlxuICogRW5hYmxlIGNvbmZpcm0gYW5kIGNhbmNlbCBidXR0b25zXG4gKi9cbnN3ZWV0QWxlcnQuZW5hYmxlQnV0dG9ucyA9IHN3YWwuZW5hYmxlQnV0dG9ucyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gIHZhciBtb2RhbCA9IGdldE1vZGFsKCk7XG4gIHZhciAkY29uZmlybUJ1dHRvbiA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5jb25maXJtJyk7XG4gIHZhciAkY2FuY2VsQnV0dG9uID0gbW9kYWwucXVlcnlTZWxlY3RvcignYnV0dG9uLmNhbmNlbCcpO1xuICAkY29uZmlybUJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xuICAkY2FuY2VsQnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XG59O1xuXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgLy8gVGhlICdoYW5kbGUtY2xpY2snIG1vZHVsZSByZXF1aXJlc1xuICAvLyB0aGF0ICdzd2VldEFsZXJ0JyB3YXMgc2V0IGFzIGdsb2JhbC5cbiAgd2luZG93LnN3ZWV0QWxlcnQgPSB3aW5kb3cuc3dhbCA9IHN3ZWV0QWxlcnQ7XG59IGVsc2Uge1xuICBsb2dTdHIoJ1N3ZWV0QWxlcnQgaXMgYSBmcm9udGVuZCBtb2R1bGUhJyk7XG59XG4iLCJ2YXIgZGVmYXVsdFBhcmFtcyA9IHtcbiAgdGl0bGU6ICcnLFxuICB0ZXh0OiAnJyxcbiAgdHlwZTogbnVsbCxcbiAgYWxsb3dPdXRzaWRlQ2xpY2s6IGZhbHNlLFxuICBzaG93Q29uZmlybUJ1dHRvbjogdHJ1ZSxcbiAgc2hvd0NhbmNlbEJ1dHRvbjogZmFsc2UsXG4gIGNsb3NlT25Db25maXJtOiB0cnVlLFxuICBjbG9zZU9uQ2FuY2VsOiB0cnVlLFxuICBjb25maXJtQnV0dG9uVGV4dDogJ09LJyxcbiAgY29uZmlybUJ1dHRvbkNvbG9yOiAnI0MwMUE3RCcsXG4gIGNhbmNlbEJ1dHRvblRleHQ6ICdDYW5jZWwnLFxuICBpbWFnZVVybDogbnVsbCxcbiAgaW1hZ2VTaXplOiBudWxsLFxuICB0aW1lcjogbnVsbCxcbiAgY3VzdG9tQ2xhc3M6ICcnLFxuICBodG1sOiBmYWxzZSxcbiAgYW5pbWF0aW9uOiB0cnVlLFxuICBkaXNhYmxlS2V5czogZmFsc2UsXG4gIGFsbG93RXNjYXBlS2V5OiB0cnVlLFxuICBhbGxvd1JldHVybktleTogdHJ1ZSxcbiAgaW5wdXRUeXBlOiAndGV4dCcsXG4gIGlucHV0UGxhY2Vob2xkZXI6ICcnLFxuICBpbnB1dFZhbHVlOiAnJyxcbiAgc2hvd0xvYWRlck9uQ29uZmlybTogZmFsc2Vcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmF1bHRQYXJhbXM7XG4iLCJpbXBvcnQgeyBjb2xvckx1bWluYW5jZSB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgZ2V0TW9kYWwgfSBmcm9tICcuL2hhbmRsZS1zd2FsLWRvbSc7XG5pbXBvcnQgeyBoYXNDbGFzcywgaXNEZXNjZW5kYW50IH0gZnJvbSAnLi9oYW5kbGUtZG9tJztcblxuXG4vKlxuICogVXNlciBjbGlja2VkIG9uIFwiQ29uZmlybVwiL1wiT0tcIiBvciBcIkNhbmNlbFwiXG4gKi9cbnZhciBoYW5kbGVCdXR0b24gPSBmdW5jdGlvbihldmVudCwgcGFyYW1zLCBtb2RhbCkge1xuICB2YXIgZSA9IGV2ZW50IHx8IHdpbmRvdy5ldmVudDtcbiAgdmFyIHRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcblxuICB2YXIgdGFyZ2V0ZWRDb25maXJtID0gdGFyZ2V0LmNsYXNzTmFtZS5pbmRleE9mKCdjb25maXJtJykgIT09IC0xO1xuICB2YXIgdGFyZ2V0ZWRPdmVybGF5ID0gdGFyZ2V0LmNsYXNzTmFtZS5pbmRleE9mKCdzd2VldC1vdmVybGF5JykgIT09IC0xO1xuICB2YXIgbW9kYWxJc1Zpc2libGUgID0gaGFzQ2xhc3MobW9kYWwsICd2aXNpYmxlJyk7XG4gIHZhciBkb25lRnVuY3Rpb25FeGlzdHMgPSAocGFyYW1zLmRvbmVGdW5jdGlvbiAmJiBtb2RhbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaGFzLWRvbmUtZnVuY3Rpb24nKSA9PT0gJ3RydWUnKTtcblxuICAvLyBTaW5jZSB0aGUgdXNlciBjYW4gY2hhbmdlIHRoZSBiYWNrZ3JvdW5kLWNvbG9yIG9mIHRoZSBjb25maXJtIGJ1dHRvbiBwcm9ncmFtbWF0aWNhbGx5LFxuICAvLyB3ZSBtdXN0IGNhbGN1bGF0ZSB3aGF0IHRoZSBjb2xvciBzaG91bGQgYmUgb24gaG92ZXIvYWN0aXZlXG4gIHZhciBub3JtYWxDb2xvciwgaG92ZXJDb2xvciwgYWN0aXZlQ29sb3I7XG4gIGlmICh0YXJnZXRlZENvbmZpcm0gJiYgcGFyYW1zLmNvbmZpcm1CdXR0b25Db2xvcikge1xuICAgIG5vcm1hbENvbG9yICA9IHBhcmFtcy5jb25maXJtQnV0dG9uQ29sb3I7XG4gICAgaG92ZXJDb2xvciAgID0gY29sb3JMdW1pbmFuY2Uobm9ybWFsQ29sb3IsIC0wLjA0KTtcbiAgICBhY3RpdmVDb2xvciAgPSBjb2xvckx1bWluYW5jZShub3JtYWxDb2xvciwgLTAuMTQpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2hvdWxkU2V0Q29uZmlybUJ1dHRvbkNvbG9yKGNvbG9yKSB7XG4gICAgaWYgKHRhcmdldGVkQ29uZmlybSAmJiBwYXJhbXMuY29uZmlybUJ1dHRvbkNvbG9yKSB7XG4gICAgICB0YXJnZXQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gY29sb3I7XG4gICAgfVxuICB9XG5cbiAgc3dpdGNoIChlLnR5cGUpIHtcbiAgICBjYXNlICdtb3VzZW92ZXInOlxuICAgICAgc2hvdWxkU2V0Q29uZmlybUJ1dHRvbkNvbG9yKGhvdmVyQ29sb3IpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdtb3VzZW91dCc6XG4gICAgICBzaG91bGRTZXRDb25maXJtQnV0dG9uQ29sb3Iobm9ybWFsQ29sb3IpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdtb3VzZWRvd24nOlxuICAgICAgc2hvdWxkU2V0Q29uZmlybUJ1dHRvbkNvbG9yKGFjdGl2ZUNvbG9yKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnbW91c2V1cCc6XG4gICAgICBzaG91bGRTZXRDb25maXJtQnV0dG9uQ29sb3IoaG92ZXJDb2xvcik7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2ZvY3VzJzpcbiAgICAgIGxldCAkY29uZmlybUJ1dHRvbiA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5jb25maXJtJyk7XG4gICAgICBsZXQgJGNhbmNlbEJ1dHRvbiAgPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCdidXR0b24uY2FuY2VsJyk7XG5cbiAgICAgIGlmICh0YXJnZXRlZENvbmZpcm0pIHtcbiAgICAgICAgJGNhbmNlbEJ1dHRvbi5zdHlsZS5ib3hTaGFkb3cgPSAnbm9uZSc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkY29uZmlybUJ1dHRvbi5zdHlsZS5ib3hTaGFkb3cgPSAnbm9uZSc7XG4gICAgICB9XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2NsaWNrJzpcbiAgICAgIGxldCBjbGlja2VkT25Nb2RhbCA9IChtb2RhbCA9PT0gdGFyZ2V0KTtcbiAgICAgIGxldCBjbGlja2VkT25Nb2RhbENoaWxkID0gaXNEZXNjZW5kYW50KG1vZGFsLCB0YXJnZXQpO1xuXG4gICAgICAvLyBJZ25vcmUgY2xpY2sgb3V0c2lkZSBpZiBhbGxvd091dHNpZGVDbGljayBpcyBmYWxzZVxuICAgICAgaWYgKCFjbGlja2VkT25Nb2RhbCAmJiAhY2xpY2tlZE9uTW9kYWxDaGlsZCAmJiBtb2RhbElzVmlzaWJsZSAmJiAhcGFyYW1zLmFsbG93T3V0c2lkZUNsaWNrKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBpZiAodGFyZ2V0ZWRDb25maXJtICYmIGRvbmVGdW5jdGlvbkV4aXN0cyAmJiBtb2RhbElzVmlzaWJsZSkge1xuICAgICAgICBoYW5kbGVDb25maXJtKG1vZGFsLCBwYXJhbXMpO1xuICAgICAgfSBlbHNlIGlmIChkb25lRnVuY3Rpb25FeGlzdHMgJiYgbW9kYWxJc1Zpc2libGUgfHwgdGFyZ2V0ZWRPdmVybGF5KSB7XG4gICAgICAgIGhhbmRsZUNhbmNlbChtb2RhbCwgcGFyYW1zKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNEZXNjZW5kYW50KG1vZGFsLCB0YXJnZXQpICYmIHRhcmdldC50YWdOYW1lID09PSAnQlVUVE9OJykge1xuICAgICAgICBzd2VldEFsZXJ0LmNsb3NlKCk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgfVxufTtcblxuLypcbiAqICBVc2VyIGNsaWNrZWQgb24gXCJDb25maXJtXCIvXCJPS1wiXG4gKi9cbnZhciBoYW5kbGVDb25maXJtID0gZnVuY3Rpb24obW9kYWwsIHBhcmFtcykge1xuICB2YXIgY2FsbGJhY2tWYWx1ZSA9IHRydWU7XG5cbiAgaWYgKGhhc0NsYXNzKG1vZGFsLCAnc2hvdy1pbnB1dCcpKSB7XG4gICAgY2FsbGJhY2tWYWx1ZSA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0JykudmFsdWU7XG5cbiAgICBpZiAoIWNhbGxiYWNrVmFsdWUpIHtcbiAgICAgIGNhbGxiYWNrVmFsdWUgPSAnJztcbiAgICB9XG4gIH1cblxuICBwYXJhbXMuZG9uZUZ1bmN0aW9uKGNhbGxiYWNrVmFsdWUpO1xuXG4gIGlmIChwYXJhbXMuY2xvc2VPbkNvbmZpcm0pIHtcbiAgICBzd2VldEFsZXJ0LmNsb3NlKCk7XG4gIH1cbiAgLy8gRGlzYWJsZSBjYW5jZWwgYW5kIGNvbmZpcm0gYnV0dG9uIGlmIHRoZSBwYXJhbWV0ZXIgaXMgdHJ1ZVxuICBpZiAocGFyYW1zLnNob3dMb2FkZXJPbkNvbmZpcm0pIHtcbiAgICBzd2VldEFsZXJ0LmRpc2FibGVCdXR0b25zKCk7XG4gIH1cbn07XG5cbi8qXG4gKiAgVXNlciBjbGlja2VkIG9uIFwiQ2FuY2VsXCJcbiAqL1xudmFyIGhhbmRsZUNhbmNlbCA9IGZ1bmN0aW9uKG1vZGFsLCBwYXJhbXMpIHtcbiAgcGFyYW1zLmRvbmVGdW5jdGlvbihmYWxzZSk7XG5cbiAgaWYgKHBhcmFtcy5jbG9zZU9uQ2FuY2VsKSB7XG4gICAgc3dlZXRBbGVydC5jbG9zZSgpO1xuICB9XG59O1xuXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgaGFuZGxlQnV0dG9uLFxuICBoYW5kbGVDb25maXJtLFxuICBoYW5kbGVDYW5jZWxcbn07XG4iLCJ2YXIgaGFzQ2xhc3MgPSBmdW5jdGlvbihlbGVtLCBjbGFzc05hbWUpIHtcbiAgcmV0dXJuIG5ldyBSZWdFeHAoJyAnICsgY2xhc3NOYW1lICsgJyAnKS50ZXN0KCcgJyArIGVsZW0uY2xhc3NOYW1lICsgJyAnKTtcbn07XG5cbnZhciBhZGRDbGFzcyA9IGZ1bmN0aW9uKGVsZW0sIGNsYXNzTmFtZSkge1xuICBpZiAoIWhhc0NsYXNzKGVsZW0sIGNsYXNzTmFtZSkpIHtcbiAgICBlbGVtLmNsYXNzTmFtZSArPSAnICcgKyBjbGFzc05hbWU7XG4gIH1cbn07XG5cbnZhciByZW1vdmVDbGFzcyA9IGZ1bmN0aW9uKGVsZW0sIGNsYXNzTmFtZSkge1xuICB2YXIgbmV3Q2xhc3MgPSAnICcgKyBlbGVtLmNsYXNzTmFtZS5yZXBsYWNlKC9bXFx0XFxyXFxuXS9nLCAnICcpICsgJyAnO1xuICBpZiAoaGFzQ2xhc3MoZWxlbSwgY2xhc3NOYW1lKSkge1xuICAgIHdoaWxlIChuZXdDbGFzcy5pbmRleE9mKCcgJyArIGNsYXNzTmFtZSArICcgJykgPj0gMCkge1xuICAgICAgbmV3Q2xhc3MgPSBuZXdDbGFzcy5yZXBsYWNlKCcgJyArIGNsYXNzTmFtZSArICcgJywgJyAnKTtcbiAgICB9XG4gICAgZWxlbS5jbGFzc05hbWUgPSBuZXdDbGFzcy5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG4gIH1cbn07XG5cbnZhciBlc2NhcGVIdG1sID0gZnVuY3Rpb24oc3RyKSB7XG4gIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgZGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHN0cikpO1xuICByZXR1cm4gZGl2LmlubmVySFRNTDtcbn07XG5cbnZhciBfc2hvdyA9IGZ1bmN0aW9uKGVsZW0pIHtcbiAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gJyc7XG4gIGVsZW0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG59O1xuXG52YXIgc2hvdyA9IGZ1bmN0aW9uKGVsZW1zKSB7XG4gIGlmIChlbGVtcyAmJiAhZWxlbXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIF9zaG93KGVsZW1zKTtcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1zLmxlbmd0aDsgKytpKSB7XG4gICAgX3Nob3coZWxlbXNbaV0pO1xuICB9XG59O1xuXG52YXIgX2hpZGUgPSBmdW5jdGlvbihlbGVtKSB7XG4gIGVsZW0uc3R5bGUub3BhY2l0eSA9ICcnO1xuICBlbGVtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG59O1xuXG52YXIgaGlkZSA9IGZ1bmN0aW9uKGVsZW1zKSB7XG4gIGlmIChlbGVtcyAmJiAhZWxlbXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIF9oaWRlKGVsZW1zKTtcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1zLmxlbmd0aDsgKytpKSB7XG4gICAgX2hpZGUoZWxlbXNbaV0pO1xuICB9XG59O1xuXG52YXIgaXNEZXNjZW5kYW50ID0gZnVuY3Rpb24ocGFyZW50LCBjaGlsZCkge1xuICB2YXIgbm9kZSA9IGNoaWxkLnBhcmVudE5vZGU7XG4gIHdoaWxlIChub2RlICE9PSBudWxsKSB7XG4gICAgaWYgKG5vZGUgPT09IHBhcmVudCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIG5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxudmFyIGdldFRvcE1hcmdpbiA9IGZ1bmN0aW9uKGVsZW0pIHtcbiAgZWxlbS5zdHlsZS5sZWZ0ID0gJy05OTk5cHgnO1xuICBlbGVtLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXG4gIHZhciBoZWlnaHQgPSBlbGVtLmNsaWVudEhlaWdodCxcbiAgICAgIHBhZGRpbmc7XG4gIGlmICh0eXBlb2YgZ2V0Q29tcHV0ZWRTdHlsZSAhPT0gXCJ1bmRlZmluZWRcIikgeyAvLyBJRSA4XG4gICAgcGFkZGluZyA9IHBhcnNlSW50KGdldENvbXB1dGVkU3R5bGUoZWxlbSkuZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy10b3AnKSwgMTApO1xuICB9IGVsc2Uge1xuICAgIHBhZGRpbmcgPSBwYXJzZUludChlbGVtLmN1cnJlbnRTdHlsZS5wYWRkaW5nKTtcbiAgfVxuXG4gIGVsZW0uc3R5bGUubGVmdCA9ICcnO1xuICBlbGVtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIHJldHVybiAoJy0nICsgcGFyc2VJbnQoKGhlaWdodCArIHBhZGRpbmcpIC8gMikgKyAncHgnKTtcbn07XG5cbnZhciBmYWRlSW4gPSBmdW5jdGlvbihlbGVtLCBpbnRlcnZhbCkge1xuICBpZiAoK2VsZW0uc3R5bGUub3BhY2l0eSA8IDEpIHtcbiAgICBpbnRlcnZhbCA9IGludGVydmFsIHx8IDE2O1xuICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICB2YXIgbGFzdCA9ICtuZXcgRGF0ZSgpO1xuICAgIHZhciB0aWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICBlbGVtLnN0eWxlLm9wYWNpdHkgPSArZWxlbS5zdHlsZS5vcGFjaXR5ICsgKG5ldyBEYXRlKCkgLSBsYXN0KSAvIDEwMDtcbiAgICAgIGxhc3QgPSArbmV3IERhdGUoKTtcblxuICAgICAgaWYgKCtlbGVtLnN0eWxlLm9wYWNpdHkgPCAxKSB7XG4gICAgICAgIHNldFRpbWVvdXQodGljaywgaW50ZXJ2YWwpO1xuICAgICAgfVxuICAgIH07XG4gICAgdGljaygpO1xuICB9XG4gIGVsZW0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7IC8vZmFsbGJhY2sgSUU4XG59O1xuXG52YXIgZmFkZU91dCA9IGZ1bmN0aW9uKGVsZW0sIGludGVydmFsKSB7XG4gIGludGVydmFsID0gaW50ZXJ2YWwgfHwgMTY7XG4gIGVsZW0uc3R5bGUub3BhY2l0eSA9IDE7XG4gIHZhciBsYXN0ID0gK25ldyBEYXRlKCk7XG4gIHZhciB0aWNrID0gZnVuY3Rpb24oKSB7XG4gICAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gK2VsZW0uc3R5bGUub3BhY2l0eSAtIChuZXcgRGF0ZSgpIC0gbGFzdCkgLyAxMDA7XG4gICAgbGFzdCA9ICtuZXcgRGF0ZSgpO1xuXG4gICAgaWYgKCtlbGVtLnN0eWxlLm9wYWNpdHkgPiAwKSB7XG4gICAgICBzZXRUaW1lb3V0KHRpY2ssIGludGVydmFsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH1cbiAgfTtcbiAgdGljaygpO1xufTtcblxudmFyIGZpcmVDbGljayA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgLy8gVGFrZW4gZnJvbSBodHRwOi8vd3d3Lm5vbm9idHJ1c2l2ZS5jb20vMjAxMS8xMS8yOS9wcm9ncmFtYXRpY2FsbHktZmlyZS1jcm9zc2Jyb3dzZXItY2xpY2stZXZlbnQtd2l0aC1qYXZhc2NyaXB0L1xuICAvLyBUaGVuIGZpeGVkIGZvciB0b2RheSdzIENocm9tZSBicm93c2VyLlxuICBpZiAodHlwZW9mIE1vdXNlRXZlbnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAvLyBVcC10by1kYXRlIGFwcHJvYWNoXG4gICAgdmFyIG1ldnQgPSBuZXcgTW91c2VFdmVudCgnY2xpY2snLCB7XG4gICAgICB2aWV3OiB3aW5kb3csXG4gICAgICBidWJibGVzOiBmYWxzZSxcbiAgICAgIGNhbmNlbGFibGU6IHRydWVcbiAgICB9KTtcbiAgICBub2RlLmRpc3BhdGNoRXZlbnQobWV2dCk7XG4gIH0gZWxzZSBpZiAoIGRvY3VtZW50LmNyZWF0ZUV2ZW50ICkge1xuICAgIC8vIEZhbGxiYWNrXG4gICAgdmFyIGV2dCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdNb3VzZUV2ZW50cycpO1xuICAgIGV2dC5pbml0RXZlbnQoJ2NsaWNrJywgZmFsc2UsIGZhbHNlKTtcbiAgICBub2RlLmRpc3BhdGNoRXZlbnQoZXZ0KTtcbiAgfSBlbHNlIGlmIChkb2N1bWVudC5jcmVhdGVFdmVudE9iamVjdCkge1xuICAgIG5vZGUuZmlyZUV2ZW50KCdvbmNsaWNrJykgO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBub2RlLm9uY2xpY2sgPT09ICdmdW5jdGlvbicgKSB7XG4gICAgbm9kZS5vbmNsaWNrKCk7XG4gIH1cbn07XG5cbnZhciBzdG9wRXZlbnRQcm9wYWdhdGlvbiA9IGZ1bmN0aW9uKGUpIHtcbiAgLy8gSW4gcGFydGljdWxhciwgbWFrZSBzdXJlIHRoZSBzcGFjZSBiYXIgZG9lc24ndCBzY3JvbGwgdGhlIG1haW4gd2luZG93LlxuICBpZiAodHlwZW9mIGUuc3RvcFByb3BhZ2F0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIH0gZWxzZSBpZiAod2luZG93LmV2ZW50ICYmIHdpbmRvdy5ldmVudC5oYXNPd25Qcm9wZXJ0eSgnY2FuY2VsQnViYmxlJykpIHtcbiAgICB3aW5kb3cuZXZlbnQuY2FuY2VsQnViYmxlID0gdHJ1ZTtcbiAgfVxufTtcblxuZXhwb3J0IHsgXG4gIGhhc0NsYXNzLCBhZGRDbGFzcywgcmVtb3ZlQ2xhc3MsIFxuICBlc2NhcGVIdG1sLCBcbiAgX3Nob3csIHNob3csIF9oaWRlLCBoaWRlLCBcbiAgaXNEZXNjZW5kYW50LCBcbiAgZ2V0VG9wTWFyZ2luLFxuICBmYWRlSW4sIGZhZGVPdXQsXG4gIGZpcmVDbGljayxcbiAgc3RvcEV2ZW50UHJvcGFnYXRpb25cbn07XG4iLCJpbXBvcnQgeyBzdG9wRXZlbnRQcm9wYWdhdGlvbiwgZmlyZUNsaWNrIH0gZnJvbSAnLi9oYW5kbGUtZG9tJztcbmltcG9ydCB7IHNldEZvY3VzU3R5bGUgfSBmcm9tICcuL2hhbmRsZS1zd2FsLWRvbSc7XG5cbnZhciB2a190YWIgPSA5O1xudmFyIHZrX2VzYyA9IDI3O1xudmFyIHZrX2VudGVyID0gMTM7XG52YXIgdmtfc3BhY2UgPSAzMjtcbnZhciBrZXlfY29kZXMgPSBbdmtfdGFiLCB2a19lc2MsIHZrX2VudGVyLCB2a19zcGFjZV07XG5cbnZhciBoYW5kbGVLZXlEb3duID0gZnVuY3Rpb24oZXZlbnQsIHBhcmFtcywgbW9kYWwpIHtcbiAgdmFyIGUgPSBldmVudCB8fCB3aW5kb3cuZXZlbnQ7XG4gIHZhciBrZXlDb2RlID0gZS5rZXlDb2RlIHx8IGUud2hpY2g7XG5cbiAgaWYgKGtleV9jb2Rlcy5pbmRleE9mKGtleUNvZGUpIDwgMCkge1xuICAgIC8vIERvbid0IGRvIHdvcmsgb24ga2V5cyB3ZSBkb24ndCBjYXJlIGFib3V0LlxuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChwYXJhbXMuZGlzYWJsZUtleXMgPT09IHRydWUpIHtcbiAgICBzdG9wRXZlbnRQcm9wYWdhdGlvbihlKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgJG9rQnV0dG9uICAgICA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5jb25maXJtJyk7XG4gIHZhciAkY2FuY2VsQnV0dG9uID0gbW9kYWwucXVlcnlTZWxlY3RvcignYnV0dG9uLmNhbmNlbCcpO1xuICB2YXIgJG1vZGFsQnV0dG9ucyA9IG1vZGFsLnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvblt0YWJpbmRleF0nKTtcblxuICB2YXIgJHRhcmdldEVsZW1lbnQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XG5cbiAgdmFyIGJ0bkluZGV4ID0gLTE7IC8vIEZpbmQgdGhlIGJ1dHRvbiAtIG5vdGUsIHRoaXMgaXMgYSBub2RlbGlzdCwgbm90IGFuIGFycmF5LlxuICBmb3IgKHZhciBpID0gMDsgaSA8ICRtb2RhbEJ1dHRvbnMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoJHRhcmdldEVsZW1lbnQgPT09ICRtb2RhbEJ1dHRvbnNbaV0pIHtcbiAgICAgIGJ0bkluZGV4ID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGlmIChrZXlDb2RlID09PSB2a190YWIpIHtcbiAgICBpZiAoYnRuSW5kZXggPT09IC0xKSB7XG4gICAgICAvLyBObyBidXR0b24gZm9jdXNlZC4gSnVtcCB0byB0aGUgY29uZmlybSBidXR0b24uXG4gICAgICAkdGFyZ2V0RWxlbWVudCA9ICRva0J1dHRvbjtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQ3ljbGUgdG8gdGhlIG5leHQgYnV0dG9uXG4gICAgICBpZiAoYnRuSW5kZXggPT09ICRtb2RhbEJ1dHRvbnMubGVuZ3RoIC0gMSkge1xuICAgICAgICAkdGFyZ2V0RWxlbWVudCA9ICRtb2RhbEJ1dHRvbnNbMF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkdGFyZ2V0RWxlbWVudCA9ICRtb2RhbEJ1dHRvbnNbYnRuSW5kZXggKyAxXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdG9wRXZlbnRQcm9wYWdhdGlvbihlKTtcbiAgICAkdGFyZ2V0RWxlbWVudC5mb2N1cygpO1xuXG4gICAgaWYgKHBhcmFtcy5jb25maXJtQnV0dG9uQ29sb3IpIHtcbiAgICAgIHNldEZvY3VzU3R5bGUoJHRhcmdldEVsZW1lbnQsIHBhcmFtcy5jb25maXJtQnV0dG9uQ29sb3IpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoa2V5Q29kZSA9PT0gdmtfZW50ZXIgJiYgcGFyYW1zLmFsbG93UmV0dXJuS2V5ID09PSB0cnVlKSB7XG4gICAgICBpZiAoJHRhcmdldEVsZW1lbnQudGFnTmFtZSA9PT0gJ0lOUFVUJykge1xuICAgICAgICAkdGFyZ2V0RWxlbWVudCA9ICRva0J1dHRvbjtcbiAgICAgICAgJG9rQnV0dG9uLmZvY3VzKCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChidG5JbmRleCA9PT0gLTEpIHtcbiAgICAgICAgLy8gRU5URVIvU1BBQ0UgY2xpY2tlZCBvdXRzaWRlIG9mIGEgYnV0dG9uLlxuICAgICAgICAkdGFyZ2V0RWxlbWVudCA9ICRva0J1dHRvbjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIERvIG5vdGhpbmcgLSBsZXQgdGhlIGJyb3dzZXIgaGFuZGxlIGl0LlxuICAgICAgICAkdGFyZ2V0RWxlbWVudCA9IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGtleUNvZGUgPT09IHZrX2VzYyAmJiBwYXJhbXMuYWxsb3dFc2NhcGVLZXkgPT09IHRydWUpIHtcbiAgICAgICR0YXJnZXRFbGVtZW50ID0gJGNhbmNlbEJ1dHRvbjtcbiAgICAgIGZpcmVDbGljaygkdGFyZ2V0RWxlbWVudCwgZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEZhbGxiYWNrIC0gbGV0IHRoZSBicm93c2VyIGhhbmRsZSBpdC5cbiAgICAgICR0YXJnZXRFbGVtZW50ID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgaGFuZGxlS2V5RG93bjtcbiIsImltcG9ydCB7IGhleFRvUmdiIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgeyByZW1vdmVDbGFzcywgZ2V0VG9wTWFyZ2luLCBmYWRlSW4sIHNob3csIGFkZENsYXNzIH0gZnJvbSAnLi9oYW5kbGUtZG9tJztcbmltcG9ydCBkZWZhdWx0UGFyYW1zIGZyb20gJy4vZGVmYXVsdC1wYXJhbXMnO1xuXG52YXIgbW9kYWxDbGFzcyAgID0gJy5zd2VldC1hbGVydCc7XG52YXIgb3ZlcmxheUNsYXNzID0gJy5zd2VldC1vdmVybGF5JztcblxuLypcbiAqIEFkZCBtb2RhbCArIG92ZXJsYXkgdG8gRE9NXG4gKi9cbmltcG9ydCBpbmplY3RlZEhUTUwgZnJvbSAnLi9pbmplY3RlZC1odG1sJztcblxudmFyIHN3ZWV0QWxlcnRJbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzd2VldFdyYXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgc3dlZXRXcmFwLmlubmVySFRNTCA9IGluamVjdGVkSFRNTDtcblxuICAvLyBBcHBlbmQgZWxlbWVudHMgdG8gYm9keVxuICB3aGlsZSAoc3dlZXRXcmFwLmZpcnN0Q2hpbGQpIHtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHN3ZWV0V3JhcC5maXJzdENoaWxkKTtcbiAgfVxufTtcblxuLypcbiAqIEdldCBET00gZWxlbWVudCBvZiBtb2RhbFxuICovXG52YXIgZ2V0TW9kYWwgPSBmdW5jdGlvbigpIHtcbiAgdmFyICRtb2RhbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IobW9kYWxDbGFzcyk7XG5cbiAgaWYgKCEkbW9kYWwpIHtcbiAgICBzd2VldEFsZXJ0SW5pdGlhbGl6ZSgpO1xuICAgICRtb2RhbCA9IGdldE1vZGFsKCk7XG4gIH1cblxuICByZXR1cm4gJG1vZGFsO1xufTtcblxuLypcbiAqIEdldCBET00gZWxlbWVudCBvZiBpbnB1dCAoaW4gbW9kYWwpXG4gKi9cbnZhciBnZXRJbnB1dCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgJG1vZGFsID0gZ2V0TW9kYWwoKTtcbiAgaWYgKCRtb2RhbCkge1xuICAgIHJldHVybiAkbW9kYWwucXVlcnlTZWxlY3RvcignaW5wdXQnKTtcbiAgfVxufTtcblxuLypcbiAqIEdldCBET00gZWxlbWVudCBvZiBvdmVybGF5XG4gKi9cbnZhciBnZXRPdmVybGF5ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKG92ZXJsYXlDbGFzcyk7XG59O1xuXG4vKlxuICogQWRkIGJveC1zaGFkb3cgc3R5bGUgdG8gYnV0dG9uIChkZXBlbmRpbmcgb24gaXRzIGNob3NlbiBiZy1jb2xvcilcbiAqL1xudmFyIHNldEZvY3VzU3R5bGUgPSBmdW5jdGlvbigkYnV0dG9uLCBiZ0NvbG9yKSB7XG4gIHZhciByZ2JDb2xvciA9IGhleFRvUmdiKGJnQ29sb3IpO1xuICAkYnV0dG9uLnN0eWxlLmJveFNoYWRvdyA9ICcwIDAgMnB4IHJnYmEoJyArIHJnYkNvbG9yICsgJywgMC44KSwgaW5zZXQgMCAwIDAgMXB4IHJnYmEoMCwgMCwgMCwgMC4wNSknO1xufTtcblxuLypcbiAqIEFuaW1hdGlvbiB3aGVuIG9wZW5pbmcgbW9kYWxcbiAqL1xudmFyIG9wZW5Nb2RhbCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gIHZhciAkbW9kYWwgPSBnZXRNb2RhbCgpO1xuICBmYWRlSW4oZ2V0T3ZlcmxheSgpLCAxMCk7XG4gIHNob3coJG1vZGFsKTtcbiAgYWRkQ2xhc3MoJG1vZGFsLCAnc2hvd1N3ZWV0QWxlcnQnKTtcbiAgcmVtb3ZlQ2xhc3MoJG1vZGFsLCAnaGlkZVN3ZWV0QWxlcnQnKTtcblxuICB3aW5kb3cucHJldmlvdXNBY3RpdmVFbGVtZW50ID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcbiAgdmFyICRva0J1dHRvbiA9ICRtb2RhbC5xdWVyeVNlbGVjdG9yKCdidXR0b24uY29uZmlybScpO1xuICAkb2tCdXR0b24uZm9jdXMoKTtcblxuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICBhZGRDbGFzcygkbW9kYWwsICd2aXNpYmxlJyk7XG4gIH0sIDUwMCk7XG5cbiAgdmFyIHRpbWVyID0gJG1vZGFsLmdldEF0dHJpYnV0ZSgnZGF0YS10aW1lcicpO1xuXG4gIGlmICh0aW1lciAhPT0gJ251bGwnICYmIHRpbWVyICE9PSAnJykge1xuICAgIHZhciB0aW1lckNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgJG1vZGFsLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGRvbmVGdW5jdGlvbkV4aXN0cyA9ICgodGltZXJDYWxsYmFjayB8fCBudWxsKSAmJiAkbW9kYWwuZ2V0QXR0cmlidXRlKCdkYXRhLWhhcy1kb25lLWZ1bmN0aW9uJykgPT09ICd0cnVlJyk7XG4gICAgICBpZiAoZG9uZUZ1bmN0aW9uRXhpc3RzKSB7IFxuICAgICAgICB0aW1lckNhbGxiYWNrKG51bGwpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHN3ZWV0QWxlcnQuY2xvc2UoKTtcbiAgICAgIH1cbiAgICB9LCB0aW1lcik7XG4gIH1cbn07XG5cbi8qXG4gKiBSZXNldCB0aGUgc3R5bGluZyBvZiB0aGUgaW5wdXRcbiAqIChmb3IgZXhhbXBsZSBpZiBlcnJvcnMgaGF2ZSBiZWVuIHNob3duKVxuICovXG52YXIgcmVzZXRJbnB1dCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgJG1vZGFsID0gZ2V0TW9kYWwoKTtcbiAgdmFyICRpbnB1dCA9IGdldElucHV0KCk7XG5cbiAgcmVtb3ZlQ2xhc3MoJG1vZGFsLCAnc2hvdy1pbnB1dCcpO1xuICAkaW5wdXQudmFsdWUgPSBkZWZhdWx0UGFyYW1zLmlucHV0VmFsdWU7XG4gICRpbnB1dC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCBkZWZhdWx0UGFyYW1zLmlucHV0VHlwZSk7XG4gICRpbnB1dC5zZXRBdHRyaWJ1dGUoJ3BsYWNlaG9sZGVyJywgZGVmYXVsdFBhcmFtcy5pbnB1dFBsYWNlaG9sZGVyKTtcblxuICByZXNldElucHV0RXJyb3IoKTtcbn07XG5cblxudmFyIHJlc2V0SW5wdXRFcnJvciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gIC8vIElmIHByZXNzIGVudGVyID0+IGlnbm9yZVxuICBpZiAoZXZlbnQgJiYgZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgJG1vZGFsID0gZ2V0TW9kYWwoKTtcblxuICB2YXIgJGVycm9ySWNvbiA9ICRtb2RhbC5xdWVyeVNlbGVjdG9yKCcuc2EtaW5wdXQtZXJyb3InKTtcbiAgcmVtb3ZlQ2xhc3MoJGVycm9ySWNvbiwgJ3Nob3cnKTtcblxuICB2YXIgJGVycm9yQ29udGFpbmVyID0gJG1vZGFsLnF1ZXJ5U2VsZWN0b3IoJy5zYS1lcnJvci1jb250YWluZXInKTtcbiAgcmVtb3ZlQ2xhc3MoJGVycm9yQ29udGFpbmVyLCAnc2hvdycpO1xufTtcblxuXG4vKlxuICogU2V0IFwibWFyZ2luLXRvcFwiLXByb3BlcnR5IG9uIG1vZGFsIGJhc2VkIG9uIGl0cyBjb21wdXRlZCBoZWlnaHRcbiAqL1xudmFyIGZpeFZlcnRpY2FsUG9zaXRpb24gPSBmdW5jdGlvbigpIHtcbiAgdmFyICRtb2RhbCA9IGdldE1vZGFsKCk7XG4gICRtb2RhbC5zdHlsZS5tYXJnaW5Ub3AgPSBnZXRUb3BNYXJnaW4oZ2V0TW9kYWwoKSk7XG59O1xuXG5cbmV4cG9ydCB7IFxuICBzd2VldEFsZXJ0SW5pdGlhbGl6ZSxcbiAgZ2V0TW9kYWwsXG4gIGdldE92ZXJsYXksXG4gIGdldElucHV0LFxuICBzZXRGb2N1c1N0eWxlLFxuICBvcGVuTW9kYWwsXG4gIHJlc2V0SW5wdXQsXG4gIHJlc2V0SW5wdXRFcnJvcixcbiAgZml4VmVydGljYWxQb3NpdGlvblxufTtcbiIsInZhciBpbmplY3RlZEhUTUwgPSBcblxuICAvLyBEYXJrIG92ZXJsYXlcbiAgYDxkaXYgY2xhc3M9XCJzd2VldC1vdmVybGF5XCIgdGFiSW5kZXg9XCItMVwiPjwvZGl2PmAgK1xuXG4gIC8vIE1vZGFsXG4gIGA8ZGl2IGNsYXNzPVwic3dlZXQtYWxlcnRcIj5gICtcblxuICAgIC8vIEVycm9yIGljb25cbiAgICBgPGRpdiBjbGFzcz1cInNhLWljb24gc2EtZXJyb3JcIj5cbiAgICAgIDxzcGFuIGNsYXNzPVwic2EteC1tYXJrXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwic2EtbGluZSBzYS1sZWZ0XCI+PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz1cInNhLWxpbmUgc2EtcmlnaHRcIj48L3NwYW4+XG4gICAgICA8L3NwYW4+XG4gICAgPC9kaXY+YCArXG5cbiAgICAvLyBXYXJuaW5nIGljb25cbiAgICBgPGRpdiBjbGFzcz1cInNhLWljb24gc2Etd2FybmluZ1wiPlxuICAgICAgPHNwYW4gY2xhc3M9XCJzYS1ib2R5XCI+PC9zcGFuPlxuICAgICAgPHNwYW4gY2xhc3M9XCJzYS1kb3RcIj48L3NwYW4+XG4gICAgPC9kaXY+YCArXG5cbiAgICAvLyBJbmZvIGljb25cbiAgICBgPGRpdiBjbGFzcz1cInNhLWljb24gc2EtaW5mb1wiPjwvZGl2PmAgK1xuXG4gICAgLy8gU3VjY2VzcyBpY29uXG4gICAgYDxkaXYgY2xhc3M9XCJzYS1pY29uIHNhLXN1Y2Nlc3NcIj5cbiAgICAgIDxzcGFuIGNsYXNzPVwic2EtbGluZSBzYS10aXBcIj48L3NwYW4+XG4gICAgICA8c3BhbiBjbGFzcz1cInNhLWxpbmUgc2EtbG9uZ1wiPjwvc3Bhbj5cblxuICAgICAgPGRpdiBjbGFzcz1cInNhLXBsYWNlaG9sZGVyXCI+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwic2EtZml4XCI+PC9kaXY+XG4gICAgPC9kaXY+YCArXG5cbiAgICBgPGRpdiBjbGFzcz1cInNhLWljb24gc2EtY3VzdG9tXCI+PC9kaXY+YCArXG5cbiAgICAvLyBUaXRsZSwgdGV4dCBhbmQgaW5wdXRcbiAgICBgPGgyPlRpdGxlPC9oMj5cbiAgICA8cD5UZXh0PC9wPlxuICAgIDxmaWVsZHNldD5cbiAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIHRhYkluZGV4PVwiM1wiIC8+XG4gICAgICA8ZGl2IGNsYXNzPVwic2EtaW5wdXQtZXJyb3JcIj48L2Rpdj5cbiAgICA8L2ZpZWxkc2V0PmAgK1xuXG4gICAgLy8gSW5wdXQgZXJyb3JzXG4gICAgYDxkaXYgY2xhc3M9XCJzYS1lcnJvci1jb250YWluZXJcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJpY29uXCI+ITwvZGl2PlxuICAgICAgPHA+Tm90IHZhbGlkITwvcD5cbiAgICA8L2Rpdj5gICtcblxuICAgIC8vIENhbmNlbCBhbmQgY29uZmlybSBidXR0b25zXG4gICAgYDxkaXYgY2xhc3M9XCJzYS1idXR0b24tY29udGFpbmVyXCI+XG4gICAgICA8YnV0dG9uIGNsYXNzPVwiY2FuY2VsXCIgdGFiSW5kZXg9XCIyXCI+Q2FuY2VsPC9idXR0b24+XG4gICAgICA8ZGl2IGNsYXNzPVwic2EtY29uZmlybS1idXR0b24tY29udGFpbmVyXCI+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJjb25maXJtXCIgdGFiSW5kZXg9XCIxXCI+T0s8L2J1dHRvbj5gICsgXG5cbiAgICAgICAgLy8gTG9hZGluZyBhbmltYXRpb25cbiAgICAgICAgYDxkaXYgY2xhc3M9XCJsYS1iYWxsLWZhbGxcIj5cbiAgICAgICAgICA8ZGl2PjwvZGl2PlxuICAgICAgICAgIDxkaXY+PC9kaXY+XG4gICAgICAgICAgPGRpdj48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5gICtcblxuICAvLyBFbmQgb2YgbW9kYWxcbiAgYDwvZGl2PmA7XG5cbmV4cG9ydCBkZWZhdWx0IGluamVjdGVkSFRNTDtcbiIsInZhciBhbGVydFR5cGVzID0gWydlcnJvcicsICd3YXJuaW5nJywgJ2luZm8nLCAnc3VjY2VzcycsICdpbnB1dCcsICdwcm9tcHQnXTtcblxuaW1wb3J0IHtcbiAgaXNJRThcbn0gZnJvbSAnLi91dGlscyc7XG5cbmltcG9ydCB7XG4gIGdldE1vZGFsLFxuICBnZXRJbnB1dCxcbiAgc2V0Rm9jdXNTdHlsZVxufSBmcm9tICcuL2hhbmRsZS1zd2FsLWRvbSc7XG5cbmltcG9ydCB7XG4gIGhhc0NsYXNzLCBhZGRDbGFzcywgcmVtb3ZlQ2xhc3MsXG4gIGVzY2FwZUh0bWwsXG4gIF9zaG93LCBzaG93LCBfaGlkZSwgaGlkZVxufSBmcm9tICcuL2hhbmRsZS1kb20nO1xuXG5cbi8qXG4gKiBTZXQgdHlwZSwgdGV4dCBhbmQgYWN0aW9ucyBvbiBtb2RhbFxuICovXG52YXIgc2V0UGFyYW1ldGVycyA9IGZ1bmN0aW9uKHBhcmFtcykge1xuICB2YXIgbW9kYWwgPSBnZXRNb2RhbCgpO1xuXG4gIHZhciAkdGl0bGUgPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCdoMicpO1xuICB2YXIgJHRleHQgPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCdwJyk7XG4gIHZhciAkY2FuY2VsQnRuID0gbW9kYWwucXVlcnlTZWxlY3RvcignYnV0dG9uLmNhbmNlbCcpO1xuICB2YXIgJGNvbmZpcm1CdG4gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCdidXR0b24uY29uZmlybScpO1xuXG4gIC8qXG4gICAqIFRpdGxlXG4gICAqL1xuICAkdGl0bGUuaW5uZXJIVE1MID0gcGFyYW1zLmh0bWwgPyBwYXJhbXMudGl0bGUgOiBlc2NhcGVIdG1sKHBhcmFtcy50aXRsZSkuc3BsaXQoJ1xcbicpLmpvaW4oJzxicj4nKTtcblxuICAvKlxuICAgKiBUZXh0XG4gICAqL1xuICAkdGV4dC5pbm5lckhUTUwgPSBwYXJhbXMuaHRtbCA/IHBhcmFtcy50ZXh0IDogZXNjYXBlSHRtbChwYXJhbXMudGV4dCB8fCAnJykuc3BsaXQoJ1xcbicpLmpvaW4oJzxicj4nKTtcbiAgaWYgKHBhcmFtcy50ZXh0KSBzaG93KCR0ZXh0KTtcblxuICAvKlxuICAgKiBDdXN0b20gY2xhc3NcbiAgICovXG4gIGlmIChwYXJhbXMuY3VzdG9tQ2xhc3MpIHtcbiAgICBhZGRDbGFzcyhtb2RhbCwgcGFyYW1zLmN1c3RvbUNsYXNzKTtcbiAgICBtb2RhbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtY3VzdG9tLWNsYXNzJywgcGFyYW1zLmN1c3RvbUNsYXNzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBGaW5kIHByZXZpb3VzbHkgc2V0IGNsYXNzZXMgYW5kIHJlbW92ZSB0aGVtXG4gICAgbGV0IGN1c3RvbUNsYXNzID0gbW9kYWwuZ2V0QXR0cmlidXRlKCdkYXRhLWN1c3RvbS1jbGFzcycpO1xuICAgIHJlbW92ZUNsYXNzKG1vZGFsLCBjdXN0b21DbGFzcyk7XG4gICAgbW9kYWwuc2V0QXR0cmlidXRlKCdkYXRhLWN1c3RvbS1jbGFzcycsICcnKTtcbiAgfVxuXG4gIC8qXG4gICAqIEljb25cbiAgICovXG4gIGhpZGUobW9kYWwucXVlcnlTZWxlY3RvckFsbCgnLnNhLWljb24nKSk7XG5cbiAgaWYgKHBhcmFtcy50eXBlICYmICFpc0lFOCgpKSB7XG5cbiAgICBsZXQgdmFsaWRUeXBlID0gZmFsc2U7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFsZXJ0VHlwZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChwYXJhbXMudHlwZSA9PT0gYWxlcnRUeXBlc1tpXSkge1xuICAgICAgICB2YWxpZFR5cGUgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXZhbGlkVHlwZSkge1xuICAgICAgbG9nU3RyKCdVbmtub3duIGFsZXJ0IHR5cGU6ICcgKyBwYXJhbXMudHlwZSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgbGV0IHR5cGVzV2l0aEljb25zID0gWydzdWNjZXNzJywgJ2Vycm9yJywgJ3dhcm5pbmcnLCAnaW5mbyddO1xuICAgIGxldCAkaWNvbjtcblxuICAgIGlmICh0eXBlc1dpdGhJY29ucy5pbmRleE9mKHBhcmFtcy50eXBlKSAhPT0gLTEpIHtcbiAgICAgICRpY29uID0gbW9kYWwucXVlcnlTZWxlY3RvcignLnNhLWljb24uJyArICdzYS0nICsgcGFyYW1zLnR5cGUpO1xuICAgICAgc2hvdygkaWNvbik7XG4gICAgfVxuXG4gICAgbGV0ICRpbnB1dCA9IGdldElucHV0KCk7XG5cbiAgICAvLyBBbmltYXRlIGljb25cbiAgICBzd2l0Y2ggKHBhcmFtcy50eXBlKSB7XG5cbiAgICAgIGNhc2UgJ3N1Y2Nlc3MnOlxuICAgICAgICBhZGRDbGFzcygkaWNvbiwgJ2FuaW1hdGUnKTtcbiAgICAgICAgYWRkQ2xhc3MoJGljb24ucXVlcnlTZWxlY3RvcignLnNhLXRpcCcpLCAnYW5pbWF0ZVN1Y2Nlc3NUaXAnKTtcbiAgICAgICAgYWRkQ2xhc3MoJGljb24ucXVlcnlTZWxlY3RvcignLnNhLWxvbmcnKSwgJ2FuaW1hdGVTdWNjZXNzTG9uZycpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnZXJyb3InOlxuICAgICAgICBhZGRDbGFzcygkaWNvbiwgJ2FuaW1hdGVFcnJvckljb24nKTtcbiAgICAgICAgYWRkQ2xhc3MoJGljb24ucXVlcnlTZWxlY3RvcignLnNhLXgtbWFyaycpLCAnYW5pbWF0ZVhNYXJrJyk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICd3YXJuaW5nJzpcbiAgICAgICAgYWRkQ2xhc3MoJGljb24sICdwdWxzZVdhcm5pbmcnKTtcbiAgICAgICAgYWRkQ2xhc3MoJGljb24ucXVlcnlTZWxlY3RvcignLnNhLWJvZHknKSwgJ3B1bHNlV2FybmluZ0lucycpO1xuICAgICAgICBhZGRDbGFzcygkaWNvbi5xdWVyeVNlbGVjdG9yKCcuc2EtZG90JyksICdwdWxzZVdhcm5pbmdJbnMnKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2lucHV0JzpcbiAgICAgIGNhc2UgJ3Byb21wdCc6XG4gICAgICAgICRpbnB1dC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCBwYXJhbXMuaW5wdXRUeXBlKTtcbiAgICAgICAgJGlucHV0LnZhbHVlID0gcGFyYW1zLmlucHV0VmFsdWU7XG4gICAgICAgICRpbnB1dC5zZXRBdHRyaWJ1dGUoJ3BsYWNlaG9sZGVyJywgcGFyYW1zLmlucHV0UGxhY2Vob2xkZXIpO1xuICAgICAgICBhZGRDbGFzcyhtb2RhbCwgJ3Nob3ctaW5wdXQnKTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgJGlucHV0LmZvY3VzKCk7XG4gICAgICAgICAgJGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgc3dhbC5yZXNldElucHV0RXJyb3IpO1xuICAgICAgICB9LCA0MDApO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvKlxuICAgKiBDdXN0b20gaW1hZ2VcbiAgICovXG4gIGlmIChwYXJhbXMuaW1hZ2VVcmwpIHtcbiAgICBsZXQgJGN1c3RvbUljb24gPSBtb2RhbC5xdWVyeVNlbGVjdG9yKCcuc2EtaWNvbi5zYS1jdXN0b20nKTtcblxuICAgICRjdXN0b21JY29uLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9ICd1cmwoJyArIHBhcmFtcy5pbWFnZVVybCArICcpJztcbiAgICBzaG93KCRjdXN0b21JY29uKTtcblxuICAgIGxldCBfaW1nV2lkdGggPSA4MDtcbiAgICBsZXQgX2ltZ0hlaWdodCA9IDgwO1xuXG4gICAgaWYgKHBhcmFtcy5pbWFnZVNpemUpIHtcbiAgICAgIGxldCBkaW1lbnNpb25zID0gcGFyYW1zLmltYWdlU2l6ZS50b1N0cmluZygpLnNwbGl0KCd4Jyk7XG4gICAgICBsZXQgaW1nV2lkdGggPSBkaW1lbnNpb25zWzBdO1xuICAgICAgbGV0IGltZ0hlaWdodCA9IGRpbWVuc2lvbnNbMV07XG5cbiAgICAgIGlmICghaW1nV2lkdGggfHwgIWltZ0hlaWdodCkge1xuICAgICAgICBsb2dTdHIoJ1BhcmFtZXRlciBpbWFnZVNpemUgZXhwZWN0cyB2YWx1ZSB3aXRoIGZvcm1hdCBXSURUSHhIRUlHSFQsIGdvdCAnICsgcGFyYW1zLmltYWdlU2l6ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfaW1nV2lkdGggPSBpbWdXaWR0aDtcbiAgICAgICAgX2ltZ0hlaWdodCA9IGltZ0hlaWdodDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAkY3VzdG9tSWNvbi5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJGN1c3RvbUljb24uZ2V0QXR0cmlidXRlKCdzdHlsZScpICsgJ3dpZHRoOicgKyBfaW1nV2lkdGggKyAncHg7IGhlaWdodDonICsgX2ltZ0hlaWdodCArICdweCcpO1xuICB9XG5cbiAgLypcbiAgICogU2hvdyBjYW5jZWwgYnV0dG9uP1xuICAgKi9cbiAgbW9kYWwuc2V0QXR0cmlidXRlKCdkYXRhLWhhcy1jYW5jZWwtYnV0dG9uJywgcGFyYW1zLnNob3dDYW5jZWxCdXR0b24pO1xuICBpZiAocGFyYW1zLnNob3dDYW5jZWxCdXR0b24pIHtcbiAgICAkY2FuY2VsQnRuLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJztcbiAgfSBlbHNlIHtcbiAgICBoaWRlKCRjYW5jZWxCdG4pO1xuICB9XG5cbiAgLypcbiAgICogU2hvdyBjb25maXJtIGJ1dHRvbj9cbiAgICovXG4gIG1vZGFsLnNldEF0dHJpYnV0ZSgnZGF0YS1oYXMtY29uZmlybS1idXR0b24nLCBwYXJhbXMuc2hvd0NvbmZpcm1CdXR0b24pO1xuICBpZiAocGFyYW1zLnNob3dDb25maXJtQnV0dG9uKSB7XG4gICAgJGNvbmZpcm1CdG4uc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snO1xuICB9IGVsc2Uge1xuICAgIGhpZGUoJGNvbmZpcm1CdG4pO1xuICB9XG5cbiAgLypcbiAgICogQ3VzdG9tIHRleHQgb24gY2FuY2VsL2NvbmZpcm0gYnV0dG9uc1xuICAgKi9cbiAgaWYgKHBhcmFtcy5jYW5jZWxCdXR0b25UZXh0KSB7XG4gICAgJGNhbmNlbEJ0bi5pbm5lckhUTUwgPSBlc2NhcGVIdG1sKHBhcmFtcy5jYW5jZWxCdXR0b25UZXh0KTtcbiAgfVxuICBpZiAocGFyYW1zLmNvbmZpcm1CdXR0b25UZXh0KSB7XG4gICAgJGNvbmZpcm1CdG4uaW5uZXJIVE1MID0gZXNjYXBlSHRtbChwYXJhbXMuY29uZmlybUJ1dHRvblRleHQpO1xuICB9XG5cbiAgLypcbiAgICogQ3VzdG9tIGNvbG9yIG9uIGNvbmZpcm0gYnV0dG9uXG4gICAqL1xuICBpZiAocGFyYW1zLmNvbmZpcm1CdXR0b25Db2xvcikge1xuICAgIC8vIFNldCBjb25maXJtIGJ1dHRvbiB0byBzZWxlY3RlZCBiYWNrZ3JvdW5kIGNvbG9yXG4gICAgJGNvbmZpcm1CdG4uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gcGFyYW1zLmNvbmZpcm1CdXR0b25Db2xvcjtcblxuICAgIC8vIFNldCB0aGUgY29uZmlybSBidXR0b24gY29sb3IgdG8gdGhlIGxvYWRpbmcgcmluZ1xuICAgICRjb25maXJtQnRuLnN0eWxlLmJvcmRlckxlZnRDb2xvciA9IHBhcmFtcy5jb25maXJtTG9hZGluZ0J1dHRvbkNvbG9yO1xuICAgICRjb25maXJtQnRuLnN0eWxlLmJvcmRlclJpZ2h0Q29sb3IgPSBwYXJhbXMuY29uZmlybUxvYWRpbmdCdXR0b25Db2xvcjtcblxuICAgIC8vIFNldCBib3gtc2hhZG93IHRvIGRlZmF1bHQgZm9jdXNlZCBidXR0b25cbiAgICBzZXRGb2N1c1N0eWxlKCRjb25maXJtQnRuLCBwYXJhbXMuY29uZmlybUJ1dHRvbkNvbG9yKTtcbiAgfVxuXG4gIC8qXG4gICAqIEFsbG93IG91dHNpZGUgY2xpY2tcbiAgICovXG4gIG1vZGFsLnNldEF0dHJpYnV0ZSgnZGF0YS1hbGxvdy1vdXRzaWRlLWNsaWNrJywgcGFyYW1zLmFsbG93T3V0c2lkZUNsaWNrKTtcblxuICAvKlxuICAgKiBDYWxsYmFjayBmdW5jdGlvblxuICAgKi9cbiAgdmFyIGhhc0RvbmVGdW5jdGlvbiA9IHBhcmFtcy5kb25lRnVuY3Rpb24gPyB0cnVlIDogZmFsc2U7XG4gIG1vZGFsLnNldEF0dHJpYnV0ZSgnZGF0YS1oYXMtZG9uZS1mdW5jdGlvbicsIGhhc0RvbmVGdW5jdGlvbik7XG5cbiAgLypcbiAgICogQW5pbWF0aW9uXG4gICAqL1xuICBpZiAoIXBhcmFtcy5hbmltYXRpb24pIHtcbiAgICBtb2RhbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtYW5pbWF0aW9uJywgJ25vbmUnKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgcGFyYW1zLmFuaW1hdGlvbiA9PT0gJ3N0cmluZycpIHtcbiAgICBtb2RhbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtYW5pbWF0aW9uJywgcGFyYW1zLmFuaW1hdGlvbik7IC8vIEN1c3RvbSBhbmltYXRpb25cbiAgfSBlbHNlIHtcbiAgICBtb2RhbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtYW5pbWF0aW9uJywgJ3BvcCcpO1xuICB9XG5cbiAgLypcbiAgICogVGltZXJcbiAgICovXG4gIG1vZGFsLnNldEF0dHJpYnV0ZSgnZGF0YS10aW1lcicsIHBhcmFtcy50aW1lcik7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBzZXRQYXJhbWV0ZXJzO1xuIiwiLypcbiAqIEFsbG93IHVzZXIgdG8gcGFzcyB0aGVpciBvd24gcGFyYW1zXG4gKi9cbnZhciBleHRlbmQgPSBmdW5jdGlvbihhLCBiKSB7XG4gIGZvciAodmFyIGtleSBpbiBiKSB7XG4gICAgaWYgKGIuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgYVtrZXldID0gYltrZXldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYTtcbn07XG5cbi8qXG4gKiBDb252ZXJ0IEhFWCBjb2RlcyB0byBSR0IgdmFsdWVzICgjMDAwMDAwIC0+IHJnYigwLDAsMCkpXG4gKi9cbnZhciBoZXhUb1JnYiA9IGZ1bmN0aW9uKGhleCkge1xuICB2YXIgcmVzdWx0ID0gL14jPyhbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KSQvaS5leGVjKGhleCk7XG4gIHJldHVybiByZXN1bHQgPyBwYXJzZUludChyZXN1bHRbMV0sIDE2KSArICcsICcgKyBwYXJzZUludChyZXN1bHRbMl0sIDE2KSArICcsICcgKyBwYXJzZUludChyZXN1bHRbM10sIDE2KSA6IG51bGw7XG59O1xuXG4vKlxuICogQ2hlY2sgaWYgdGhlIHVzZXIgaXMgdXNpbmcgSW50ZXJuZXQgRXhwbG9yZXIgOCAoZm9yIGZhbGxiYWNrcylcbiAqL1xudmFyIGlzSUU4ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAod2luZG93LmF0dGFjaEV2ZW50ICYmICF3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcik7XG59O1xuXG4vKlxuICogSUUgY29tcGF0aWJsZSBsb2dnaW5nIGZvciBkZXZlbG9wZXJzXG4gKi9cbnZhciBsb2dTdHIgPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgaWYgKHdpbmRvdy5jb25zb2xlKSB7XG4gICAgLy8gSUUuLi5cbiAgICB3aW5kb3cuY29uc29sZS5sb2coJ1N3ZWV0QWxlcnQ6ICcgKyBzdHJpbmcpO1xuICB9XG59O1xuXG4vKlxuICogU2V0IGhvdmVyLCBhY3RpdmUgYW5kIGZvY3VzLXN0YXRlcyBmb3IgYnV0dG9ucyBcbiAqIChzb3VyY2U6IGh0dHA6Ly93d3cuc2l0ZXBvaW50LmNvbS9qYXZhc2NyaXB0LWdlbmVyYXRlLWxpZ2h0ZXItZGFya2VyLWNvbG9yKVxuICovXG52YXIgY29sb3JMdW1pbmFuY2UgPSBmdW5jdGlvbihoZXgsIGx1bSkge1xuICAvLyBWYWxpZGF0ZSBoZXggc3RyaW5nXG4gIGhleCA9IFN0cmluZyhoZXgpLnJlcGxhY2UoL1teMC05YS1mXS9naSwgJycpO1xuICBpZiAoaGV4Lmxlbmd0aCA8IDYpIHtcbiAgICBoZXggPSBoZXhbMF0gKyBoZXhbMF0gKyBoZXhbMV0gKyBoZXhbMV0gKyBoZXhbMl0gKyBoZXhbMl07XG4gIH1cbiAgbHVtID0gbHVtIHx8IDA7XG5cbiAgLy8gQ29udmVydCB0byBkZWNpbWFsIGFuZCBjaGFuZ2UgbHVtaW5vc2l0eVxuICB2YXIgcmdiID0gJyMnO1xuICB2YXIgYztcbiAgdmFyIGk7XG5cbiAgZm9yIChpID0gMDsgaSA8IDM7IGkrKykge1xuICAgIGMgPSBwYXJzZUludChoZXguc3Vic3RyKGkgKiAyLCAyKSwgMTYpO1xuICAgIGMgPSBNYXRoLnJvdW5kKE1hdGgubWluKE1hdGgubWF4KDAsIGMgKyBjICogbHVtKSwgMjU1KSkudG9TdHJpbmcoMTYpO1xuICAgIHJnYiArPSAoJzAwJyArIGMpLnN1YnN0cihjLmxlbmd0aCk7XG4gIH1cblxuICByZXR1cm4gcmdiO1xufTtcblxuXG5leHBvcnQge1xuICBleHRlbmQsXG4gIGhleFRvUmdiLFxuICBpc0lFOCxcbiAgbG9nU3RyLFxuICBjb2xvckx1bWluYW5jZVxufTtcbiJdfQ==

  
  /*
   * Use SweetAlert with RequireJS
   */
  
  if (typeof define === 'function' && define.amd) {
    define(function () {
      return sweetAlert;
    });
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = sweetAlert;
  }

})(window, document);