require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const shortId = require('shortid');
const app = express();

const bodyParser = require('body-parser')
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });


const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String,
})
const URL_LIBRARY = mongoose.model('URL_LIBRARY', urlSchema);

const vistShortUrlHandler = (req, res) => {
  const shortUrl = req.params.short_url
  URL_LIBRARY.findOne({
    short_url: shortUrl
  }, function (err, data) {
    if (err) return console.error(err);
    if (data) {
      res.redirect(data.original_url)
      return;
    }
  })
}

const createShortUrlHandler = (req, res) => {
  const userEnteredUrl = req.body.url
  const shortUrl = shortId.generate()
  const urlObj = new URL(userEnteredUrl)

  if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
    return res.json({ 'error': 'invalid url' })
  } else {
    dns.lookup(urlObj.hostname, (err, address, family) => {
      if (!err) {
        URL_LIBRARY.findOne({ original_url: userEnteredUrl }, (error, data) => {
          if (!error) {
            if (data) {
              res.json({
                original_url: data.original_url,
                short_url: data.short_url
              })
              return
            } else {
              const newUrl = new URL_LIBRARY({
                original_url: userEnteredUrl,
                short_url: shortUrl
              })
              newUrl.save(function (err, data) {
                if (err) return console.error(err)
                res.json({
                  original_url: data.original_url,
                  short_url: data.short_url
                })
              })
            }
          }
        })
      }
    })
  }
}

app.route('/api/shorturl/:short_url?').get(vistShortUrlHandler).post(createShortUrlHandler)

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
