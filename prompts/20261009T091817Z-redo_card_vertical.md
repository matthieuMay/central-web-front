Objective 1 (Cards move up & down):
Cards can be moved vertically in its column, in addition with what is already implemented (cards can move from a column to neighbor column)

Conditions for Objective 1 are:
- cards cannot move down/up if their are on the far sides all the way up/down of its column
- the vertically movement must be possible only with keyboard touches DOWN and UP similarly to column switching feature; and possible with buttons on the screen next to buttons "Move right" and "Move left" (call them "Move up" and "Move down")

Objective 2 (Cards drag & drop):
Cards can be dragged & drops with the use of the mouse similarly as files and folders in Windows File Management

Conditions for Objective 2 are:
- Cards can be placed anywhere (its column or other columns), between others cards if it is the case; in an empty column, or above or below others cards
- A visual shadow must be shown when user drags the card, visual shadow showing where the cards will be placed once dropped by user with mouse

Implementation choices:
- Use react-dnd for Objective 2
