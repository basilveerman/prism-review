L.Control.Colorbar = L.Control.extend({
  options: {
    position: 'bottomright',
    div_id: 'colorbar_container'
  },

  initialize: function(options) {
    L.Util.setOptions(this, options);
  },

  graphicURL: function(layer) {
    server = layer._url;
    params = {
      REQUEST: "GetLegendGraphic",
      COLORBARONLY: "true",
      WIDTH: 20,
      HEIGHT: 300,
      PALETTE: layer.options.styles.split('/')[1],
      NUMCOLORBANDS: layer.options.numcolorbands,
      LOGSCALE: layer.options.logscale,
    }
    str = $.param(params);
    return server + "?" + str;
  },

  onAdd: function (map) {
    this._container = L.DomUtil.create('div', 'leaflet-control-colorbar');
    $(this._container).html('<div id="minimum"></div><div id="midpoint"></div><div id="maximum"></div>');
    $(this._container).css({border: "2px solid black"});
    $('#maximum').css({ position: "absolute", top: "-0.5em", right: "20px"});
    $('#midpoint').css({ position: "absolute", top: "50%", right: "20px"});
    $('#minimum').css({ position: "absolute", bottom: "-0.5em", right: "20px"});
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

L.control.colorbar = function (options) {
    return new L.Control.Colorbar(options);
};