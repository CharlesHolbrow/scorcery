import music21

# Configure music 21
# The default author and title are rendered to xml. Which
# causes mscore to render the title at the top of the page.
# Fortunately if the string is empty, no xml is rendered for
# the author and title fields.
music21.defaults.author = ''
music21.defaults.title = ''


note = music21.note.Note('b+3')
xml = music21.musicxml.m21ToString.fromMusic21Object(note)
