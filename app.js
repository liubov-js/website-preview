const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const app = express();

app.use(bodyParser.json());

app.post('/preview', async (req, res) => {
  const URL = req.body.URL;
  const linkRegExp = /^https?:\/\/[a-z\.\-]+/;
  const addressArr = URL.match(linkRegExp);

  if (!addressArr) {
    res.json({
      "error": "incorrect URL",
    });
    return;
  }

  const response = await axios.get(URL);
  const $ = cheerio.load(response.data);

  let websiteTitle;
  let websiteDescription;
  let websiteImage;

  const ogTitle = $('meta[property="og:title"]').attr('content');
  const ogDescription = $('meta[property="og:description"]').attr('content');
  const ogImage = $('meta[property="og:image"]').attr('content');
  const twitterTitle = $('meta[name="twitter:title"]').attr('content');
  const twitterDescription = $('meta[name="twitter:description"]').attr('content');
  const twitterImage = $('meta[name="twitter:image"]').attr('content');
  const htmlTitle = $('title').text();
  const htmlDescription = $('p').text();
  const address = addressArr[0];
  const htmlImage = address + $('body img').attr('src');
  
  if (ogTitle) {
    websiteTitle = ogTitle;
    websiteDescription = ogDescription;
    websiteImage = ogImage;
  } else if (twitterTitle) {
    websiteTitle = twitterTitle;
    websiteDescription = twitterDescription;
    websiteImage = twitterImage
  } else {
    websiteTitle = htmlTitle;
    websiteDescription = htmlDescription;
    websiteImage = htmlImage;
  }

  res.json({
    "title": websiteTitle,
    "description": websiteDescription,
    "image": websiteImage,
  })
});

app.get('/', async (req, res) => {
  res.set('Content-Type', 'text/html');
  res.send(Buffer.from(fs.readFileSync('index.html')));
})

app.listen(3001);