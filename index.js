// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const express = require('express');

const app = express();
const path = require('path')
var SOCKET_LIST = {};
var PLAYER_LIST = {};
var shouldSendEmail = true;
var shouldSendEmail2 = true;

const PORT = process.env.PORT || 5000
var latestDistance = "Not Available"
var latestDistance2 = "Not Available"



app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, '')))

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/', (req, res) => res.render('pages/index'))
app.get('/chart', (req, res) => res.render('pages/index2'))


// [START hello_world]
// Say hello!

var nodemailer = require("nodemailer");
var smtpTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "sanitarycampus490@gmail.com",
    pass: "sancam490"
  }
});

function sendEmail(paperid){
  var mailOptions = {
    from: "Sanitary Campus <sanitarycampus490@gmail.com>", // sender address
    to: "sanitarycampus490@gmail.com", // list of receivers
    subject: "Attention: Currently toilet paper no " +paperid+ " level is low.", // Subject line
    text: "Toilet paper level is low...", // plaintext body
    html: "<b>Toilet paper level is low...</b>" // html body
  }
  smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
        console.log(error);
    }else{
        console.log("Message sent: " + response.message);
    }
  });
}
function sendEmailFilled(paperid){
  var mailOptions = {
    from: "Sanitary Campus <sanitarycampus490@gmail.com>", // sender address
    to: "sanitarycampus490@gmail.com", // list of receivers
    subject: "Attention: Currently toilet paper no " +paperid+ " is ### FILLED ###", // Subject line
    text: "Toilet paper is renewed", // plaintext body
    html: "<b>Toilet paper is renewed</b>" // html body
  }
  smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
        console.log(error);
    }else{
        console.log("Message sent: " + response.message);
    }
  });
}

app.get('/measurement', (req, res) => {
  console.log("Res: "+ JSON.stringify(req.query))
  latestDistance = req.query.distance
  latestDistance2  =  req.query.distance2

  if(latestDistance > 10 && shouldSendEmail){
    sendEmail(1);
    shouldSendEmail = false;
  }else if(latestDistance <= 5){
    if(!shouldSendEmail){
      sendEmailFilled(1);
    }
    shouldSendEmail = true;
  }

  if(latestDistance2 > 10 && shouldSendEmail2){
    sendEmail(2);
    shouldSendEmail2 = false;
  }else if(latestDistance2 <= 5){
    if(!shouldSendEmail2){
      sendEmailFilled(2);
    }
    shouldSendEmail2 = true;
  }

  for(var i in SOCKET_LIST) {
    var socket = SOCKET_LIST[i];
    socket.emit('distance', {"distance": latestDistance, "distance2": latestDistance2}); 
  }
  res.status(200).send('Internet of toilets!');
});

var serv = require("http").Server(app);
serv.listen(PORT, () => console.log(`Listening on ${ PORT }`))
var io = require("socket.io")(serv,{});
io.sockets.on('connection', function(socket){
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
    socket.emit('distance', {"distance": latestDistance, "distance2": latestDistance2}); 
    socket.on('disconnect', function(){
        delete SOCKET_LIST[socket.id];
    });
});

module.exports = app;
