// sock is a Socket object, 
// sock.io is a Manager object which represents the connection
// to the socket.io server. 
window.sock = io();


// Connect, and then join the room in the pathname /score/room
console.log('Attempting to connect to the socket server');
sock.connect();
sock.on('connect', function(){

  // By Default, this will be called again if the connection is
  // interrupted (for example if the server crashes)
  console.log('Connection established!');

  // ['', 'score', 'abc'] <= '/score/abc'
  var pathParts = window.location.pathname.split('/');
  sock.emit('join', pathParts[2]);
});


// Let the server tell us when to push a new image
sock.on('img', function(url){
  if (scoreStack) scoreStack.push(url);
});

window.onload = function(){
  window.scoreStack = new KS.Stack(5);
};
