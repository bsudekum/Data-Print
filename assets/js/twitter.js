$('body').addClass('twitter');

function addTwitter(data, style) {

    if (data.geo) {
        if (data.geo.coordinates) {

            if (style == 'circle') {

                if(data.favorite_count + data.retweet_count > 50){
                    var num = 50;
                } else if(data.favorite_count + data.retweet_count < 5){
                    var num = 5;
                } else {
                    var num = data.favorite_count + data.retweet_count;
                }

                L.circle([data.geo.coordinates[0], data.geo.coordinates[1]], num * 80, {
                    stroke: false,
                    fillColor: '#fa946e'
                })
                    .bindPopup(data.text)
                    .addTo(geoGroup);
                $('.map-style.line').removeClass('marker');
                $('.map-style.line').addClass('circle');
            }

            if (style == 'marker') {
                var newL = L.mapbox.marker.icon({
                    'marker-color': '#fa946e',
                })
                L.marker([data.geo.coordinates[0], data.geo.coordinates[1]])
                    .setIcon(newL)
                    .bindPopup(data.text)
                    .addTo(geoGroup);
                $('.map-style.line').removeClass('circle');
                $('.map-style.line').addClass('marker');
            }
        }
    }
}

console.log(acts)

function addItems(shape) {
    for (var i = 0; i < acts.length; i++) {
        for (var p = 0; p < acts[i].length; p++) {
            addTwitter(acts[i][p], shape)
            geoGroup.addTo(map);
            // if (p == acts[i][p].length - 1) {
            //     geoGroup.addTo(map);
            // }
        }

    }
}

addItems('marker');

// for (var i = 0; i < acts.length; i++) {
//     if (i == acts.length - 1) {
//         map.setView([geoGroup.getLayers()[0].getLatLng().lat, geoGroup.getLayers()[0].getLatLng().lng], 14);
//     }
// }

$('.map-style.line li').click(function (e) {
    var colorClicked = '#' + $(this).attr('class');

    if ($('.map-style.line').hasClass('marker')) {
        geoGroup.eachLayer(function (layer) {
            var newL = L.mapbox.marker.icon({
                'marker-color': colorClicked,
            })
            layer.setIcon(newL)
        });
    } else {
        geoGroup.eachLayer(function (layer) {
            layer.setStyle({
                fillColor: colorClicked,
                color: colorClicked
            });
        });
    }

});
