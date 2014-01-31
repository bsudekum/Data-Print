L.Browser.retina = true;

var map = L.mapbox.map('map', 'bobbysud.gh5h48pm', {
    tileLayer: {
        detectRetina: true
    }
}).setView([0, 0], 0);

var geoGroup = L.layerGroup();

// Menu settings
$('#menuToggle, .menu-close').on('click', function () {
    $('#menuToggle').toggleClass('active');
    $('body').toggleClass('body-push-toleft');
    $('#theMenu').toggleClass('menu-open');
});

var mapStyles = {
    0: ['Streets', 'bobbysud.gh5h48pm'],
    1: ['Terrain', 'bobbysud.h3db8o6k'],
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

$.each(colorStyles, function (key, value) {
    $('.map-style.line').append('' +
        '<li class=' + value + '>' +
        '<div style="background-color:#' + value + ';"></div>' +
        '</li>')
});

$.each(mapStyles, function (key, value) {
    $('.map-style.map').append('' +
        '<li class=' + value[1] + '>' +
        '<img src="https://api.tiles.mapbox.com/v3/' + value[1] + '/-122.4461,37.7580,13/65x65.png" />' +
        '</li>')
});

$('#output').click(function () {
    $('#myModal').modal('show')
    leafletImage(map, doImage);
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
        success: function (e) {
            $('.progress-bar').css('width', '90%');
            var data = JSON.parse(e.data);
            $('.progress-bar').css('width', '100%');
            $('.currently').html('Done!');
            $('#myModal').modal('hide');
            $('.buynow').attr('data-cp-url', data.url).click();
        }
    });
    $('.progress-bar').css('width', '70%');
};

function clearMap() {
    for (i in map._layers) {
        if (map._layers[i]._tiles !== undefined) {
            map.removeLayer(map._layers[i]);
        }
    }
}

$('.width').change(function () {
    if ($('.map-style.line').hasClass('circle')) {
        console.log('git')
        geoGroup.eachLayer(function (layer) {
            console.log(layer.getRadius())
            layer.setRadius(($('.width').val() / 10) * layer.getRadius());
        });
    } else {
        geoGroup.eachLayer(function (layer) {
            layer.setStyle({
                weight: $('.width').val()
            });
        });
    }
});

$('.opacity').change(function () {
    $('.leaflet-marker-icon').css('opacity', $('.opacity').val() / 100);
    geoGroup.eachLayer(function (layer) {
        layer.setStyle({
            opacity: $('.opacity').val() / 100
        });
        layer.setStyle({
            fillOpacity: $('.opacity').val() / 100
        });
    });
});

$('.btn-4sq').click(function () {
    geoGroup.clearLayers(map);
    addItems('icon')
});

$('.btn-circle').click(function () {
    geoGroup.clearLayers(map);
    addItems('circle');
});

$('.btn-marker').click(function () {
    geoGroup.clearLayers(map);
    addItems('marker')
});

$('.map-style.map li').click(function (e) {
    var layer = $(this).attr('class');
    clearMap();
    L.mapbox.tileLayer(layer, {
        detectRetina: true
    }).addTo(map);
});

// printing
(function (d, s, id) {
    var js, cpJs = d.getElementsByTagName(s)[0],
        t = new Date();
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.setAttribute('data-cp-url', 'https://store.canvaspop.com');
    js.src = 'https://store.canvaspop.com/static/js/cpopstore.js?bust=' + t.getTime();
    cpJs.parentNode.insertBefore(js, cpJs);
}(document, 'script', 'canvaspop-jssdk'));