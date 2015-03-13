function getMap() {

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
  time: '1995-06-30T00:00:00.000Z',
  colorscalerange: '280,7200',
  styles: 'boxfill/rainbow',
  logscale: true,
  numcolorbands: 254,
  noWrap: true,
  popuphtml: function(value) {
    return 'Annual Precip: ' + Math.round(value) + ' mm';
  }
}).addTo(map);
var tmax = L.tileLayer.queryWMS('http://atlas.pcic.uvic.ca/ncWMS-pizza/wms', {
  layers: 'bc_tmax_8110/tmax',
  transparent: true,
  opacity: 0.65,
  format: 'image/png',
  time: '1995-07-15T00:00:00.000Z',
  colorscalerange: '0,30',
  styles: 'boxfill/ferret',
  logscale: false,
  numcolorbands: 254,
  noWrap: true,
  popuphtml: function(value) {
    return 'July Tmax: ' + Math.round(value * 10)/10 + ' &#x2103;C';
  }
});
var tmin = L.tileLayer.queryWMS('http://atlas.pcic.uvic.ca/ncWMS-pizza/wms', {
  layers: 'bc_tmin_8110/tmin',
  transparent: true,
  opacity: 0.65,
  format: 'image/png',
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

// Add grouped layer control
var groupedOverlays = {
  "PRISM Climatologies": {
    "Max Temp": tmax,
    "Min Temp": tmin,
    "Precip": pr,
  }
};
var options = { exclusiveGroups: ["PRISM Climatologies"] };
L.control.groupedLayers(null, groupedOverlays, options).addTo(map);

// Leaflet-edit
var drawnItems = L.featureGroup().addTo(map);

map.addControl(new L.Control.Draw({
  draw: {
    polyline: false,
    rectangle: false,
    circle: false
  },
}));

// Add mouse position
L.control.mousePosition().addTo(map);

// Add overlay legend
L.control.overlayLegend({layer: pr}).addTo(map);

return map;
}