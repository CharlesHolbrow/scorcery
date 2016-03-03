const path  = require('path')
  , fs      = require('mz/fs')
  , childProc = require('mz/child_process')


module.exports.xmlStrToPngFilename = function*(xmlStr, outFilename){
  if (typeof outFilename !== 'string')
    throw new Error('outFilename not provided')
  if (path.extname(outFilename).toLowerCase() !== '.png')
    outFilename += '.png'

  const basePngName   = path.basename(outFilename)
  , baseName          = outFilename.slice(0, '-4') 
  , baseXmlName       = baseName + '.xml'
  , baseFinalPngName  = baseName + '-1.png'

  // temporary xml file to send to mscore
  const mscoreXmlName = path.join('./xml/', baseXmlName)
  , mscorePngName     = path.join('./score-img/', basePngName)
  , finalPngName      = path.join('./score-img/', baseFinalPngName)

  // write the xml file that we will pass to mscore
  yield fs.writeFile(mscoreXmlName, xmlStr)

  // send to mscore
  const command = 'xvfb-run mscore '+mscoreXmlName+' -o '+mscorePngName+' -T 0 -r 600'
  , mscoreResult = yield childProc.exec(command)
  , fileExists = yield fs.stats.isFile(finalPngName)

  console.log('mscore command result:', mscoreResult)

  if (!fileExists)
    throw new Error('mscore command failed');

  return finalPngName
}
