'use strict';

var fs         = require('mz/fs')
  , childProc  = require('mz/child_process')
  , co         = require('co')
  , koa        = require('koa')
  , request    = require('co-request')


var getNote = function* (noteString){
  var result = yield request('http://ks-xml:5000/xml/' + noteString)
  var xml = result.body

  // write to an xml file
  var baseFilename = '/tmp/ks-' + Math.floor(Math.random()* 4294967296)
  var xmlFn = baseFilename + '.xml'
  var pngFn = baseFilename + '.png'
  yield fs.writeFile(xmlFn, xml)

  // send to mscore
  var command = 'xvfb-run mscore '+xmlFn+' -o '+pngFn+' -T 0 -r 600'
  var mscoreOutput = yield childProc.exec(command)

  return mscoreOutput
}


var app = koa()
app.use(function *(){
  this.body = yield readFile('package.json')
})

co(getNote('E-7')).then(function(res){
  console.log('GOT RESULT:', res)
}, function(err){
  console.log('GOT ERROR: ', err.stack)
})


app.listen(3000)
