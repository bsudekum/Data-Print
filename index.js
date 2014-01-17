var express = require('express');
var _ = require('underscore');
var fs = require('fs');
var request = require('request');
var templates = require('./lib/templates');
var app = express();
var knox = require('knox');
var client = knox.createClient({
  key: process.env.AMAZONKEY,
  secret: process.env.AMAZONSECRET,
  bucket: process.env.AMAZONBUCKET
});
var foursquareConfig = {
  secrets : {
    'clientId' : process.env.FOURSQUARECLIENT,
    'clientSecret' : process.env.FOURSQUARESECRET,
    'redirectUrl' : 'http://localhost:5000/4sq-redirect'
  }
}
var foursquare = require('node-4sq')(foursquareConfig);

app.use(express.static('assets'));
app.use(express.cookieParser());
app.use(express.session({ secret: 'joanie' }));
app.use(express.bodyParser({limit: '50mb'}));

// Prompt user to authenticate with Strava.
app.get('/', function(req, res) {
  // res.send(templates['Home']({ url: 'http://localhost:5000' }));
  res.send(templates['Home']({ url: 'http://powerful-spire-4042.herokuapp.com/' }));
});

// Do Strava token exchange, and return a page of activities
app.get('/activities', function(req, res) {
  console.log(req.query)
  request.post({
    url: 'https://www.strava.com/oauth/token',
    form: {
      client_id: process.env.STRAVACLIENT,
      client_secret: process.env.STRAVASECRET,
      code: req.query.code
    }
  }, function(err, resp) {
    if (err) res.send(500);

    try {
      var tok = JSON.parse(resp.body);
      req.session.token = tok.access_token;
      console.log(tok)
      console.log(req.session)
    } catch (err) {
      res.send(500);
    }

    var acts
    getActivities({ token: req.session.token }, function(err, acts) {
      app.get('/data', function(req, res) {
        res.json(acts)
      });
      res.send(templates['Activities']({ activitie: JSON.stringify(acts) })); 
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
  }, function(err, resp) {
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
  }, function(err, resp) {
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

app.get('/4sq-login', function(req, res) {
  res.writeHead(303, { 'location': foursquare.getAuthClientRedirectUrl() });
  res.end();
});

app.get('/4sq-redirect', function (req, res) {
  foursquare.getAccessToken({
    code: req.query.code
  }, function (err, accessToken) {
    if(err) {
      res.send('An error was thrown: ' + err.message);
    }
    else {
      var allData = [];
      var limitOffset = 0;

      function requestMult(offset) {
        request.get({
          url: 'https://api.foursquare.com/v2/users/self/checkins?oauth_token=' + accessToken + '&v=20140104&offset=' + offset + '&limit=50',
        }, function(err, resp) {
          if (err) console.log('error: ' + err)

          try {
            allData.push(resp.body)
            var c = JSON.parse(resp.body);

            if(c.meta.code == 401) {
              res.redirect('/');
              res.end();
            }

            // res.send(templates['Activities']({ activitie: JSON.stringify(allData) }));

            if(limitOffset <= c.response.checkins.count || limitOffset <= 249) {
              requestMult(limitOffset+=250)  
            }else{
              res.send(templates['Activities']({ activitie: JSON.stringify(allData) }));
            }

          } catch (err) {
            console.log(err)
          }
        });
      }//requestMult
      requestMult(0);
    }
  });
});

app.post('/image', function(req,res){
  res.contentType('json');
  var stringImage = req.body.image;
  var string = new Buffer(stringImage.replace(/^data:image\/\w+;base64,/, ''),'base64');
  var buf = string;

  var opts = client.put('img' + parseInt((Math.random() * 10000000) + 1) + '.png', {
    'Content-Length': buf.length,
    'Content-Type':'image/png',
    'x-amz-acl': 'public-read'
  });

  opts.on('response', function(resOpts){
   if (200 == resOpts.statusCode) {
    res.send({ data: JSON.stringify({url:opts.url}) });
   }
  });

  opts.end(buf)
});


var port = process.env.PORT || 5000;
app.listen(port);
console.log('Listening on port: ' + port);