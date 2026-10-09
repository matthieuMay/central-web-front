/wayfinder the goal is to implement the movement of cards : 2 ways to move the cards : 1. with the keyboard (the arrows) you can displace a card to the neighbouring column. the vertical arrows change the placement in the column, if the card is  the 1st in a column it can be moved higher, same when it's the last 2. with drag and drog : reorder in the same column, put in the neighbouring column, on the spot aimed at, an empty column accepts a card. When the card is done confettis must appear on the screen. you need to use that as well : 

```
PUT /cards/:cardId
Content-Type: application/json
{"column":"doing","position":1}
retour
BoardData
```
