function Battleship() {
    this.shipsToPlace = [];
    this.shipsToPlace.push(new Ship( { len: 2 } ));
    this.shipsToPlace.push(new Ship( { len: 3 } ));
    this.shipsToPlace.push(new Ship( { len: 3 } ));
    this.shipsToPlace.push(new Ship( { len: 4 } ));
    this.shipsToPlace.push(new Ship( { len: 5 } ));
}
