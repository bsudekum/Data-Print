var express = require('express');
var app = express();
var _ = require('underscore');
var fs = require('fs');
var im = require('simple-imagemagick');
var imm = require('imagemagick');
var request = require('request');
var templates = require('./lib/templates');
var knox = require('knox');
var production = 'http://www.dataprint.me';
var test = 'http://localhost:5000';
var client = knox.createClient({
    key: process.env.AMAZONKEY,
    secret: process.env.AMAZONSECRET,
    bucket: process.env.AMAZONBUCKET
});
var foursquareConfig = {
    secrets: {
        'clientId': process.env.FOURSQUARECLIENT,
        'clientSecret': process.env.FOURSQUARESECRET,
        'redirectUrl': production + '/4sq-redirect'
    }
}
var foursquare = require('node-4sq')(foursquareConfig);
var twitterAPI = require('node-twitter-api');
var twitter = new twitterAPI({
    consumerKey: 'j0ql7JquXhsBhJ4RuILFw',
    consumerSecret: 'tsKk0apu7niFkm51e8xZBiFyfcllZLmcKe6Q7rl6Ei0',
    callback: 'http://127.0.0.1:5000/twitter'
});

app.use(express.static('assets'));
app.use(express.cookieParser());
app.use(express.bodyParser({
    limit: '50mb'
}));

// Prompt user to authenticate with Strava.
app.get('/', function (req, res) {
    res.send(templates['Home']({
        url: test
    }));
});

app.get('/twitter-login', function (req, res) {
    twitter.getRequestToken(function (error, requestToken, requestTokenSecret, results) {
        if (error) {
            console.log("Error getting OAuth request token : " + error);
        } else {
            res.redirect('https://twitter.com/oauth/authenticate?oauth_token=' + requestToken);

            app.get('/twitter', function (req, res) {
                twitter.getAccessToken(requestToken, req.query.oauth_token, req.query.oauth_verifier, function (error, accessToken, accessTokenSecret, results) {

                    if (error) {
                        if (error.statusCode == 401) {
                            console.log(JSON.stringify(error))
                            res.redirect('/');
                        }
                    } else {
                        twitter.verifyCredentials(accessToken, accessTokenSecret, function (error, dataUser, response) {
                            if (error) {
                                console.log(JSON.stringify(error))
                            } else {

                                var tweets = [];
                                var add = 1;
                                var user = dataUser['screen_name'];

                                function repeat(pageNumber) {
                                    twitter.getTimeline('user_timeline', {
                                            screen_name: user,
                                            count: 200,
                                            page: pageNumber
                                        },
                                        accessToken,
                                        accessTokenSecret,
                                        function (error, dataTweets, response) {
                                            if (error) {
                                                console.log(JSON.stringify(error))
                                            } else {
                                                if (dataTweets.length == 0) {
                                                    res.send(templates['Activities']({
                                                        type: 'twitter',
                                                        activitie: JSON.stringify(tweets),
                                                        user: JSON.stringify(0)
                                                    }));
                                                } else {
                                                    tweets.push(dataTweets)
                                                    console.log(add)
                                                    repeat(add++)
                                                }
                                            }
                                        }
                                    );
                                }
                                repeat(add)
                            }
                        });
                    }
                });
            });
        }
    });
})

// Do Strava token exchange, and return a page of activities
app.get('/activities', function (req, res) {
    request.post({
        url: 'https://www.strava.com/oauth/token',
        form: {
            client_id: process.env.STRAVACLIENT,
            client_secret: process.env.STRAVASECRET,
            code: req.query.code
        }
    }, function (err, resp) {
        if (err) res.send(500);

        try {
            var tok = JSON.parse(resp.body);
            console.log(tok)
            var athleteInfo = tok.athlete;
        } catch (err) {
            res.send(500);
        }

        var acts;
        getActivities({
            token: tok.access_token
        }, function (err, acts) {
            console.log(acts)
            res.send(templates['Activities']({
                type: 'strava',
                activitie: JSON.stringify(acts),
                user: JSON.stringify(athleteInfo)
            }));
        });

    });
});

// Get some activities

function getActivities(opts, callback) {
    var page = opts.page || 1;
    request.get({
        url: 'https://www.strava.com/api/v3/athlete/activities?per_page=100&page=' + page,
        headers: {
            'Authorization': 'access_token ' + opts.token
        }
    }, function (err, resp) {
        if (err) return callback(err);

        try {
            var activities = JSON.parse(resp.body);
        } catch (err) {
            return callback(err);
        }
        callback(null, activities);
    });
}

function getActivityItems(opts, callback) {
    request.get({
        url: 'https://www.strava.com/api/v3/activities/' + opts.id + '/streams/' + opts.type,
        headers: {
            'Authorization': 'access_token ' + opts.token
        }
    }, function (err, resp) {
        if (err) return callback(err);

        // parse the activity
        try {
            var stream = resp.body;
        } catch (err) {
            return callback(err);
        }

        callback(null, stream);
    });
}

app.get('/4sq-login', function (req, res) {
    res.writeHead(303, {
        'location': foursquare.getAuthClientRedirectUrl()
    });
    res.end();
});

app.get('/4sq-redirect', function (req, res) {
    foursquare.getAccessToken({
        code: req.query.code
    }, function (err, accessToken) {
        if (err) {
            res.send('An error was thrown: ' + err.message);
        } else {
            var allData = [];
            var limitOffset = 0;

            function requestMult(offset) {
                request.get({
                    url: 'https://api.foursquare.com/v2/users/self/checkins?oauth_token=' + accessToken + '&v=20140104&offset=' + offset + '&limit=50',
                }, function (err, resp) {
                    if (err) console.log('error: ' + err)

                    try {
                        var c = JSON.parse(resp.body);
                        if (c.meta.code == 401) {
                            res.redirect('/');
                            res.end();
                        }

                        allData.push(JSON.stringify(resp.body))

                        // res.send(templates['Activities']({
                        //     type: 'foursquare',
                        //     activitie: JSON.stringify(allData),
                        //     user: JSON.stringify(0)
                        // }));

                        if (limitOffset <= c.response.checkins.count || limitOffset <= 249) {
                            requestMult(limitOffset += 250)
                        } else {
                            res.send(templates['Activities']({
                                type: 'foursquare',
                                activitie: JSON.stringify(allData),
                                user: JSON.stringify(0)
                            }));
                        }

                    } catch (err) {
                        console.log(err)
                    }
                });
            } //requestMult
            requestMult(0);
        }
    });
});

app.post('/image', function (req, res) {
    res.contentType('json');
    var stringImage = req.body.image;
    var string = new Buffer(stringImage.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    fs.writeFileSync('out.jpg', string, 'binary');

    im.composite([
        '-compose', 'Multiply',
        '-gravity', 'SouthEast',
        'logo.png',
        'out.jpg',
        'outputimage.jpg'
    ], function (err, stdout) {
        if (err) throw err

        var file = fs.readFileSync('outputimage.jpg', 'binary');
        var opts = client.put('img' + parseInt((Math.random() * 10000000) + 1) + '.png', {
            'Content-Length': file.length,
            'Content-Type': 'image/png',
            'x-amz-acl': 'public-read'
        });

        opts.on('response', function (resOpts) {
            if (200 == resOpts.statusCode) {
                res.send({
                    data: JSON.stringify({
                        url: opts.url
                    })
                });
            }
        });

        opts.end(new Buffer(file, 'binary'));

    });
});


var port = process.env.PORT || 5000;
app.listen(port);
console.log('Listening on port: ' + port);
