const path    = require('path')
  , fs        = require('mz/fs')
  , childProc = require('mz/child_process')
  , hash      = require('string-hash')


const hashFileContents = function(str){
  var hashed =  '' + hash(str)
  while (hashed.length < 10) hashed = '0' + hashed
  return hashed
}

module.exports.xmlStrToPng = function*(xmlStr){

  const baseName          = hashFileContents(xmlStr)
  , basePngName           = baseName + '.png'
  , baseXmlName           = baseName + '.xml'
  , baseMscoreOutPngName  = baseName + '-1.png'

  // temporary xml filename to send to mscore
  const mscoreXmlName = path.join('./xml/', baseXmlName)
  , desiredPngName    = path.join('./score-img/', basePngName)
  , mscoreOutPngName  = path.join('./score-img/', baseMscoreOutPngName)

  // check if we already have the desired file
  console.log('checking if file exists:', desiredPngName)
  var fileExists = yield fs.exists(desiredPngName)
  if (fileExists){
    console.log('used cache for: '+desiredPngName)
    return desiredPngName
  }

  // write the xml file that we will pass to mscore
  console.log('writing:', mscoreXmlName)
  yield fs.writeFile(mscoreXmlName, xmlStr)

  // send to mscore
  var prefix = (process.platform === 'darwin') ? '/Applications/MuseScore\\ 2.app/Contents/MacOS/mscore ' : 'xvfb-run mscore '

  const command = prefix+mscoreXmlName+' -o '+desiredPngName+' -T 0 -r 600 && mv ' + mscoreOutPngName + ' ' + desiredPngName
  , mscoreResult = yield childProc.exec(command)
  console.log('mscore command result:', mscoreResult)

  // check if the file exists
  fileExists = yield fs.exists(desiredPngName)
  if (!fileExists)
    throw new Error('mscore command failed');

  return desiredPngName
}
