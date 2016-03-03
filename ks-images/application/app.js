'use strict';

var fs        = require('mz/fs')
  , path      = require('path')
  , childProc = require('mz/child_process')
  , co        = require('co')
  , request   = require('co-request')
  , koa       = require('koa.io')
  , mount     = require('koa-mount')
  , koaStatic = require('koa-static')

var connections = require('./src/connections.js')

var xResponseTime = function* (next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
  this.set('X-Response-Time', ms + 'ms');
}


var app = koa()

// koa middleware
app.use(xResponseTime)
app.use(koaStatic(path.join(__dirname, 'static'), {defer: true}))
app.use(mount('/img', koaStatic(path.join(__dirname, 'xml'))))

// koa io socket implementation
connections(app)

app.listen(3000)
