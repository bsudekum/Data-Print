var provider = 'strava';
$('body').addClass('strava');
var userLoc = user.city + ', ' + user.state;
var geocoder = L.mapbox.geocoder('bobbysud.gh5h48pm');
geocoder.query(userLoc, showMap);

function showMap(err, data) {
    map.fitBounds(data.lbounds);
}

function displayData(userData) {
    console.log(userData)
    for (var i = 0; i < userData.length; i++) {
        var poly = L.Polyline.fromEncoded(userData[i].map.summary_polyline);
        L.polyline(poly.getLatLngs(), {
            'color': '#F86767',
            'opacity': '.8',
            'weight': '4'
        }).addTo(geoGroup);

        if (i == userData.length - 1) {
            map.addLayer(geoGroup);
        }
    }
} //run displayData

displayData(acts);

$('.map-style.line li').click(function (e) {
    var colorClicked = '#' + $(this).attr('class');
    geoGroup.eachLayer(function (layer) {
        layer.setStyle({
            color: colorClicked
        });
    });
});
