'use strict';

const path      = require('path')
  , fs          = require('mz/fs')
  , Router      = require('koa-router')
  , imageGen    = require('./image-gen.js')
  , xmlStrToSvg = imageGen.xmlStrToSvg

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
    },
    updateRoomWithKsCommand: function(roomName, ksCommandName){
      if (!rooms[roomName]) throw new Error('room does not exist')
      app.io.to(roomName).emit('transport', ksCommandName)
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
  router.get('/score/:id/', function(){
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

    console.log('Attempting to create .svg...')
    const filename = yield* xmlStrToSvg(this.request.body)
    console.log('...Created .svg!')

    const path = '/' + filename
    methods.updateRoomWithImg(this.params.id, path)
    this.response.body = {path: path}
    this.response.status = 200
    return
  })

  // Create the image with the given filename, but do not push to the client;
  // this is a little sloppy, because the file will actually appear in score
  router.post('/create-svg/:name', function*(){
    if (this.request.get('content-type') !== 'text/xml'){
      this.status = 400
      this.body = {error: 'content-type must be text/xml'}
      return
    }
    if (!this.request.body || this.request.body === ''){
      this.status = 400
      this.body =  {error: 'no xml in body'}
      return
    }

    var legalPattern = /^[\w0-9]+$/
    if (!legalPattern.test(this.params.name)){
      this.status = 400
      this.body = {error: 'ilegal filename'}
      return
    }
    var name = this.params.name

    console.log('attempting to create:', name)
    const filename = yield* xmlStrToSvg(this.request.body, name)
    console.log(`${filename} created!!`)

    this.response.body = {path: '/' + filename}
    this.response.status = 200
    return
  })

  router.post('/transport/:id/:command', function(){
    console.log('transport command:', this.params)
    methods.updateRoomWithKsCommand(this.params.id, this.params.command)
    this.status = 200
    this.body = {}
    return
  })

  app.use(router.routes())
  return methods
}

module.exports = init
