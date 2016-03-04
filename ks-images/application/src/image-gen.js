const path    = require('path')
  , fs        = require('mz/fs')
  , childProc = require('mz/child_process')
  , hash      = require('string-hash')


const hashFileContents = function(str){
  var hashed =  '' + hash(str)
  while (hashed.length < 10) hashed = '0' + hashed
  return hashed
}

module.exports.xmlStrToSvg = function*(xmlStr){

  const baseName    = hashFileContents(xmlStr)
  , baseXmlName     = baseName + '.xml'
  , mscoreXmlName   = path.join('./xml/', baseXmlName)
  , baseSvgName     = baseName + '.svg'
  , desiredSvgName  = path.join('./score-img/', baseSvgName)

  // check if we already have the desired file
  console.log('checking if file exists:', desiredSvgName)
  var fileExists = yield fs.exists(desiredSvgName)
  if (fileExists){
    console.log('used cache for: '+desiredSvgName)
    return desiredSvgName
  }

  // write the xml file that we will pass to mscore
  console.log('writing:', mscoreXmlName)
  yield fs.writeFile(mscoreXmlName, xmlStr)

  // send to mscore
  var prefix = (process.platform === 'darwin') ? '/Applications/MuseScore\\ 2.app/Contents/MacOS/mscore ' : 'xvfb-run mscore '

  const command = prefix+mscoreXmlName+' -o '+desiredSvgName+' -T 0'
  , mscoreResult = yield childProc.exec(command)
  console.log('mscore command result:', mscoreResult)

  // check if the file exists
  fileExists = yield fs.exists(desiredSvgName)
  if (!fileExists)
    throw new Error('mscore command failed');

  return desiredSvgName
}
