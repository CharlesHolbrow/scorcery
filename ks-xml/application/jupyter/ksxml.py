import urllib
import requests
import itertools
import math
import xml.etree.ElementTree as ET

from music21 import *

# Return a generator that iterates over all permutations of a list
# http://stackoverflow.com/questions/2710713/algorithm-to-generate-all-possible-permutations-of-a-list
def permute(xs, low=0):
    if low + 1 >= len(xs):
        yield xs
    else:
        for p in permute(xs, low + 1):
            yield p        
        for i in range(low + 1, len(xs)):        
            xs[low], xs[i] = xs[i], xs[low]
            for p in permute(xs, low + 1):
                yield p        
            xs[low], xs[i] = xs[i], xs[low]

def nth_permutation_indices(i, m):
    available_positions = list(range(m))
    indices = [0 for r in range(m)]
    res     = i
    for row_index in range(m-1):
        # How many posibilities there are in next rows?
        n1f      = math.factorial(m - row_index -1)
        # What is the index of this row?
        res      = math.floor(i / n1f)
        # The index may have already been used in a previous row.
        # take one from our list of indexes
        position = available_positions[res]
        del available_positions[res]

        indices[row_index] = position
        # our next iteration through the loop will be constrained by 
        i = i - (res * n1f)
        
    indices[m-1] = available_positions[0]
    return indices

def strip_ids_from_xmlstr(xmlstr):
    tree = ET.fromstring(xmlstr)   
    for n in tree.iter('part'):
        if 'id' in n.attrib:
            n.attrib.pop('id')
    for n in tree.iter('score-part'):
        if 'id' in n.attrib:
            n.attrib.pop('id')
    return ET.tostring(tree, encoding='utf8', method='xml')

# Initialize Music21 and 

defaults.author = ''
defaults.title = ''

def send_m21_object(scoreName, obj):
    xml = musicxml.m21ToString.fromMusic21Object(obj)
    xml = strip_ids_from_xmlstr(xml)
    headers = {'Content-Type': 'text/xml'}
    url = urllib.parse.urljoin('http://ks-images:3000/score/', scoreName)
    return requests.post(url, 
                        data=xml,
                        headers=headers,
                        timeout=5)

# create, but do not push to clients
def request_svg_creation(obj, filename):
    xml = musicxml.m21ToString.fromMusic21Object(obj)
    headers = {'Content-Type': 'text/xml'}
    url = urllib.parse.urljoin('http://ks-images:3000', 'create-svg/' + filename)
    return requests.post(url,
                        data=xml,
                        headers=headers,
                        timeout=5)

def send_transport_command(scoreName, commandName):
    path = scoreName + '/' + commandName
    url = urllib.parse.urljoin('http://ks-images:3000/transport/', path)
    return requests.post(url,
                         headers={'Content-Type': 'text/plain'},
                         timeout=5,
                         data='')

def write_midi_file(a_stream, filename='default.mid'):
    # streanToMidiFile is buggy for non-flat streams
    mf = midi.translate.streamToMidiFile(a_stream.flat)
    mf.open(filename, 'wb')
    mf.write()
    mf.close()

def note_list_from_note_names(note_names):
    notes = [note.Note(name, type='16th') for name in note_names]
    
    # When making a note from a midi number, m21 automagically inserts a 'natural' accidental
    for n in notes:
        if n.pitch.accidental and n.pitch.accidental.name == 'natural':
            n.pitch.accidental = None
    return notes

def order_generator(size, start_index, max_steps):
    for i in range(start_index, start_index + max_steps):
        yield nth_permutation_indices(i, size)
        
def hashtagify_chord_arrays(note_name_arrays):
    midi_number_arrays = [[note.Note(name).pitch.midi for name in note_names] for note_names in note_name_arrays]
    midi_number_arrays = [ns + [n + 12 for n in ns] for ns in midi_number_arrays]
    results = []
    for midi_array in midi_number_arrays:
        appendage = midi_array[1:-1]
        appendage.reverse()
        results.append(midi_array + appendage)
    return results

def stream_generator_from_chord_arrays(chords, start_index, count):
    chords = hashtagify_chord_arrays(chords)
    length = len(chords[0])

    # Mirror, then permute
    for midi_notes, order in zip(itertools.cycle(chords), order_generator(length, start_index, count)):
        midi_melody = [midi_notes[i] for i in order]
        note_melody = note_list_from_note_names(midi_melody)
        
        melody_stream = stream.Stream()
        melody_stream.append(note_melody)
        yield melody_stream