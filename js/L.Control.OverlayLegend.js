L.Control.OverlayLegend = L.Control.extend({
  options: {
    position: 'bottomright',
    div_id: 'legend_container'
  },

  initialize: function(options) {
    L.Util.setOptions(this, options);
  },

  _getOverlayLayer: function(layer) {
    // Utility fucntion to deal with grouped layers
    if (typeof layer.getLayers !== "undefined") {
      layers = layer.getLayers();
      for (l in layers) {
        if (this.options.selectableLayers.indexOf(layers[l]) > -1) {
          return layers[l];
        }
      }
      // Layer group does not contain any valid layers
      return;
    } else {
      return layer;
    }
  },

  graphicURL: function(layer) {
    layer = this._getOverlayLayer(layer);
    if (typeof layer === "undefined") {
      return '';
    }
    if (typeof layer._url === "undefined") { // Dirty hack to deal with 'none' layer
      return '';
    }
    server = layer._url;
    params = {
      PALETTE: layer.options.styles.split('/')[1],
      LAYER: layer.options.layers,
      NUMCOLORBANDS: layer.options.numcolorbands,
      COLORSCALERANGE: layer.options.colorscalerange,
      LOGSCALE: layer.options.logscale,
    }
    str = $.param(params);
    return server + "?REQUEST=GetLegendGraphic&WIDTH=100&HEIGHT=500&" + str;
  },

  onAdd: function (map) {
    this._container = L.DomUtil.create('div', 'info legend');
    L.DomEvent.disableClickPropagation(this._container);
    map.on('overlayadd', this._onOverlayChange, this);
    this._container.id = this.options.div_id;
    this._container.innerHTML = '<img src="' + this.graphicURL(this.options.layer) + '">';
    return this._container;
  },

  _onOverlayChange: function(e) {
    this._container.innerHTML = '<img src="' + this.graphicURL(e.layer) + '">';
  }
});

L.control.overlayLegend = function (options) {
    return new L.Control.OverlayLegend(options);
};