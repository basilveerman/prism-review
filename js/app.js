$(document).ready(function() {
  var map = getMap();

  var template = Handlebars.getTemplate('datareport');
  var layer;
  var user;

  map.on('draw:created', function(event) {
    var type = event.layerType;
    layer = event.layer;
    var wkt = toWKT(layer);
    var $html = $(template({wkt: wkt, name: user.name, email: user.email}));

    BootstrapDialog.show({
      title: "PRISM Data Annotation",
      message: $html,
      buttons: [{
        label: 'Submit (no undo)',
        cssClass: 'btn-primary',
        action: function(dialogRef){
          var params = $('#report').serializeObject()
          var geojson = layer.toGeoJSON();
          geojson.properties = params;
          if (paramsAreValid(params)) {
            base.push(geojson);
            dialogRef.close();
          } else {
            alert("All fields are required");
          }
        }
      }, {
        label: 'Cancel',
        cssClass: 'btn-danger',
        action: function(dialogRef){
          dialogRef.close();
        }
      }]
    });
  });

  function addUserData(base) {
    // Init the user specific data store

    base.on('child_added', function(snapshot) {
      // And for each new marker, add a featureLayer.
      map.reportLayer.addData(snapshot.val()).eachLayer(function(l) {
        // each marker should have a label with its title.
        var geojson = l.toGeoJSON();
        if (geojson && geojson.properties && geojson.properties.name && geojson.properties.layer && geojson.properties.report) {
          l.bindPopup('<table class="table"><tr><th scope="row">Submitted By:</th><td>'+geojson.properties.name+'</td></tr><tr><th scope="row">Layer</th><td>'+geojson.properties.layer+'</td></tr><tr><th scope="row">Details</th><td>'+geojson.properties.report+'</td></tr></table>');
        }
      }).addTo(map);
    });
  }

  hello.on('auth.login', function(auth) {
    // call user information, for the given network
    hello( auth.network ).api( '/me' ).then( function(r){
      user = r;

      // Change to logout
      $("#login").hide();
      $("#logout").show();

      // Inject login info into container
      var container = document.getElementById("auth");
      label = document.createElement("div");
      label.id = "profile";
      container.appendChild(label);
      label.innerHTML = '&nbsp;<center><img src="'+ r.thumbnail +'" class="img-circle" /><strong> Hello '+r.first_name + '</strong></center>';

      // Init user specific map
      baseUrl = 'https://shining-fire-5210.firebaseio.com/' + r.id;
      base = new Firebase(baseUrl);
      addUserData(base);
    });
  });

  hello.on('auth.logout', function(auth) {
    // Change to login button
    $("#login").show();
    $("#logout").hide();
    // Remove profile information
    var label = document.getElementById("profile");
    label.parentNode.removeChild(label);
    map.removeLayer(map.reportLayer);
  });

  hello.init({
    google   : '672630562121-8rrr7skrrb9qq4r5putbjfm2v7jam770.apps.googleusercontent.com'
  },{
    scope: 'email'
  });

  $("#login").click(function(){
    hello.login("google");
  });
  $("#logout").click(function(){
    hello.logout("google");
  });
});