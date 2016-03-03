'use strict';

const path      = require('path')
  , fs          = require('mz/fs')
  , Router      = require('koa-router')
  , imageGen    = require('./image-gen.js')
  , xmlStrToPng = imageGen.xmlStrToPng

const init = function(_app){

  const app     = _app
    , router    = new Router
    , users     = {}
    , rooms     = {a:true, b:true, c:true}

  var userCount = 0


  const methods = {
    addSocketToRoom: function(socket, roomName){
      if (!roomName) throw new Error('You must specify a roomName')
      if (!rooms[roomName]) throw new Error('no room exists with name: ' + roomName)
      socket.join(roomName)
    },
    updateRoomWithImg: function(roomName, imagePathname){
      if (!rooms[roomName]) throw new Error('room does not exist')
      app.io.to(roomName).emit('img', imagePathname)
    }
  }

  // socket.io middleware
  app.io.use(function*(next){
    var id = this.socket.id
    var socket = this.socket

    // update global state
    users[id] = this
    userCount += 1

    // allow the client to join existing rooms
    socket.on('join', function(roomName){
      methods.addSocketToRoom(socket, roomName)
    })

    console.log('users connected:', userCount)
    console.log('users:', Object.keys(users))

    yield next

    // update global state
    userCount -= 1
    delete users[id]
  })


  // app routes
  router.get('/score/:id/', function*(){
    var filename = './static/index.html'
    this.type = path.extname(filename)
    this.body = fs.createReadStream(filename)
  })

  router.post('/score/:id/', function*(){
    if (this.request.get('content-type') !== 'text/xml'){
      this.status = 400
      this.body = {error: 'content-type must be text/xml'}
      return
    }
    if (!rooms.hasOwnProperty(this.params.id)){
      this.status = 400
      this.body = {error: 'that score does not exist'}
      return
    }
    if (!this.request.body || this.request.body === ''){
      this.status = 400
      this.body =  {error: 'no xml in body'}
      return
    }

    console.log('Attempting to create .png...')
    const filename = yield* xmlStrToPng(this.request.body)
    console.log('...Created .png!')

    methods.updateRoomWithImg(this.params.id, '/'+filename)
    this.response.status = 200
    return
  })

  app.use(router.routes())
  return methods
}

module.exports = init
