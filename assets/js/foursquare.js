var provider = 'foursquare';
$('body').addClass('foursquare');
$('button.fifty').css('width','32%')

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


function add4sq(data, style) {
    if (data) {
        try {
            var c = JSON.parse(JSON.parse(data))
            console.log(c)
        } catch (e) {
            console.log(e)
        }

        var checkins = c.response.checkins.items;
        for (var i = 0; i < checkins.length; i++) {

            if (style == 'icon') {
                var uri = '/images/4sq_border/' + checkins[i].venue.categories[0].icon.prefix.split('/')[5] + '/' + checkins[i].venue.categories[0].icon.prefix.split('/')[6].slice(0, -1) + '.png';
                var fourIcon = L.icon({
                    iconUrl: uri,
                    iconSize: [22, 22],
                    iconAnchor: [11, 11],
                    popupAnchor: [0, 0],
                })

                L.marker([checkins[i].venue.location.lat, checkins[i].venue.location.lng], {
                    icon: fourIcon
                })
                    .bindPopup(checkins[i].venue.name)
                    .addTo(geoGroup);

                $('.map-style.line').addClass('marker');
                $('.map-style.line').removeClass('circle');
            }
            if (style == 'circle') {
                
                if(checkins[i].venue.beenHere.count > 50){
                    var num = 50;
                } else if(checkins[i].venue.beenHere.count < 5){
                    var num = 5;
                } else {
                    var num = checkins[i].venue.beenHere.count;
                }

                if(checkins[i].venue.beenHere.count < 5){
                    
                }

                L.circle([checkins[i].venue.location.lat, checkins[i].venue.location.lng], num * 10, {
                    stroke: false,
                    fillColor: '#548cba',
                    fillOpacity: .8
                })
                    .bindPopup(checkins[i].venue.beenHere.count)
                    .addTo(geoGroup);
                $('.map-style.line').removeClass('marker');
                $('.map-style.line').addClass('circle');
            }

            if (style == 'marker') {
                var newL = L.mapbox.marker.icon({
                    'marker-color': '#f86767',
                })
                L.marker([checkins[i].venue.location.lat, checkins[i].venue.location.lng])
                    .setIcon(newL)
                    .bindPopup(checkins[i].venue.name)
                    .addTo(geoGroup);
                $('.map-style.line').removeClass('circle');
                $('.map-style.line').addClass('marker');
            }

            if (i == checkins.length - 1) {
                $('.leaflet-marker-icon').error(function () {
                    $(this).attr('src', '/images/4sq_border/' + $(this).attr('src').split('/')[3] + '/default.png');
                    $('.leaflet-marker-icon').error(function () {
                        $(this).attr('src', '/images/4sq_border/default.png');
                    });
                });
            }

        }
    }
} //Add 4sq

function addItems(shape) {
    for (var q = 0; q < acts.length; q++) {
        add4sq(acts[q], shape)
        if (q == acts.length - 1) {
            geoGroup.addTo(map);
            $('.leaflet-marker-icon').error(function () {
                $(this).attr('src', '/images/4sq_border/' + $(this).attr('src').split('/')[3] + '/default.png');
                $('.leaflet-marker-icon').error(function () {
                    $(this).attr('src', '/images/4sq_border/default.png');
                });
            });
        }
    }
}

addItems('circle')

map.setView(geoGroup.getLayers()[0].getLatLng(), 13)
