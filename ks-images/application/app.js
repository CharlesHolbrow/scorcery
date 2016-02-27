'use strict';

var fs        = require('mz/fs')
  , path      = require('path')
  , childProc = require('mz/child_process')
  , co        = require('co')
  , request   = require('co-request')
  , koa       = require('koa.io')
  , router    = require('koa-router')
  , koaStatic = require('koa-static')

var connections = require('./src/connections.js')

var getNote = function*(noteString){
  // var noteString = 'g2'
  console.log('noteString:', noteString)
  var result = yield request('http://ks-xml:5000/xml/' + noteString)
  var xml = result.body

  // write to an xml file
  var baseFilename = './xml/ks-' + Math.floor(Math.random()* 4294967296)
  var xmlFn = baseFilename + '.xml'
  var pngFn = baseFilename + '.png'
  var fullPngFn = baseFilename + '-1.png'
  yield fs.writeFile(xmlFn, xml)

  // send to mscore
  var command = 'xvfb-run mscore '+xmlFn+' -o '+pngFn+' -T 0 -r 600'
  yield childProc.exec(command)

  // TODO: throw if the file doesn't exist

  return fullPngFn
}

var xResponseTime = function* (next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
  this.set('X-Response-Time', ms + 'ms');
}


var notes = 'abcdefg'.split('')
var noteImage = function*(next){

  var note = notes[Math.floor(Math.random() * notes.length)]
  var filename = yield *getNote(note +'4')

  console.log('req to:', this.path, ' --- sending:', filename)
  this.type = path.extname(filename)
  this.body = fs.createReadStream(filename)
}


var app = koa()
app.use(xResponseTime)
app.io.use(connections)
app.use(koaStatic(path.join(__dirname, 'static'), {defer: true}))
// app.use(function*(){this.body = 'ok '})
// app.use(noteImage)

app.listen(3000)
