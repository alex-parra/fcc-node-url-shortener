'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const bodyParser = require('body-parser');
const validUrl = require('valid-url');


const URLSchema = new mongoose.Schema({
  url: String
});

const URLModel = mongoose.model('Url', URLSchema);


var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGO_URI);


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});


app.post('/api/shorturl/new', (req, res) => {
  
  const { url } = req.body;
  if( !validUrl.isUri(url) ) {
    res.json({error: 'invalid URL'});
  }
  
  const newUrl = new URLModel({url});
  newUrl.save((err, data) => {
    res.json({
      original_url: url,
      short_url: data._id,
    });
  });

});

  
app.get('/api/shorturl/:urlId?', (req, res) => {
  const { urlId } = req.params;
  URLModel.findById(urlId, (err, data) => {
    if( err !== null ) return res.json({error: 'Short URL not found.'});
    
    res.redirect(data.url);
  });
});



app.listen(port, function () {
  console.log('Node.js listening ...');
});