window.ksMidi = {};


ksMidi.init = function(){
  console.log('Attempt to initialize midi');

  // If the requestMidiAccess is not available, admit defeat
  if (!navigator.requestMIDIAccess){
    midiInitFail();
    return;
  }

  navigator.requestMIDIAccess({
    sysex: false
  }).then(ksMidi.midiInitSuccess, ksMidi.midiInitFail);
};


ksMidi.midiInitFail = function(){
  console.warn('Midi Init Fail');
};

ksMidi.midiInitSuccess = function(midiAccess){
  console.log('MIDI access granted', midiAccess);
  window.midiAccess = midiAccess;
};

ksMidi.init();