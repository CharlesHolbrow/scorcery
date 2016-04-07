import urllib
import requests
import itertools
import math

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

# Initialize Music21 and 

defaults.author = ''
defaults.title = ''

def send_m21_object(scoreName, obj):
    xml = musicxml.m21ToString.fromMusic21Object(obj)
    headers = {'Content-Type': 'text/xml'}
    url = urllib.parse.urljoin('http://ks-images:3000/score/', scoreName)
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