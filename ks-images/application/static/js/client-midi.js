window.ksMidi = {
  output: undefined,
  msgs: {
    continue: new Uint8Array([0b11111011]),
    start:    new Uint8Array([0b11111010]),
    noteOn:   new Uint8Array([0b10010000, 0, 0])
  }
};


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

ksMidi.continue = function(){
  if (!ksMidi.output){
    console.warn('Cannot start: output not available');
    return;
  }
  ksMidi.output.send(ksMidi.msgs.continue);
};

ksMidi.start = function(){
  if (!ksMidi.output){
    console.warn('Cannot start: output not available');
    return;
  }
  ksMidi.output.send(ksMidi.msgs.start);
};

ksMidi.noteOn = function(note, vel, ch){
  if (!ksMidi.output){
    console.warn('Cannot noteOn: output not available');
    return;
  }

  vel = (typeof vel === 'number') ? vel : 127;
  ch  = (typeof ch  === 'number') ? ch  : 0;

  var msg = ksMidi.msgs.noteOn;
  msg[0] += ch;
  msg[1]  = note;
  msg[2]  = vel;
  console.log(msg);
  ksMidi.output.send(msg);
};

ksMidi.midiInitFail = function(){
  console.warn('Midi Init Fail');
};

ksMidi.midiInitSuccess = function(midi){
  console.log('MIDI access granted!');
  window.midi = midi;

  var midiOutput;
  // We know requestMIDIAccess exists, so we assume a modern
  // browser that support for/of loops.
  for (let value of midi.outputs.values()){
    if (!midiOutput) midiOutput = value;
    if (value.name && value.name.startsWith('IAC Driver'))
      midiOutput = value;
  }

  // Verify we found at least one midi output
  if (!midiOutput){
    console.error('No Midi Outputs detected');
    return;
  }

  if (!midiOutput.name.startsWith('IAC Driver')){
    console.warn('Found a midi output, but its name does not start with "IAC Driver"');
  }

  console.log(`Midi output found: "${midiOutput.name}"`);

  ksMidi.output = midiOutput;

};

ksMidi.init();
