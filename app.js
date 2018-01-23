const http         = require('http');
const fs           = require('fs');
const path         = require('path');
const storage      = require('node-persist');
const request      = require('request');
const contentTypes = require('./utils/content-types');
const sysInfo      = require('./utils/sys-info');
const util         = require('util');
const express      = require('express');
var   env          = process.env;
var app = express();


app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 80);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');

http.createServer(app).listen(app.get('port'), app.get('ip'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

app.get('/fvp', function (req, res) {
  res.send('Hello Frank!');
});

app.get('/persist', function (req, res) {
  console.log('Persisting...');
  var sid = req.query.sid;
  console.log('sid=',sid);
  var name  = req.query.name;
  console.log('name=',name);
  var value = req.query.value; 			// Value (of name-value-pair)
  console.log('value=',value);
  //var yep = decodeURIComponent(escape(req.param('yep').replace(/(\r\n|\n|\r|\'|\")/gm," ").replace(/^\s+|\s+$/g,'')));

  storage.init( { dir:'NameValuePairs' } ).then(function() {
    //then start using it
    storage.setItem(name, value)
    .then(function() {
  
      return storage.getItem(name)
    })
    .then(function(fvalue) {

      console.log(fvalue);
    })
  });

  console.log('Persisted.');
  res.send('Done');
});

app.get('/retrieve', function (req, res) {
  console.log('Retrieving...');
  var sid = req.query.sid;
  console.log('sid=',sid);
  var name  = req.query.name;
  console.log('name=',name);
  //you must first call storage.initSync
  storage.initSync({ dir:'NameValuePairs' });
  //then start using it
  var value = storage.getItemSync(name);
  console.log('Retrieved value=',value);
  console.log('Retrieved.');
  res.send({ value:value });
});

app.get('/health', function (req, res) {
  res.writeHead(200);
  res.end();
});

app.get('/', function (req, res) {
  res.send('Hello World!');
});

// OLD ORIGINAL OPENSHIFT TEMPLATE
//let server = http.createServer(function (req, res) {
//  let url = req.url;
//  if (url == '/') {
//    url += 'static/index.html';
//  }
//
//  // IMPORTANT: Your application HAS to respond to GET /health with status 200
//  //            for OpenShift health monitoring
//
//  if (url == '/persist') {
//    res.writeHead(200);
//    res.end('Life is good.');
//  } else if (url == '/health') {
//    res.writeHead(200);
//    console.log("Port: "+env.NODE_PORT || 3000);
//    res.end();
//  } else if (url == '/info/gen' || url == '/info/poll') {
//    res.setHeader('Content-Type', 'application/json');
//    res.setHeader('Cache-Control', 'no-cache, no-store');
//    res.end(JSON.stringify(sysInfo[url.slice(6)]()));
//  } else {
//    fs.readFile('./static' + url, function (err, data) {
//      if (err) {
//        res.writeHead(404);
//        res.end('Not found');
//      } else {
//        let ext = path.extname(url).slice(1);
//        res.setHeader('Content-Type', contentTypes[ext]);
//        if (ext === 'html') {
//          res.setHeader('Cache-Control', 'no-cache, no-store');
//        }
//        res.end(data);
//      }
//    });
//  }
//});
//
//server.listen(env.NODE_PORT || 3000, env.NODE_IP || 'localhost', function () {
//  console.log(`FvP Application worker ${process.pid} started...`);
//});
