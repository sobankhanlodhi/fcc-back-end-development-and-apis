// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/api/:date?', (req, res) => {
  const dateStringFromParams = req.params.date
  if (!dateStringFromParams) {
    res.json({
      unix: new Date().valueOf(),
      utc: new Date().toUTCString()
    })
  } else {
    if (/\d{5,}/.test(dateStringFromParams)) {
      res.json({
        unix: parseInt(dateStringFromParams),
        utc: new Date(parseInt(dateStringFromParams)).toUTCString()
      })
    } else {
      if (new Date(dateStringFromParams).toString() === "Invalid Date") {
        res.json({
          error: "Invalid Date"
        })
      } else {
        res.json({
          unix: new Date(dateStringFromParams).valueOf(),
          utc: new Date(dateStringFromParams).toUTCString()
        })
      }
    }
  }
})

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({ greeting: 'hello API' });
});



// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
