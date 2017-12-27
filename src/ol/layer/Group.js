/**
 * @module ol/layer/Group
 */
import {getUid, inherits} from '../index.js';
import _ol_Collection_ from '../Collection.js';
import CollectionEventType from '../CollectionEventType.js';
import _ol_Object_ from '../Object.js';
import ObjectEventType from '../ObjectEventType.js';
import {assert} from '../asserts.js';
import _ol_events_ from '../events.js';
import EventType from '../events/EventType.js';
import {getIntersection} from '../extent.js';
import _ol_layer_Base_ from '../layer/Base.js';
import _ol_obj_ from '../obj.js';
import SourceState from '../source/State.js';


/**
 * @enum {string}
 * @private
 */
var Property = {
  LAYERS: 'layers'
};


/**
 * @classdesc
 * A {@link ol.Collection} of layers that are handled together.
 *
 * A generic `change` event is triggered when the group/Collection changes.
 *
 * @constructor
 * @extends {ol.layer.Base}
 * @param {olx.layer.GroupOptions=} opt_options Layer options.
 * @api
 */
var _ol_layer_Group_ = function(opt_options) {

  var options = opt_options || {};
  var baseOptions = /** @type {olx.layer.GroupOptions} */
      (_ol_obj_.assign({}, options));
  delete baseOptions.layers;

  var layers = options.layers;

  _ol_layer_Base_.call(this, baseOptions);

  /**
   * @private
   * @type {Array.<ol.EventsKey>}
   */
  this.layersListenerKeys_ = [];

  /**
   * @private
   * @type {Object.<string, Array.<ol.EventsKey>>}
   */
  this.listenerKeys_ = {};

  _ol_events_.listen(this,
      _ol_Object_.getChangeEventType(Property.LAYERS),
      this.handleLayersChanged_, this);

  if (layers) {
    if (Array.isArray(layers)) {
      layers = new _ol_Collection_(layers.slice(), {unique: true});
    } else {
      assert(layers instanceof _ol_Collection_,
          43); // Expected `layers` to be an array or an `ol.Collection`
      layers = layers;
    }
  } else {
    layers = new _ol_Collection_(undefined, {unique: true});
  }

  this.setLayers(layers);

};

inherits(_ol_layer_Group_, _ol_layer_Base_);


/**
 * @private
 */
_ol_layer_Group_.prototype.handleLayerChange_ = function() {
  this.changed();
};


/**
 * @param {ol.events.Event} event Event.
 * @private
 */
_ol_layer_Group_.prototype.handleLayersChanged_ = function(event) {
  this.layersListenerKeys_.forEach(_ol_events_.unlistenByKey);
  this.layersListenerKeys_.length = 0;

  var layers = this.getLayers();
  this.layersListenerKeys_.push(
      _ol_events_.listen(layers, CollectionEventType.ADD,
          this.handleLayersAdd_, this),
      _ol_events_.listen(layers, CollectionEventType.REMOVE,
          this.handleLayersRemove_, this));

  for (var id in this.listenerKeys_) {
    this.listenerKeys_[id].forEach(_ol_events_.unlistenByKey);
  }
  _ol_obj_.clear(this.listenerKeys_);

  var layersArray = layers.getArray();
  var i, ii, layer;
  for (i = 0, ii = layersArray.length; i < ii; i++) {
    layer = layersArray[i];
    this.listenerKeys_[getUid(layer).toString()] = [
      _ol_events_.listen(layer, ObjectEventType.PROPERTYCHANGE,
          this.handleLayerChange_, this),
      _ol_events_.listen(layer, EventType.CHANGE,
          this.handleLayerChange_, this)
    ];
  }

  this.changed();
};


/**
 * @param {ol.Collection.Event} collectionEvent Collection event.
 * @private
 */
_ol_layer_Group_.prototype.handleLayersAdd_ = function(collectionEvent) {
  var layer = /** @type {ol.layer.Base} */ (collectionEvent.element);
  var key = getUid(layer).toString();
  this.listenerKeys_[key] = [
    _ol_events_.listen(layer, ObjectEventType.PROPERTYCHANGE,
        this.handleLayerChange_, this),
    _ol_events_.listen(layer, EventType.CHANGE,
        this.handleLayerChange_, this)
  ];
  this.changed();
};


/**
 * @param {ol.Collection.Event} collectionEvent Collection event.
 * @private
 */
_ol_layer_Group_.prototype.handleLayersRemove_ = function(collectionEvent) {
  var layer = /** @type {ol.layer.Base} */ (collectionEvent.element);
  var key = getUid(layer).toString();
  this.listenerKeys_[key].forEach(_ol_events_.unlistenByKey);
  delete this.listenerKeys_[key];
  this.changed();
};


/**
 * Returns the {@link ol.Collection collection} of {@link ol.layer.Layer layers}
 * in this group.
 * @return {!ol.Collection.<ol.layer.Base>} Collection of
 *   {@link ol.layer.Base layers} that are part of this group.
 * @observable
 * @api
 */
_ol_layer_Group_.prototype.getLayers = function() {
  return (/** @type {!ol.Collection.<ol.layer.Base>} */ this.get(Property.LAYERS));
};


/**
 * Set the {@link ol.Collection collection} of {@link ol.layer.Layer layers}
 * in this group.
 * @param {!ol.Collection.<ol.layer.Base>} layers Collection of
 *   {@link ol.layer.Base layers} that are part of this group.
 * @observable
 * @api
 */
_ol_layer_Group_.prototype.setLayers = function(layers) {
  this.set(Property.LAYERS, layers);
};


/**
 * @inheritDoc
 */
_ol_layer_Group_.prototype.getLayersArray = function(opt_array) {
  var array = opt_array !== undefined ? opt_array : [];
  this.getLayers().forEach(function(layer) {
    layer.getLayersArray(array);
  });
  return array;
};


/**
 * @inheritDoc
 */
_ol_layer_Group_.prototype.getLayerStatesArray = function(opt_states) {
  var states = opt_states !== undefined ? opt_states : [];

  var pos = states.length;

  this.getLayers().forEach(function(layer) {
    layer.getLayerStatesArray(states);
  });

  var ownLayerState = this.getLayerState();
  var i, ii, layerState;
  for (i = pos, ii = states.length; i < ii; i++) {
    layerState = states[i];
    layerState.opacity *= ownLayerState.opacity;
    layerState.visible = layerState.visible && ownLayerState.visible;
    layerState.maxResolution = Math.min(
        layerState.maxResolution, ownLayerState.maxResolution);
    layerState.minResolution = Math.max(
        layerState.minResolution, ownLayerState.minResolution);
    if (ownLayerState.extent !== undefined) {
      if (layerState.extent !== undefined) {
        layerState.extent = getIntersection(layerState.extent, ownLayerState.extent);
      } else {
        layerState.extent = ownLayerState.extent;
      }
    }
  }

  return states;
};


/**
 * @inheritDoc
 */
_ol_layer_Group_.prototype.getSourceState = function() {
  return SourceState.READY;
};

export default _ol_layer_Group_;
