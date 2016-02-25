import subprocess
import music21
from flask import Flask, Response, send_from_directory

# Configure music 21
# The default author and title are rendered to xml. Which
# causes mscore to render the title at the top of the page.
# Fortunately if the string is empty, no xml is rendered for
# the author and title fields.
music21.defaults.author = ''
music21.defaults.title = ''


app = Flask(__name__)

@app.route('/')
def hello():
    return 'It Works'

@app.route('/xml/<note_text>')
def send_xml(note_text):
    note = music21.note.Note(note_text)
    xml = music21.musicxml.m21ToString.fromMusic21Object(note)
    return Response(xml, mimetype='text/xml')

@app.route('/img/<path:path>')
def send_img(path):
    return send_from_directory('img', path)


# Linux
# xvfb-run mscore t2.xml -o 's.png' -T 0 -r 600

# OSX
# /Applications/MuseScore\ 2.app/Contents/MacOS/mscore t2.xml -o 's.png' -T 0 -r 600
# subprocess.run(['xvfb-run', 'mscore', 'xml/test.xml', '-o', 'img/test.png'])


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)