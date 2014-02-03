/*
 (c) 2014, Vladimir Agafonkin
 simpleheat, a tiny JavaScript library for drawing heatmaps with Canvas
 https://github.com/mourner/simpleheat
*/
! function () {
    "use strict";

    function t(a) {
        return this instanceof t ? (this._canvas = a = "string" == typeof a ? document.getElementById(a) : a, this._ctx = a.getContext("2d"), this._width = a.width, this._height = a.height, this._max = 1, void this.clear()) : new t(a)
    }
    t.prototype = {
        defaultRadius: 25,
        defaultGradient: {.4: "blue",
            .6: "cyan",
            .7: "lime",
            .8: "yellow",
            1: "red"
        },
        data: function (t) {
            return this._data = t, this
        },
        max: function (t) {
            return this._max = t, this
        },
        add: function (t) {
            return this._data.push(t), this
        },
        clear: function () {
            return this._data = [], this
        },
        radius: function (t, a) {
            a = a || 15;
            var i = this._circle = document.createElement("canvas"),
                e = i.getContext("2d"),
                s = this._r = t + a;
            return i.width = i.height = 2 * s, e.shadowOffsetX = e.shadowOffsetY = 200, e.shadowBlur = a, e.shadowColor = "black", e.beginPath(), e.arc(s - 200, s - 200, t, 0, 2 * Math.PI, !0), e.closePath(), e.fill(), this
        },
        gradient: function (t) {
            var a = document.createElement("canvas"),
                i = a.getContext("2d"),
                e = i.createLinearGradient(0, 0, 0, 256);
            a.width = 1, a.height = 256;
            for (var s in t) e.addColorStop(s, t[s]);
            return i.fillStyle = e, i.fillRect(0, 0, 1, 256), this._grad = i.getImageData(0, 0, 1, 256).data, this
        },
        draw: function (t) {
            this._circle || this.radius(this.defaultRadius), this._grad || this.gradient(this.defaultGradient);
            var a = this._ctx;
            a.clearRect(0, 0, this._width, this._height);
            for (var i, e = 0, s = this._data.length; s > e; e++) i = this._data[e], a.globalAlpha = Math.max(i[2] / this._max, t || .05), a.drawImage(this._circle, i[0] - this._r, i[1] - this._r);
            var n = a.getImageData(0, 0, this._width, this._height);
            return this._colorize(n.data, this._grad), a.putImageData(n, 0, 0), this
        },
        _colorize: function (t, a) {
            for (var i, e = 3, s = t.length; s > e; e += 4) i = 4 * t[e], i && (t[e - 3] = a[i], t[e - 2] = a[i + 1], t[e - 1] = a[i + 2])
        }
    }, window.simpleheat = t
}(),
/*
 (c) 2014, Vladimir Agafonkin
 Leaflet.heat, a tiny and fast heatmap plugin for Leaflet.
 https://github.com/Leaflet/Leaflet.heat
*/
L.HeatLayer = L.Class.extend({
    options: {},
    initialize: function (t, a) {
        this._latlngs = t, L.setOptions(this, a)
    },
    onAdd: function (t) {
        this._map = t, this._canvas || this._initCanvas(), t._panes.overlayPane.appendChild(this._canvas), t.on("moveend", this._reset, this), t.options.zoomAnimation && L.Browser.any3d && t.on("zoomanim", this._animateZoom, this), this._reset()
    },
    onRemove: function (t) {
        t.getPanes().overlayPane.removeChild(this._canvas), t.off("moveend", this._reset, this), t.options.zoomAnimation && t.off("zoomanim", this._animateZoom, this)
    },
    addTo: function (t) {
        return t.addLayer(this), this
    },
    _initCanvas: function () {
        var t = this._canvas = L.DomUtil.create("canvas", "leaflet-heatmap-layer"),
            a = this._map.getSize();
        t.width = a.x, t.height = a.y;
        var i = this._map.options.zoomAnimation && L.Browser.any3d;
        L.DomUtil.addClass(t, "leaflet-zoom-" + (i ? "animated" : "hide")), this._heat = simpleheat(t), this._heat.radius(this.options.radius || this._heat.defaultRadius, this.options.blur)
    },
    _reset: function () {
        var t = this._map.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(this._canvas, t);
        var a = this._map.getSize();
        this._heat._width !== a.x && (this._canvas.width = this._heat._width = a.x), this._heat._height !== a.y && (this._canvas.height = this._heat._height = a.y), this._redraw()
    },
    _redraw: function () {
        var t, a, i, e, s, n, h, o, r = [],
            d = this._heat._r,
            _ = this._map.getSize(),
            l = new L.LatLngBounds(this._map.containerPointToLatLng(L.point([-d, -d])), this._map.containerPointToLatLng(_.add([d, d]))),
            m = void 0 === this.options.maxZoom ? this._map.getMaxZoom() : this.options.maxZoom,
            c = 1 / Math.pow(2, Math.max(0, Math.min(m - this._map.getZoom(), 12))),
            u = d / 2,
            g = [],
            f = this._map._getMapPanePos(),
            p = f.x % u,
            v = f.y % u;
        for (t = 0, a = this._latlngs.length; a > t; t++) l.contains(this._latlngs[t]) && (i = this._map.latLngToContainerPoint(this._latlngs[t]), s = Math.floor((i.x - p) / u) + 2, n = Math.floor((i.y - v) / u) + 2, g[n] = g[n] || [], e = g[n][s], e ? (e[0] = (e[0] * e[2] + i.x * c) / (e[2] + c), e[1] = (e[1] * e[2] + i.y * c) / (e[2] + c), e[2] += c) : g[n][s] = [i.x, i.y, c]);
        for (t = 0, a = g.length; a > t; t++)
            if (g[t])
                for (h = 0, o = g[t].length; o > h; h++) e = g[t][h], e && r.push([Math.round(e[0]), Math.round(e[1]), Math.min(e[2], 1)]);
        this._heat.data(r).draw()
    },
    _animateZoom: function (t) {
        var a = this._map.getZoomScale(t.zoom),
            i = this._map._getCenterOffset(t.center)._multiplyBy(-a).subtract(this._map._getMapPanePos());
        this._canvas.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(i) + " scale(" + a + ")"
    }
}), L.heatLayer = function (t, a) {
    return new L.HeatLayer(t, a)
};
