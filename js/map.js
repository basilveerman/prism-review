function getMap() {

function popUp(f,l){
  var out = document.createElement('table');
  out.className = 'table table-condensed';
  if (f.properties){
    for(key in f.properties){
      $(out).append('<tr><th scope="row">'+key+'</th><td>'+f.properties[key]+'</td>');
      // out.push(key+": "+f.properties[key]);
    }
    l.bindPopup(out);
  }
}

var crs = new L.Proj.CRS.TMS(
  'EPSG:3005',
  '+proj=aea +lat_1=50 +lat_2=58.5 +lat_0=45 +lon_0=-126 +x_0=1000000 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs',
  [-1000000, -1000000, 3000000, 3000000],
  { 
    resolutions: [7812.5, 3906.25, 1953.125, 976.5625, 488.28125, 244.140625, 122.0703125, 61.03515625, 30.517578125, 15.2587890625, 7.62939453125, 3.814697265625]
  }
);

var map = new L.Map('map', 
  {
    crs: crs,
    center: new L.LatLng(55, -125),
    minZoom: 2,
    maxZoom: 10,
    zoom: 2,
    maxBounds: L.latLngBounds([[45, -148], [62, -108]]),
    worldCopyJump: false
  });

var reportLayer = L.geoJson().addTo(map);
map.reportLayer = reportLayer;

var osm = L.tileLayer('http://{s}.tiles.pacificclimate.org/tilecache/tilecache.py/1.0.0/bc_osm/{z}/{x}/{y}.png', 
  {
    subdomains: 'abc',
    maxZoom: 12,
    noWrap: true,
    attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    continuousWorld: false
  }
  ).addTo(map);

var pr = L.tileLayer.queryWMS('http://atlas.pcic.uvic.ca/ncWMS-pizza/wms', {
  layers: 'bc_ppt_8110/pr',
  transparent: true,
  opacity: 0.65,
  format: 'image/png',
  tileSize: 512,
  time: '1995-06-30T00:00:00.000Z',
  colorscalerange: '280,7200',
  styles: 'boxfill/rainbow',
  logscale: true,
  numcolorbands: 254,
  noWrap: true,
  popuphtml: function(value) {
    return 'Annual Precip: ' + Math.round(value) + ' mm';
  }
});

var pr_stations = L.markerClusterGroup();
$.getJSON("data/ppt_stations.json", function(data) {
  var geojson = L.geoJson(data);
  pr_stations.addLayer(geojson);
});

var precip_layers = L.layerGroup().addLayer(pr).addLayer(pr_stations).addTo(map);

var tmax = L.tileLayer.queryWMS('http://atlas.pcic.uvic.ca/ncWMS-pizza/wms', {
  layers: 'bc_tmax_8110/tmax',
  transparent: true,
  opacity: 0.65,
  format: 'image/png',
  tileSize: 512,
  time: '1995-07-15T00:00:00.000Z',
  colorscalerange: '0,30',
  styles: 'boxfill/ferret',
  logscale: false,
  numcolorbands: 254,
  noWrap: true,
  popuphtml: function(value) {
    return 'July Tmax: ' + Math.round(value * 10)/10 + ' &#x2103;';
  }
});

var tmax_stations = L.markerClusterGroup();
$.getJSON("data/tx_stations.json", function(data) {
  var geojson = L.geoJson(data);
  tmax_stations.addLayer(geojson);
});

var tmax_layers = L.layerGroup().addLayer(tmax).addLayer(tmax_stations);

var tmin = L.tileLayer.queryWMS('http://atlas.pcic.uvic.ca/ncWMS-pizza/wms', {
  layers: 'bc_tmin_8110/tmin',
  transparent: true,
  opacity: 0.65,
  format: 'image/png',
  tileSize: 512,
  time: '1995-01-15T00:00:00.000Z',
  colorscalerange: '-25,5',
  styles: 'boxfill/ferret',
  logscale: false,
  numcolorbands: 254,
  noWrap: true,
  popuphtml: function(value) {
    return 'January Tmin: ' + Math.round(value * 10)/10 + ' &#x2103;';
  }
});

var tmin_stations = L.markerClusterGroup();
$.getJSON("data/tn_stations.json", function(data) {
  var geojson = L.geoJson(data);
  tmin_stations.addLayer(geojson);
});

var tmin_layers = L.layerGroup().addLayer(tmin).addLayer(tmin_stations);

// This layer intentionally blank
var blank = L.marker();

// Add grouped layer control
var groupedOverlays = {
  "PRISM Climatologies": {
    "Precip": precip_layers,
    "Max Temp": tmax_layers,
    "Min Temp": tmin_layers,
    "None":  blank,
  }
};
var options = {
  exclusiveGroups: ["PRISM Climatologies"],
  collapsed: false
 };
L.control.groupedLayers(null, groupedOverlays, options).addTo(map);

// Leaflet-edit
var drawnItems = L.featureGroup().addTo(map);

var reportIcon = new L.AwesomeMarkers.icon(
{
  prefix: 'glyphicon',
  icon: 'pencil',
  markerColor: 'red'
});
map.reportIcon = reportIcon;

var drawControl = new L.Control.Draw({
  draw: {
    polygon: {
      shapeOptions: {
        color: 'red'
      }
    },
    marker: {
      icon: reportIcon
    },
    polyline: false,
    rectangle: false,
    circle: false
  },
});
map.addControl(drawControl);

// Add mouse position
L.control.mousePosition().addTo(map);

// Add overlay legend
L.control.overlayLegend({layer: pr, selectableLayers: [pr, tmax, tmin]}).addTo(map);

// Add infobox
var infoBox = L.control.infobox(pr_stations, {
  title: "Station Info",
}).addTo(map);

// Update infobox to new station layer on overlay change
map.on('overlayadd', function(e) {
  // Event is actually fired on a change of LayerGroup, need to find station layer
  var layers = e.layer.getLayers();
  for (i in layers) {
    if (layers[i] instanceof L.MarkerClusterGroup) {
      infoBox.setQueryLayer(layers[i]);
    }
  }
});

return map;
}
