/**
 * @module ol/Disposable
 */
import {nullFunction} from './index.js';

/**
 * Objects that need to clean up after themselves.
 * @constructor
 */
var Disposable = function() {};

/**
 * The object has already been disposed.
 * @type {boolean}
 * @private
 */
Disposable.prototype.disposed_ = false;

/**
 * Clean up.
 */
Disposable.prototype.dispose = function() {
  if (!this.disposed_) {
    this.disposed_ = true;
    this.disposeInternal();
  }
};

/**
 * Extension point for disposable objects.
 * @protected
 */
Disposable.prototype.disposeInternal = nullFunction;
export default Disposable;
