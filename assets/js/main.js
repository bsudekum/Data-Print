(function() {
    L.Browser.retina = true;
    var map = L.mapbox.map('map', 'bobbysud.gh5h48pm', {
        tileLayer: {
            detectRetina: true
        }
    }).setView([0,0], 1);


    if (window.location.pathname == '/activities') {
        var provider = 'strava';
        $('body').addClass('strava');
        var userLoc = athlete.city + ', ' + athlete.state;
        var geocoder = L.mapbox.geocoder('bobbysud.gh5h48pm');
        geocoder.query(userLoc, showMap);
        function showMap(err, data) {
             map.fitBounds(data.lbounds);
        }
    } else {
        var provider = 'foursquare';
        $('body').addClass('foursquare');
    }

    // Menu settings
    $('#menuToggle, .menu-close').on('click', function() {
        $('#menuToggle').toggleClass('active');
        $('body').toggleClass('body-push-toleft');
        $('#theMenu').toggleClass('menu-open');
    });

    var mapStyles = {
        0: ['Streets', 'bobbysud.gh5h48pm'],
        1: ['Terrain', 'bobbysud.map-8owxxni8'],
        2: ['Satellite', 'bobbysud.map-ddwpawil'],
        3: ['Grey', 'bobbysud.map-n7u3y01e'],
        4: ['Windbreak', 'bobbysud.map-0c36p1bf'],
        5: ['Afternoon', 'bobbysud.map-cfaq2kkp'],
        6: ['Sunday\'s', 'bobbysud.map-3nbfdajb'],
        8: ['Technic', 'bobbysud.map-sl83837k']
    };
    var colorStyles = {
        0: 'f1f075',
        1: 'eaf7ca',
        2: 'c5e96f',
        3: 'a3e46b',
        4: '7ec9b1',
        5: 'b7ddf3',
        6: '63b6e5',
        7: '3ca0d3',
        8: '1087bf',
        9: '548cba',
        10: '677da7',
        11: '9c89cc',
        12: 'c091e6',
        13: 'd27591',
        14: 'f86767',
        15: 'e7857f',
        16: 'fa946e',
        17: 'f5c272',
        18: 'ede8e4',
        19: 'ffffff',
        20: 'cccccc',
        21: '6c6c6c',
        22: '1f1f1f',
        23: '000000'
    };

    $.each(colorStyles, function(key, value) {
        $('.map-style.line').append('' +
            '<li class=' + value + '>' +
            '<div style="background-color:#' + value + ';"></div>' +
            '</li>')
    });

    $.each(mapStyles, function(key, value) {
        $('.map-style.map').append('' +
            '<li class=' + value[1] + '>' +
            '<img src="https://api.tiles.mapbox.com/v3/' + value[1] + '/' + map.getCenter().lng + ',' + map.getCenter().lat + ',' + map.getZoom() + '/65x65.png" />' +
            '<div>' + value[0] + '</div>' +
            '</li>')
    });

    $('#output').click(function() {
        $('.mymodal').click()
        $(this).attr('disabled', 'disabled');
        // $('#map').css('height', '200%');
        // $('#map').css('width', '200%');
        // map.invalidateSize();
        // setTimeout(function() {
        leafletImage(map, doImage);
        // }, 2000)

    });

    function doImage(err, canvas) {
        var imgSend = canvas.toDataURL();
        $('.progress-bar').css('width', '10%');
        $.ajax({
            url: '/image',
            type: 'POST',
            data: {
                image: imgSend,
            },
            success: function(e) {
                $('.progress-bar').css('width', '90%');
                var data = JSON.parse(e.data);
                $('.buynow').attr('data-cp-url', data.url).click();
                $('.progress-bar').css('width', '100%');
                $('.currently').html('Done! <a href="' + data.url + '" target=_blank>link</a>');
            }
        });
        $('.progress-bar').css('width', '70%');
    };

    function displayData(userData) {
        console.log(userData)
        for (var i = 0; i < userData.length; i++) {
            var poly = L.Polyline.fromEncoded(userData[i].map.summary_polyline);
            L.polyline(poly.getLatLngs(), {
                'color': '#F86767',
                'opacity': '.8',
                'weight': '12'
            }).addTo(geoGroup);

            if (i == userData.length - 1) {
                // map.fitBounds(geoGroup.getBounds());
                map.addLayer(geoGroup);
            }
        }

    } //run displayData

    function clearMap() {
        for (i in map._layers) {
            if (map._layers[i]._tiles !== undefined) {
                map.removeLayer(map._layers[i]);
            }
        }
    }

    $('.width').change(function() {
        if ($('.map-style.line').hasClass('circle')) {
            console.log('git')
            geoGroup.eachLayer(function(layer) {
                console.log(layer.getRadius())
                layer.setRadius(($('.width').val() / 10) * layer.getRadius());
            });
        } else {
            geoGroup.eachLayer(function(layer) {
                layer.setStyle({
                    weight: $('.width').val()
                });
            });
        }
    });

    $('.opacity').change(function() {
        $('.leaflet-marker-icon').css('opacity', $('.opacity').val() / 100);
        geoGroup.eachLayer(function(layer) {
            layer.setStyle({
                opacity: $('.opacity').val() / 100
            });
            layer.setStyle({
                fillOpacity: $('.opacity').val() / 100
            });
        });
    });

    $('.btn-4sq').click(function() {
        geoGroup.clearLayers(map);
        for (var i = 0; acts.length; i++) {
            add4sq(acts[i], 'icon')
        }
    });

    $('.btn-circle').click(function() {
        geoGroup.clearLayers(map);
        for (var i = 0; acts.length; i++) {
            add4sq(acts[i], 'circle')
        }
    });

    $('.btn-marker').click(function() {
        geoGroup.clearLayers(map);
        for (var i = 0; acts.length; i++) {
            add4sq(acts[i], 'marker')
        }
    })

    $('.map-style.line li').click(function(e) {
        var colorClicked = '#' + $(this).attr('class');
        if (provider == 'foursquare') {
            if ($('.map-style.line').hasClass('marker')) {
                geoGroup.eachLayer(function(layer) {
                    var newL = L.mapbox.marker.icon({
                        'marker-color': colorClicked,
                    })
                    layer.setIcon(newL)
                });
            } else {
                geoGroup.eachLayer(function(layer) {
                    layer.setStyle({
                        fillColor: colorClicked,
                        color: colorClicked
                    });
                });
            }
        }

        if (provider == 'strava') {
            geoGroup.eachLayer(function(layer) {
                layer.setStyle({
                    color: colorClicked
                });
            });
        }

    });

    $('.map-style.map li').click(function(e) {
        var layer = $(this).attr('class');
        clearMap();
        L.mapbox.tileLayer(layer, {
            detectRetina: true
        }).addTo(map);
    });

    var geoGroup = L.layerGroup();

    function add4sq(data, style) {
        try {
            var c = JSON.parse(data)
        } catch (e) {
            console.log(e)
        }

        var checkins = c.response.checkins.items;
        for (var i = 0; i < checkins.length; i++) {
            var uri = '/images/4sq_border/' + checkins[i].venue.categories[0].icon.prefix.split('/')[5] + '/' + checkins[i].venue.categories[0].icon.prefix.split('/')[6].slice(0, -1) + '.png';

            if (style == 'icon') {
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

                if (checkins[i].venue.beenHere.count <= 5) {
                    var numCheckins = 50;
                }
                if (checkins[i].venue.beenHere.count > 5 && checkins[i].venue.beenHere.count <= 20) {
                    var numCheckins = 200;
                }
                if (checkins[i].venue.beenHere.count > 20) {
                    var numCheckins = 500;
                }

                L.circle([checkins[i].venue.location.lat, checkins[i].venue.location.lng], numCheckins, {
                    stroke: false,
                })
                    .bindPopup(checkins[i].venue.name)
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
                geoGroup.addTo(map);
                $('.leaflet-marker-icon').error(function() {
                    $(this).attr('src', '/images/4sq_border/' + $(this).attr('src').split('/')[3] + '/default.png');
                    $('.leaflet-marker-icon').error(function() {
                        $(this).attr('src', '/images/4sq_border/default.png');
                    });
                });
            }

        }
    } //Add 4sq

    if (provider == 'foursquare') {
        for (var i = 0; acts.length; i++) {
            add4sq(acts[i], 'icon')
            map.setView(geoGroup.getLayers()[0].getLatLng(), 14)
        }
    } else {
        displayData(acts)
    }


    // printing
    (function(d, s, id) {
        var js, cpJs = d.getElementsByTagName(s)[0],
            t = new Date();
        if (d.getElementById(id)) return;
        js = d.createElement(s);
        js.id = id;
        js.setAttribute('data-cp-url', 'https://store.canvaspop.com');
        js.src = 'https://store.canvaspop.com/static/js/cpopstore.js?bust=' + t.getTime();
        cpJs.parentNode.insertBefore(js, cpJs);
    }(document, 'script', 'canvaspop-jssdk'));

})(jQuery)