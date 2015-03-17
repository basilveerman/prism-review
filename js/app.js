$(document).ready(function() {
  var map = getMap();

  var template = Handlebars.getTemplate('datareport');
  var layer;
  var user;

  map.on('draw:created', function(event) {

    var g = hello("google").getAuthResponse();
    if (!online(g)) {
      BootstrapDialog.show({
        message: "You must first log in to place markers",
        type: BootstrapDialog.TYPE_DANGER
      });
      return;
    }
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
          params.name = user.name;
          params.email = user.email;
          var geojson = layer.toGeoJSON();
          geojson.properties = params;
          if (paramsAreValid(params)) {
            base.push(geojson);
            dialogRef.close();
          } else {
            alert("Report details are required");
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
          if (l.feature.geometry.type === 'Point') {
            l.setIcon(map.reportIcon);
          } else if (l.feature.geometry.type === 'Polygon'){
            l.setStyle({color: 'red'})
          }
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
    user = undefined;
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

  var introDialog = BootstrapDialog.show({
    title: "Welcome",
    message: "<p>Thank you for participating in the PRISM review process. This application allows you to view and provide reviews of PRISM maps of the 1981 - 2010 climatologies of annual total precipitation, January minimum temperature, and July maximum temperature. You can create data reports linked to a geographic areas of interest or single points that will be reviewed by the PRISM team. Full documentation on the review process and portal functionality can be found <a href='doc.pdf'>here</a></p></p>In order to save your review input, this application requires you to log in with a Google account. We request limited access to your basic information (name and email) to allow us to follow up on your review comments where needed. Once logged in, your data will be automatically saved between sessions so you may revisit the portal at any time during the review period.</p>",
    type: BootstrapDialog.TYPE_INFO
  });
});