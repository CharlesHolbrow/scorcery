window.ksMidi = {
  output: undefined,
  msgs: {
    continue: new Uint8Array([0b11111011]),
    start:    new Uint8Array([0b11111010]),
    stop:     new Uint8Array([0b11111100]),
    noteOn:   new Uint8Array([0b10010000, 0, 0]),
    cc:       new Uint8Array([0b10110000, 0, 0]),
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

ksMidi.cc = function(cc, val, ch){
  if (!ksMidi.output){
    console.warn('Cannot CC: output not available');
    return;
  }

  if (typeof cc  !== 'number' || cc < 0 || cc > 127){
    throw new Error('Bad cc number agrument');
  }
  cc = Math.floor(cc);

  val = (typeof val === 'number') ? Math.floor(val) % 128 : 127;
  ch  = (typeof ch  === 'number') ? Math.floor(ch)  % 16  : 0;

  var msg = [ksMidi.msgs.cc[0] + ch, cc, val];
  ksMidi.output.send(msg);
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

  var msg = [ksMidi.msgs.noteOn[0] + ch, note, vel];
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

ksMidi.ksPlay   = function(){ksMidi.cc(110, 0, 15);};
ksMidi.ksStop   = function(){ksMidi.cc(111, 0, 15);};
ksMidi.ksPause  = function(){ksMidi.cc(112, 0, 15);};
ksMidi.ksReload = function(){ksMidi.cc(113, 0, 15);};
ksMidi.init();
