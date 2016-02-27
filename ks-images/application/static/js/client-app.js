// Create Socket
window.sock = io()

// sock is a Socket object, 
// sock.io is a Manager object which represents the connection
// to the socket.io server. 
sock.on('connect', function(){
  // By Default, this will be called again if the connection is
  // interrupted (for example if the server crashes)
  console.log('Connection established!')
})

console.log('Attempting to connect to the socker server')
sock.connect()
