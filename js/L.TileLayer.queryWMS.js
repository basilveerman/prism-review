L.TileLayer.QueryWMS = L.TileLayer.WMS.extend({
  options: {
    popuphtml: function(value) {
      return value;
    }
  },

  onAdd: function(map) {
    // Triggered when the layer is added to a map.
    //   Register a click listener, then do all the upstream WMS things
    L.TileLayer.WMS.prototype.onAdd.call(this, map);
    map.on('click', this.getFeatureInfo, this);
  },

  onRemove: function(map) {
    // Triggered when the layer is removed from a map.
    //   Unregister a click listener, then do all the upstream WMS things
    L.TileLayer.WMS.prototype.onRemove.call(this, map);
    map.off('click', this.getFeatureInfo, this);
  },

  getFeatureInfo: function(evt) {
    // Make an AJAX request to the server 
    var url = this.getFeatureInfoUrl(evt.latlng)
    var showResults = L.Util.bind(this.showGetFeatureInfo, this);
    $.ajax({
      url: url,
      type: 'GET',
      // crossDomain: true, // enable this
      success: function(data, status, xhr) {
        showResults(evt.latlng, data);
      },
      error: function(xhr, status, error) {
        showResults(error);
      }
    });
  },

  getFeatureInfoUrl: function(latlng) {
    var point = [];
    // Construct a GetFeatureInfo request URL given a point
    point = this._map.latLngToContainerPoint(latlng, this._map.getZoom()),
      size = this._map.getSize(),
      params = {
        request: 'GetFeatureInfo',
        service: 'WMS',
        srs: 'EPSG:4326',
        time: this.wmsParams.time,
        styles: this.wmsParams.styles,
        transparent: this.wmsParams.transparent,
        version: this.wmsParams.version,
        format: this.wmsParams.format,
        bbox: this._map.getBounds().toBBoxString(),
        height: size.y,
        width: size.x,
        layers: this.wmsParams.layers,
        query_layers: this.wmsParams.layers,
        info_format: 'text/xml'
      };
    // implemented from http://gis.stackexchange.com/questions/109414/leaflet-wms-getfeatureinfo-gives-result-only-on-zoom-level-10/132336#132336
    var bds = this._map.getBounds();
    var sz = this._map.getSize();
    var w = bds.getNorthEast().lng - bds.getSouthWest().lng;
    var h = bds.getNorthEast().lat - bds.getSouthWest().lat;
    var X2 = (((latlng.lng - bds.getSouthWest().lng) / w) * sz.x).toFixed(0);
    var Y2 = (((bds.getNorthEast().lat - latlng.lat) / h) * sz.y).toFixed(0);

    params[params.version === '1.3.0' ? 'i' : 'x'] = X2;
    params[params.version === '1.3.0' ? 'j' : 'y'] = Y2;

    return this._url + L.Util.getParamString(params, this._url, true);
  },

  showGetFeatureInfo: function(latlng, content) {
    content = this.options.popuphtml($(content).find('value').text())
    var p = L.popup()
      .setLatLng(latlng)
      .setContent(content)
      .openOn(this._map);
  }
});

L.tileLayer.queryWMS = function(url, options) {
  return new L.TileLayer.QueryWMS(url, options);
};