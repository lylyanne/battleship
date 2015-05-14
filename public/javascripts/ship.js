function Ship(options) {
  this.segments = new Array(options.len);
}

Ship.prototype = {
  place: function(coord1, coord2, shipsPlaced) {
    if(this.isValidShip(coord1, coord2, shipsPlaced)){
      this.fillShipCoords(coord1, coord2);
      return true;
    } else {
      return false;
    }
  },
  isValidShip: function(coord1, coord2, shipsPlaced) {
    var len = this.segments.length;
    if ( Math.abs(coord1[0] - coord2[0]) === len - 1 &&
         Math.abs(coord1[1] - coord2[1]) === len - 1) {
      //diagonal
      return false;
    } else if ( Math.abs(coord1[0] - coord2[0]) === len - 1 ||
                Math.abs(coord1[1] - coord2[1]) === len - 1) {
        var potentialCoords = this.getPotentialShipCoords(coord1, coord2);

        if (this.doesShipOverLap(potentialCoords, shipsPlaced)) {
          return false;
        }
    } else {
      return false;
    }
    return true;
  },

  doesShipOverLap: function(potentialCoords, shipsPlaced) {
    var status = false;
    shipsPlaced.forEach(function(ship) {
      for (var i = 0; i < ship.segments.length; i++) {
        for (var j = 0; j < potentialCoords.length; j++) {
          if (JSON.stringify(ship.segments[i]) == JSON.stringify(potentialCoords[j])) {
            status = true;
          }
        }
      }
    });
    return status;
  },

  fillShipCoords: function(coord1, coord2) {
    this.segments = this.getPotentialShipCoords(coord1, coord2);
  },

  getPotentialShipCoords: function(coord1, coord2) {
      var arrayOfCoords = [];
      var diff;
      if (coord2[0] - coord1[0] < 0) {
        diff = [-1, 0];
      } else if (coord2[0] - coord1[0] > 0) {
        diff = [1, 0];
      } else if (coord2[1] - coord1[1] < 0) {
        diff = [0, -1];
      } else if (coord2[1] - coord1[1] > 0) {
        diff = [0, 1];
      }

      arrayOfCoords.push(coord1);
      for (var i = 1; i < this.segments.length; i++) {
        var x = arrayOfCoords[i-1][0];
        var y = arrayOfCoords[i-1][1];
        arrayOfCoords[i] = [ x + diff[0], y + diff[1]];
      }

      return arrayOfCoords;
    }
};
