window.KS = {}


////////////////////////////////////////////////////////////////
//
// KS.Score
//
KS.Score = function(){
  this.div = document.createElement('div')
  this.div.className = 'ks-image'
}

KS.Score.prototype = {
  src:function(target, cb){
    var self = this;
    if (typeof target !== 'string'){
      return this._src;
    } else {
      this._src = target
      reqwest({
        url: target,
        success: function(doc){
          clearChildren(self.div)
          var svg = qwery('svg', doc)[0]
          self.svg = svg
          self.div.appendChild(svg)
          if (!svg) {return cb && cb(new Error('ajax ok, but response missing svg'))}
          cb && cb(null, doc)
        },
        error: function(err){cb && cb(err)}
      })
    }
  },
  opacity: function(amt, duration){
    duration = Math.floor(duration || 0)
    this.div.style.transition = 'opacity '+ duration+'ms'
    this.div.style.opacity = amt
  },
  getStaffOffset: function(){
    var svgGroups = qwery('g[stroke-linecap="butt"][transform]', this.div)
    var userCoordsOffset =  _.chain(svgGroups).filter(function(group){
      // Get only groups with exactly five elements. We hope
      // that these are staff elements.
      return (qwery('polyline', group).length === 5)
    }).filter(function(group){
      // Get only groups with a valid transform. MuseScore is
      // known to use this typeof of transform when outputting 
      // svg
      return group.transform.baseVal.getItem(0).type === SVGTransform.SVG_TRANSFORM_MATRIX
    }).map(function(group){
      var baseVal0 = group.transform.baseVal.getItem(0)
      return baseVal0.matrix.f // this is the y-translate value
    }).sort().first().value()

    // This makes the rather dangerout assumption that the
    // first group contains everything. Unfortunately, applying
    // transform directly to the svg object, does not work.
    var firstGroup = qwery('g', this.svg)[0]
    if (!firstGroup) throw new Error('could not find an svg group')

    var userCoordsHeightChange = userCoordsOffset * -1;
    userCoordsHeightChange += 120

    // create the transform we will be useing 
    var matrix      = this.svg.createSVGMatrix().translate(0, userCoordsHeightChange)
      , transform   = this.svg.createSVGTransformFromMatrix(matrix)

    firstGroup.transform.baseVal.appendItem(transform)

    var svgWidth        = this.svg.getAttribute('width')
      , svgWidthUnits   = svgWidth.slice(-2)
      , svgHeight       = this.svg.getAttribute('height')
      , svgHeightUnits  = svgHeight.slice(-2)
      // viewBox specifies user coords
      , svgViewBox      = this.svg.getAttribute('viewBox').split(' ')

    if (svgHeightUnits !== 'mm' || svgWidthUnits !== 'mm'){
      throw new Error('Assertion Failed: svg dimensions expected to be mm', svgWidth, svgHeight)
    }

    // The size of the image in mm
    svgWidth  = parseFloat(svgWidth.slice(0, -2))
    svgHeight = parseFloat(svgHeight.slice(0, -2))

    // width of the image in user coordinates
    var userWidth   = parseFloat(svgViewBox[2]) - parseFloat(svgViewBox[0])
      , userHeight  = parseFloat(svgViewBox[3]) - parseFloat(svgViewBox[1])

    var heightScaleFactor = svgHeight / userHeight

    // console.log('svgViewBox', svgViewBox, svgWidth, svgHeight)

    return userCoordsOffset * heightScaleFactor
  }
}


////////////////////////////////////////////////////////////////
//
// KS.Stack
//
KS.Stack = function(size){
  var parent = document.getElementById('ks-container')
  this.size = size || 4
  this.currentIndex = -1
  this.scores = []
  for (var i = 0; i < size; i++){
    var score = new KS.Score()
    this.scores.push(score)
    parent.appendChild(score.div)
  }
}

KS.Stack.prototype = {
  push: function(target){
    var oldScore = this.scores[this.currentIndex]
    this.currentIndex = (this.currentIndex + 1) % this.size
    var newScore = this.scores[this.currentIndex]

    newScore.opacity(0, 0)
    newScore.src(target,function(err){
      if (err){
        console.error('failed to get new score:', err)
        return
      }
      // fade out the old image
      if (oldScore) {oldScore.opacity(0, 450)}
      // fade in the new image
      newScore.opacity(1, 300)

      // offset in pixels 
      var staffOffset = newScore.getStaffOffset() //
      // console.log('translate up mm', staffOffset)
      // newScore.div.style.top = (-1 * staffOffset) + 'mm'
    })
  }
}

clearChildren = function(node){
  while (node.firstChild) node.removeChild(node.firstChild);
}
