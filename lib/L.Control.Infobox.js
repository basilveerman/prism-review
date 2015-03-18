L.Control.Infobox = L.Control.extend({
  options: {
    position: 'topleft',
    // div_id: 'infobox',
    placeholder: '',
    title: '',
  },

  initialize: function(layer, options) {
    L.Util.setOptions(this, options);
    this._layer = layer;
  },

  setQueryLayer: function(layer) {
    this.remove();
    this._layer.off('click', this._showInfo, this);
    this._layer = layer;
    this._layer.on('click', this._showInfo, this);
  },

  onAdd: function (map) {
    this._container = L.DomUtil.create('div', 'leaflet-control-infobox');
    L.DomEvent.disableClickPropagation(this._container);
    L.DomEvent.addListener(this._container, 'mousewheel', function(e) {
      L.DomEvent.stopPropagation(e);
    });
    this._layer.on('click', this._showInfo, this);
    this._container.innerHTML = this.options.placeholder;
    return this._container;
  },

  _showInfo: function(e) {
    this._container.className += " leaflet-control-infobox-expanded";
    this._container.innerHTML = "<h4>" + this.options.title + "</h4>";
    var infoTable = document.createElement('table');
    infoTable.className = 'table table-condensed';
    if (e.layer.feature.properties){
      for(key in e.layer.feature.properties){
        $(infoTable).append('<tr><th scope="row">'+key+'</th><td>'+e.layer.feature.properties[key]+'</td>');
      }
    }
    this._container.appendChild(infoTable);
  },

  remove: function() {
    if (this._container) {
      this._container.innerHTML = '';
    }
  }

});

L.control.infobox = function (layer, options) {
    return new L.Control.Infobox(layer, options);
};
