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

sock.on('transport', function(commandName, options){
  var firstLetter = commandName[0];
  var rest        = commandName.slice(1)
  var methodName  = 'ks' + firstLetter.toUpperCase() + rest
  if (!ksMidi[methodName]){
    console.error('Method does not exist: '+methodName);
    return;
  }
  console.log('Transport: '+methodName)
  ksMidi[methodName](options);
})

window.onload = function(){
  window.scoreStack = new KS.Stack(5);

  // This should depend on the song. Hard coding the song cycle is a bug, and could be hard to fix later on.
  // (TODO: TODO fix sloppy bug)
  ksMidi._on16th = function(beat){
    if (beat % 14 !== 0) return;
    var loopPoint  = beat / 14;
    var imageIndex = loopPoint + (ksMidi._zeroOffset || 0);
    var imagePrefix = ksMidi._imagePrefix || '';
    var imageName = imagePrefix + imageIndex + '.svg';
    var fullImageName = '/score-img/' + imageName;
    scoreStack.push(fullImageName);
  }

};
