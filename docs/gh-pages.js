var ghpages = require('gh-pages');
var path = require('path');

ghpages.publish(path.join(__dirname, '../assets'), function (err) {
  console.log(err);
});
