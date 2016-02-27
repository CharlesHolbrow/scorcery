'use strict';

var users = {}
var userCount = 0


// koa.io middleware handles 
module.exports = function*(next){

  var id = this.socket.id
  users[id] = this
  userCount += 1
  console.log('request:', this.socket.request.headers)
  console.log('users connected:', userCount)
  console.log('users:', Object.keys(users))

  yield next

  userCount -= 1
  delete users[userId]
}