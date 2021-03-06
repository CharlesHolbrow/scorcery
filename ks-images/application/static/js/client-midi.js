window.ksMidi = {
  output: undefined,
  msgs: {
    continue: new Uint8Array([0b11111011]),
    start:    new Uint8Array([0b11111010]),
    stop:     new Uint8Array([0b11111100]),
    noteOn:   new Uint8Array([0b10010000, 0, 0]),
    cc:       new Uint8Array([0b10110000, 0, 0]),
    spp:      new Uint8Array([0xF2, 0, 0]),
    clock:    new Uint8Array([0b11111000])
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

  // We are only interested in one midi outPut
  var midiOutput;
  // We know requestMIDIAccess exists, so we assume a modern
  // browser that support for/of loops.
  for (let value of midi.outputs.values()){
    if (!midiOutput) midiOutput = value;
    if (value.name && value.name.startsWith('IAC Driver'))
      midiOutput = value;
  }
  // Get the midi input too
  var midiInput;
  // We know requestMIDIAccess exists, so we assume a modern
  // browser that support for/of loops.
  for (let value of midi.inputs.values()){
    if (!midiInput) midiInput = value;
    if (value.name && value.name.startsWith('IAC Driver'))
      midiInput = value;
      midiInput.onmidimessage = ksMidi._onMidiMessage;
  }

  // Verify we found at least one midi output
  if (!midiOutput){
    console.error('No Midi Outputs detected');
    return;
  }
  // Verify we found at least one midi input
  if (!midiOutput){
    console.error('No Midi Inputs detected');
    return;
  }

  if (!midiOutput.name.startsWith('IAC Driver')){
    console.warn('Found a midi output, but its name does not start with "IAC Driver"');
  }
  if (!midiInput.name.startsWith('IAC Driver')){
    console.warn('Found a midi input, but its name does not start with "IAC Driver"');
  }

  console.log(`Midi output found: "${midiOutput.name}"`);
  console.log(`Midi input  found: "${midiOutput.name}"`);


  ksMidi.output = midiOutput;
  ksMidi.input = midiInput;
};

ksMidi.ksPlay   = function(){ksMidi.cc(110, 0, 15);};
ksMidi.ksStop   = function(){ksMidi.cc(111, 0, 15);};
ksMidi.ksPause  = function(){ksMidi.cc(112, 0, 15);};
ksMidi.ksReload = function(){ksMidi.cc(113, 0, 15);};
ksMidi.ksOffset = function(options){
  ksMidi._zeroOffset = options.value || 0;
}
ksMidi.ksImagePrefix = function(options){
  ksMidi._imagePrefix = options.value || '';
}


// these are used for the clock:
ksMidi._beat = -1;
ksMidi._tick = -1;
ksMidi._onTick = function(){

  // first set the beat correctly, then fire the callbacks
  ksMidi._tick = (ksMidi._tick + 1) % 24
  if (ksMidi._tick % 6 === 0) ksMidi._beat += 1;


  if (ksMidi._tick === 0){
    ksMidi._onQuarter(ksMidi._beat / 4);
  }
  if (ksMidi._tick % 12 === 0){
    ksMidi._on8th(ksMidi._beat  / 2);
  }
  if (ksMidi._tick % 6 === 0){
    ksMidi._on16th((ksMidi._beat));
  }
}

ksMidi._onQuarter = function(count){
}
ksMidi._on8th = function(count){
}
ksMidi._on16th = function(count){
}

ksMidi._onMidiMessage = function(msg){
  var data = msg.data;

  // SPP Song Position Pointer
  if (data[0] === ksMidi.msgs.spp[0])
  {
    ksMidi._beat = data[2] * 128 + data[1] -1;
    ksMidi._tick = -1;
  } 
  // Midi Clock - 24 per quarter note
  else if (data[0] === ksMidi.msgs.clock[0])
  {
    ksMidi._onTick();
  }
  // midi start message
  else if (data[0] === ksMidi.msgs.start[0]){
    console.log('start');
  }
};

ksMidi.init();
