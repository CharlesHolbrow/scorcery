window.KS = {}

KS.Image = function(el){
  this.el = el
  el.onload = function(){
    el.loaded = true
    el.setAttribute('loaded', 'true')
  }
  el.onerror = function(){
    el.removeAttribute('loaded')
    el.loaded = false
  }
}

KS.Image.prototype = {
  src:function(target){
    if (typeof target !== 'string'){
      return this.el.src;
    } else if (target === this.el.src) {
      return;
    } else {
      this.loaded = false
      this.el.src = target
    }
  },
  opacity: function(amt, duration){
    duration = Math.floor(duration || 0)
    this.el.style.transition = 'opacity '+ duration+'ms ease-in-out'
    this.el.style.opacity = amt
  }
}

KS.ImageStack = function(size){
  this.size = size
  this.images = []
  this.currentIndex = 0
  for (var i = 0; i < size; i++){
    var imgEl = document.getElementById('ks-layer-' + i)
    if (!imgEl) throw new Error('could not find images')
    this.images.push(new KS.Image(imgEl))
  }
}
KS.ImageStack.prototype = {
  push: function(target){
    var oldImage = this.images[this.currentIndex]
    this.currentIndex = (this.currentIndex + 1) % this.size
    var newImage = this.images[this.currentIndex]
    newImage.opacity(0, 0)
    newImage.src(target)
    newImage.el.onload = function(){
      if (oldImage){
        oldImage.opacity(0, 450)
        oldImage.onload = null
      }
      newImage.opacity(1, 300)
    }
  }
}
