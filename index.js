'use strict';
/* global ion, window, navigator, Notification */

var EventEmitter = require('eventemitter3')
  , supported = 'Notification' in window;

/**
 * A generic notification interface. This eliminates cross browser issues and
 * allows us to create a polyfill for browser that do not have native
 * Notification API's available.
 *
 * The options object the same options that are allowed by the Notification API
 * but with a few exceptions and extensions:
 *
 * - silent: Notifications are silent by default, no sound or vibration.
 * - timeout: Specify how long the notification should be visible.
 *
 * @param {String} title Title
 * @param {Object} options Configuration.
 */
function Notify(title, options) {
  var notify = this;

  if (!(notify instanceof Notify)) return new Notify(title, options);

  //
  // Provide some sane defaults.
  //
  options = options || {};
  options.silent = 'silent' in options ? options.silent : true;

  notify.title = title;
  notify.notification = null;
  notify.options = options || {};

  //
  // Force async execution, so we have time to add our event listeners and track
  // the closing/removal of the notifications. By forcing async we remove the
  // non deterministic behavior for when permissions are not granted or
  // notifications are not supported at all.
  //
  setTimeout(function timeout() {
    notify.initialize();
  }, 0);
}

//
// Inherit from EventEmitter so we don't have to polyfill the Event API from the
// browser.
//
Notify.prototype = new EventEmitter();
Notify.prototype.constructor = Notify;
Notify.prototype.emits = require('emits');

/**
 * Notification initializations.
 *
 * @api private
 */
Notify.prototype.initialize = function initialize() {
  var notify = this;

  notify.on('timeout', function timeout() {
    try { notify.notification.close(); }
    catch (e) {}

    notify.emit('close');
  });

  notify.on('seen', function seen() {
    notify.emit('close');
    window.focus();
  });

  notify.on('error', function error(err) {
    try { notify.notification.close(); }
    catch (e) {}

    notify.emit('close', err);
  });

  //
  // Render as quickly as possible. If we don't have native browser support we
  // can just render anything else as fallback.
  //
  if (!supported || 'granted' === Notification.permission) return notify.render();
  if ('denied' === Notification.permission) return notify.emit('close');

  //
  // Request permission from the user to render the damn thing.
  //
  Notification.requestPermission(function request(permission) {
    if ('granted' === permission) notify.render();
    else notify.emit('close');
  });
};

/**
 * Completely destroy all the things.
 *
 * @api public
 */
Notify.prototype.destroy = function destroy() {
  if (this.notification) try {
    this.notification.close();
  } catch (e) {}

  this.removeAllListeners();
  this.notification = null;
  this.options = null;
  this.title = null;
};

//
// Generate methods for rendering the notification window while taking cross
// browser issues in mind.
//
if (supported) {
  Notify.prototype.render = function render() {
    if (!this.options) return; // We've been destroyed before we could render.

    var notification = new Notification(this.title, this.options)
      , notify = this
      , timer;

    notification.onclick = notify.emits('seen');
    notification.onerror = notify.emits('error');

    //
    // The Notify API does not have support for timeouts, we don't want the
    // notifications to be persistent when a timeout has been set.
    //
    if (notify.options.timeout) {
      timer = setTimeout(function timeout() {
        notify.emit('timeout');
      }, notify.options.timeout);

      notify.once('seen', function seen() {
        clearTimeout(timer);
      });
    }

    notify.notification = notification;
  };
} else {
  Notify.prototype.render = function render() {
    this.emit('close');
  };
}

//
// Expose the Notifications API
//
module.exports = Notify;
