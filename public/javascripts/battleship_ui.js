function BattleshipUI($root, battleship, socket) {
  this.$root = $root;
  this.socket = socket;
  this.battleship = battleship;
  this.state = GameStates.WAITING_FOR_OPPONENT;
  this.shipsPlaced = [];
  this.firstCoord = null;
  this.secondCoord = null;
  this.segmentsLeft = 17;

  $root.on("click", ".tile", this.tileClick.bind(this));

  this.socket.on("place_ships", this.changeState.bind(this));
  this.socket.on("SHOOT", this.changeState.bind(this));
  this.socket.on("WAIT_FOR_OPPONENT_SHOT", this.changeState.bind(this));
  this.socket.on("SHOT_RESPONSE", this.updateOpponentBoard.bind(this));
  this.socket.on("SHOT", function(data) {
    var status = false;
    this.shipsPlaced.forEach(function(ship) {
      for (var i = 0; i < ship.segments.length; i++) {
        if (JSON.stringify(ship.segments[i]) == JSON.stringify(data)) {
          status = true;
        }
      }
    });

    if (status) {
      var bombResponse = { message: "BOMB", coord: data };
      this.submitMessage("SHOT_RESPONSE", bombResponse);
      this.updateMyBoard(bombResponse);
      this.segmentsLeft--;
      this.isGameOver();
    } else {
      var missResponse = { message: "MISS", coord: data };
      this.submitMessage("SHOT_RESPONSE", missResponse);
      this.updateMyBoard(missResponse);
    }

  }.bind(this));

  this.socket.on("win", this.updateWinnerBoard.bind(this));

}

BattleshipUI.prototype = {
  createGrids: function () {
    var myBoatGrid = [];
    var $myBoard = $("<div class='myBoard'></div>");

    for (var i = 0; i < 10; i++) {
      myBoatGrid[i] = [];

      for (var j = 0; j < 10; j++) {
        myBoatGrid[i][j] = [$tile];
        var $tile = $("<div class='tile'></div>");
        $tile.attr("data-x", i);
        $tile.attr("data-y", j);
        $myBoard.append($tile);
      }
    }

    this.$root.append($myBoard);

    var myOpponentGrid = [];
    var $opponentBoard = $("<div class='opponentBoard'></div>");

    for (var i = 0; i < 10; i++) {
      myOpponentGrid[i] = [];

      for (var j = 0; j < 10; j++) {
        myOpponentGrid[i][j] = [$tile];
        var $tile = $("<div class='tile'></div>");
        $tile.attr("data-coord-x", i);
        $tile.attr("data-coord-y", j);
        $opponentBoard.append($tile);
      }
    }

    this.$root.append($opponentBoard);
  },

  changeState: function(state){
    this.state = state;
    console.log(this.state + "  " + "is the new state");
  },

  myBoardClick: function(coords, tile){
    if(this.state === GameStates.PLACE_SHIPS ){
      if (this.firstCoord === null) {
         this.firstCoord = coords;
      } else {
        this.secondCoord = coords;

        var currentShip = this.battleship.shipsToPlace.shift();

        if (currentShip.place(this.firstCoord, this.secondCoord, this.shipsPlaced)){
          this.shipsPlaced.push(currentShip);
          this.renderShips();

          //change status once all battleships are placed
          if (this.battleship.shipsToPlace.length === 0) {
            this.changeState(GameStates.WAITING_FOR_OPPONENT_SHIPS);
            this.submitMessage("SHIPS_PLACED", GameStates.SHIPS_PLACED);
          }
        } else {
          this.battleship.shipsToPlace.unshift(currentShip);
          alert("invalid coord");
        }

        this.firstCoord = null;
        this.secondCoord = null;
      }
    }
  },
  enemyBoardClick: function(coords, $tile){
    console.log()
    if (this.state === 'SHOOT' && (!$tile.hasClass('bomb') && !$tile.hasClass('miss'))){
      this.submitMessage('SHOT', coords);
    }
  },

  tileClick: function(e){
    var $currentTile = $(e.currentTarget);

    console.log("Clicking tile");
    if($currentTile.parent().hasClass('myBoard')){
      console.log("Clicking my board");
      var coords = [$currentTile.data("x"), $currentTile.data("y")];
      this.myBoardClick(coords, $currentTile);
    } else {
      var coords = [$currentTile.data("coord-x"), $currentTile.data("coord-y")];
      this.enemyBoardClick(coords, $currentTile);
    }
  },
  renderShips: function() {
    this.shipsPlaced.forEach(function(ship){
      for (var i = 0; i < ship.segments.length; i++) {
        $(".tile[data-x='" + ship.segments[i][0] + "'][data-y='" + ship.segments[i][1] + "']").addClass('ship');
      }
    });
  },

  submitMessage: function(event, message) {
    this.socket.emit(event, message)
  },

  updateMyBoard: function(data) {
    var $tile = $(".tile[data-x='" + data.coord[0] + "'][data-y='" + data.coord[1] + "']");
    if (data.message === "BOMB") {
      $tile.addClass('bomb');
    } else {
      $tile.addClass('miss');
    }
  },

  updateOpponentBoard: function(data) {
    var $tile = $(".tile[data-coord-x='" + data.coord[0] + "'][data-coord-y='" + data.coord[1] + "']");
    if (data.message === "BOMB") {
      $tile.addClass('bomb');
    } else {
      $tile.addClass('miss');
    }
  },

  isGameOver: function() {
    if (this.segmentsLeft === 0) {
      $("#alerts").text("You Lose");
      this.submitMessage("win", "You Win");
    }
  },

  updateWinnerBoard: function(data) {
    $("#alerts").text(data);
  }
};
