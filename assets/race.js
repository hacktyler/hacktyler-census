var map;

//tile layers
var current_tiles = null;
var race_tiles = new L.TileLayer("http://localhost:8001/tyler-census-race/tiles/{z}/{x}/{y}.png");
if ( $.browser.webkit ) {
    race_tiles.unloadInvisibleTiles = true;
}

//for search
var southwest_limit = new google.maps.LatLng(32.2, -95.4);
var northeast_limit = new google.maps.LatLng(32.4, -95.2);   
var bounding_box = new google.maps.LatLngBounds(southwest_limit, northeast_limit);
var state_pattern = /\stx\s|\stexas\s/gi;
var state_swap = 'TX';
var tracts = {};
var drop_marker = function(lat,lon,zoom){
    if (zoom == null){
        zoom = 13;
    }
    map.setView(map.getCenter(), zoom, true);
    var latlng = new L.LatLng(lat, lon);
    var offset_center = map.latLngToLayerPoint(latlng);
    //width of the sidebar, over two
    offset_center.x = offset_center.x - $("#content").width() / 2;
    offset_latlng = map.layerPointToLatLng(offset_center);
    map.setView(offset_latlng, map.getZoom(), true);
    if(marker) {
        marker.setLatLng(latlng);
    }
    else {
        marker = new L.Marker(latlng);
        map.addLayer(marker);
    }
    map.setView(offset_latlng, zoom, true);
}
var search_callback = drop_marker;
var marker;

function update_hash(){
    window.location.hash = make_hash();
}

function parse_hash(s) {
    if (s == null) { s = window.location.hash; }
    if (!s) { return; }
    //IE gives you a # at the start. sonova
    s = s.replace('#','');
    parts = s.split(",");
    lat = parseFloat(parts[0]);
    lng = parseFloat(parts[1]);
    zoom = parseInt(parts[2]);
    if (parts.length == 6) {
        var markerLat = parseFloat(parts[3]);
		var markerLng = parseFloat(parts[4]);
        return [lat, lng, zoom, mapType, markerLat, markerLng];
    } else {
        return [lat, lng, zoom, mapType];
    }
    return null;
}

function make_hash() {
    var parts = [map.getCenter().lat, map.getCenter().lng, map.getZoom()]
    if (marker != null){
     parts.push(marker.getLatLng().lat);
     parts.push(marker.getLatLng().lng);
    }
    return parts.join(",");
}

$(document).ready(function() {
    map = new L.Map('map_canvas', { minZoom:10, maxZoom:15 });
    map.setView(new L.LatLng(32.325, -95.304), 12);

    tiles = new L.TileLayer("http://{s}.google.com/vt/?hl=en&x={x}&y={y}&z={z}&s={s}&apistyle=s.t:33|p.v:off,p.s:-100|p.il:true,s.t:51|p.v:off,s.t:50|p.l:-50,s.t:49|p.l:-50,s.t:2|p.v:off,s.t:1|p.l:-67|p.v:off,s.t:6|s.e:l|p.v:off,s.t:4|p.v:off,s.t:5|p.l:-100,s.t:3|s.e:l|p.v:off,s.t:6|p.l:16", {
         attribution: "Map data is Copyright Google, 2011",
         subdomains: ['mt0','mt1','mt2','mt3']
    });
    map.addLayer(tiles);
    map.addLayer(race_tiles);
    
    loc = parse_hash();
    if (loc) {
        var center_lat = loc[0];
        var center_lng = loc[1];
        var zoom = loc[2];
        var markerLat = loc[3];
        var markerLng = loc[4];
        if (markerLat != null){
            drop_marker(markerLat, markerLng, zoom);
        } else {
            map.setView(new L.LatLng(center_lat, center_lng), zoom, true);
        }
    }

    map.on('move', function() {
        update_hash();
    });
});
