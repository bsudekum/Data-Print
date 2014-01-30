var im = require('simple-imagemagick');
var imm = require('imagemagick');
var fs = require('fs');

var gm = require('gm');

gm("twitter.png").flop()

// function convertImage(image) {
    
//     imm.resize({
//         srcData: fs.readFileSync('strava.png', 'binary'),
//         width: 256
//     }, function (err, stdout, stderr) {
//         if (err) throw err
//         fs.writeFileSync('out.jpg', stdout, 'binary');
//         im.composite([
//             '-compose',
//             'Multiply',
//             '-gravity',
//             'SouthEast',
//             'logo.png',
//             'out.jpg',
//             fs.writeFileSync('out.jpg', stdout, 'binary');
//         ], function (err, stdout, other) {
//             if (err) console.log(err);
//             console.log(other);
//         });
//     });
// }

// convertImage('strava.png')
