import subprocess
import music21
from flask import Flask, send_from_directory



app = Flask(__name__)

@app.route('/')
def hello():
    return 'It Works'

@app.route('/xml/<path:path>')
def send_xml(path):
    return send_from_directory('xml', path)

@app.route('/img/<path:path>')
def send_img(path):
    return send_from_directory('img', path)


print('writing kinetic score file.............................................................................')
n = music21.note.Note('C3')
n.write(fmt='musicxml', fp='xml/test.xml')
print('subprocess for writing xml->img')
subprocess.run(['xvfb-run', 'mscore', 'xml/test.xml', '-o', 'img/test.png'])


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, use_reloader=False)
