'use strict';

var fs    = require('fs')
  , path  = require('path')

var users     = {}
  , userCount = 0
  , a
  , rooms = {
      a: {}
    , b: {}
    , c: {}
  }

// temporary tools for testing image pushing
var filenames = []
var randomPngPath = ()=>{
  var fn = filenames[Math.floor(Math.random() * filenames.length)]
  return '/img/' + fn
}
for (let filename of fs.readdirSync(path.join(__dirname, '../xml'))){
  if (filename.endsWith('.png')) filenames.push(filename)
}


module.exports.init = function(koaIoApp){
  // app.io is the object returned by require('socket.io')()
  koaIoApp.io.use(socketHandler)
  setInterval(()=>{
    koaIoApp.io.to('a').emit('img', randomPngPath())
  }, 1000)
}


// koa.io middleware handler
var socketHandler = function*(next){

  var id = this.socket.id
  var socket = this.socket

  // update global state
  users[id] = this
  userCount += 1

  // allow the client to join existing rooms
  socket.on('join', function(roomName){
    if (!rooms[roomName]) return;
    rooms[roomName][id] = socket
    socket.join(roomName)
  })

  // log
  console.log('users connected:', userCount)
  console.log('users:', Object.keys(users))

  yield next

  // update global state
  userCount -= 1
  delete users[id]
}
