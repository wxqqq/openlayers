/**
 * @module ol/format/filter/Not
 */
import {inherits} from '../../index.js';
import Filter from '../filter/Filter.js';

/**
 * @classdesc
 * Represents a logical `<Not>` operator for a filter condition.
 *
 * @constructor
 * @param {!ol.format.filter.Filter} condition Filter condition.
 * @extends {ol.format.filter.Filter}
 * @api
 */
var Not = function(condition) {

  Filter.call(this, 'Not');

  /**
   * @public
   * @type {!ol.format.filter.Filter}
   */
  this.condition = condition;
};

inherits(Not, Filter);
export default Not;
