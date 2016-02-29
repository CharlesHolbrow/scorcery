// Create Socket
window.sock = io()

window.imgNames = [
  'ks-1000790245-1.png',
  'ks-101775575-1.png',
  'ks-1127749718-1.png',
  'ks-1186421520-1.png',
  'ks-1199218906-1.png',
  'ks-1269027638-1.png',
  'ks-1340744642-1.png',
  'ks-1343640823-1.png',
  'ks-1421785907-1.png',
  'ks-1472867811-1.png',
  'ks-1515190812-1.png',
  'ks-1565942754-1.png',
  'ks-160804259-1.png',
  'ks-1609999117-1.png',
  'ks-1632278209-1.png'
]


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
console.log('pathname:', window.location.pathname)

window.imgNameIndex = -1
window.onload = function(){
  window.imageStack = new KS.ImageStack(5)

  setInterval(function(){
    imgNameIndex = (imgNameIndex + 1) % imgNames.length
    var imgSrc = '/img/' + imgNames[imgNameIndex]
    imageStack.push(imgSrc)
  }, 1500)
}