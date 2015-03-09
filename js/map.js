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

var pr = L.tileLayer.wms('http://atlas.pcic.uvic.ca/ncWMS/wms', {
  layers: 'pr_monClim_PRISM_historical_run1_197101-200012/pr',
  transparent: true,
  opacity: 0.65,
  format: 'image/png',
  time: '1985-06-30',
  styles: 'boxfill/occam_inv',
  logscale: true,
  numcolorbands: 254,
  noWrap: true,
}).addTo(map);
var tmax = L.tileLayer.wms('http://atlas.pcic.uvic.ca/ncWMS/wms', {
  layers: 'tmax_monClim_PRISM_historical_run1_197101-200012/tmax',
  transparent: true,
  opacity: 0.65,
  format: 'image/png',
  time: '1985-06-30',
  styles: 'boxfill/ferret',
  logscale: false,
  numcolorbands: 254,
  noWrap: true,
});
var tmin = L.tileLayer.wms('http://atlas.pcic.uvic.ca/ncWMS/wms', {
  layers: 'tmin_monClim_PRISM_historical_run1_197101-200012/tmin',
  transparent: true,
  opacity: 0.65,
  format: 'image/png',
  time: '1985-06-30',
  styles: 'boxfill/ferret',
  logscale: false,
  numcolorbands: 254,
  noWrap: true,
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