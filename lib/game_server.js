var GameStates = require("../public/javascripts/game_states.js");

function handleShipsPlaced(game, socket, io){

  var playerIndex = game.waitingForShips.indexOf(socket);
  game.waitingForShips.splice(playerIndex, 1);

  if (game.waitingForShips.length === 0) {
    io.to(game.players[0].id).emit("SHOOT", GameStates.SHOOT);
    io.to(game.players[1].id).emit("WAIT_FOR_OPPONENT_SHOT", GameStates.WAIT_FOR_OPPONENT_SHOT);
  }
};

function handleShot (game, socket, io, data) {
  if (game.players.indexOf(socket) === 0) {
    io.to(game.players[1].id).emit("SHOT", data);
  } else {
    io.to(game.players[0].id).emit("SHOT", data);
  }
};

function handleShotResponse (game, socket, io, data) {
  if (game.players.indexOf(socket) === 0) {
    io.to(game.players[1].id).emit("SHOT_RESPONSE", data);
  } else {
    io.to(game.players[0].id).emit("SHOT_RESPONSE", data);
  }
};

function handleWin (game, socket, io, data) {
  var currentPlayerIdx = game.players.indexOf(socket);
  var otherPlayerIdx;

  if (currentPlayerIdx === 0 ) {
    otherPlayerIdx = 1;
  } else {
    otherPlayerIdx = 0;
  };

  io.to(game.players[otherPlayerIdx].id).emit("win", data);
};

function switchPlayer(game, socket, io) {
  var currentPlayerIdx = game.players.indexOf(socket);
  var otherPlayerIdx;

  if (currentPlayerIdx === 0 ) {
    otherPlayerIdx = 1;
  } else {
    otherPlayerIdx = 0;
  }

  io.to(game.players[otherPlayerIdx].id).emit("SHOOT", GameStates.SHOOT);
  io.to(game.players[currentPlayerIdx].id).emit("WAIT_FOR_OPPONENT_SHOT", GameStates.WAIT_FOR_OPPONENT_SHOT);
}

function createGame(server) {
  var io = require("socket.io")(server);
  var waitingUsers = [];
  var gameNumber = 1;
  var games = {};
  var game = {
    name: null,
    players: [],
    waitingForShips: []
  }

  io.on("connection", function(socket) {
    if (waitingUsers.length > 0) {
      game.name = "Game" + gameNumber++;
      game.players = [waitingUsers.shift(), socket];
      game.waitingForShips = game.players.slice();

      //players joining room
      game.players[0].join(game.name);
      game.players[1].join(game.name);
      console.log("players joining")

      games[game.players[0].id] = game;
      games[game.players[1].id] = game;

      //emit to players to place ships
      io.to(game.name).emit("place_ships", GameStates.PLACE_SHIPS );
      //game.players[0].to(game.name).emit("place_ships", GameStates.PLACE_SHIPS );
      //game.players[1].to(game.name).emit("place_ships", GameStates.PLACE_SHIPS );
    } else {
      waitingUsers.push(socket);
      console.log("players waiting");
    }

    socket.on("SHIPS_PLACED", function(data) {
      handleShipsPlaced(game, socket, io);
    });

    socket.on("SHOT", function(data) {
      handleShot(game, socket, io, data);
      switchPlayer(game, socket, io);
    });

    socket.on("SHOT_RESPONSE", function(data) {
      handleShotResponse(game, socket, io, data);
    })

    socket.on("win", function(data) {
      handleWin(game, socket, io, data);
    })

  });
}

module.exports = createGame;
