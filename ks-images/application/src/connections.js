'use strict';

var users = {}
var userCount = 0


// koa.io middleware handles 
module.exports = function*(next){

  var id = this.socket.id

  // update global state
  users[id] = this
  userCount += 1
  var requestHeaders = this.socket.request.headers

  // log
  console.log('users connected:', userCount)
  console.log('users:', Object.keys(users))

  yield next

  // update global state
  userCount -= 1
  delete users[id]
}