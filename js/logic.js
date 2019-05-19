// Setup the Tile Layer Selections
// grayscale
var graymap_background = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoiamFuYWNoYXR0ZXJqZWUiLCJhIjoiY2p2ZWRxaHdmMXY3cTQzcnh1NzEzNnNiMSJ9.zeuJctkfo69Gm9EW0Ylsiw");

// satellite
var satellitemap_background = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoiamFuYWNoYXR0ZXJqZWUiLCJhIjoiY2p2ZWRxaHdmMXY3cTQzcnh1NzEzNnNiMSJ9.zeuJctkfo69Gm9EW0Ylsiw");

// outdoors
var outdoors_background = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoiamFuYWNoYXR0ZXJqZWUiLCJhIjoiY2p2ZWRxaHdmMXY3cTQzcnh1NzEzNnNiMSJ9.zeuJctkfo69Gm9EW0Ylsiw");

// Next, map the object to layer array
var map = L.map("mapid", {
  center: [40.71, 74.01],
  zoom: 5,
  layers: [graymap_background, satellitemap_background, outdoors_background]
});

// K, add the graymap tile layer to the map
graymap_background.addTo(map);

// Setup the layers for earthquakes & tectonicplates.
var tectonicplates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();

// K, now outline the base layers
var baseMaps = {
  Satellite: satellitemap_background,
  Grayscale: graymap_background,
  Outdoors: outdoors_background
};

// K, now outline the overlays 
var overlayMaps = {
  "Tectonic Plates": tectonicplates,
  "Earthquakes": earthquakes
};

// Next, setup the layer visualization
L
  .control
  .layers(baseMaps, overlayMaps)
  .addTo(map);

// K, now get the data from earthquake geoJSON
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson", function(data) {


  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // K, setup the marker colors by earthquake magnitude
  function getColor(magnitude) {
    switch (true) {
      case magnitude > 5:
        return "deeppink"; 
      case magnitude > 4:
        return "coral";
      case magnitude > 3:
        return "chocolate"; 
      case magnitude > 2:
        return "goldenrod";
      case magnitude > 1:
        return "limegreen";
      default:
        return "turquoise";
    }
  }

  // Next, setup the marker radius by magnitude

  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }

    return magnitude * 3;
  }

  // Next, add in the GeoJSON layer
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleInfo,
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }

  }).addTo(earthquakes);

  earthquakes.addTo(map);

// Kewel, now make a legend & add it to the map
  var legend = L.control({
    position: "bottomright"
  });

  legend.onAdd = function() {
    var div = L
      .DomUtil
      .create("div", "info legend");

    var grades = [0, 1, 2, 3, 4, 5];
    var colors = [
      "aqua",
      "limegreen",
      "goldenrod",
      "chocolate",
      "coral",
      "deeppink" 
    ];


    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background: " + colors[i] + "'></i> " +
        grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };


  legend.addTo(map);

  // Next, get the Tectonic Plate geoJSON data that will look like a line all over the map
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
    function(platedata) {
 
      L.geoJson(platedata, {
        color: "black",
        weight: 1
      })
      .addTo(tectonicplates);

      // k, now add it to the map
      tectonicplates.addTo(map);
    });
});

// The end.