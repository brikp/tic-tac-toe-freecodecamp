let GamePieces = Object.freeze({'x': 'x', 'o': 'o'});
let AI_DIFFICULTY = 5; // percentage chance to take suboptimal move

let gameBoard = [
  0, 1, 2,
  3, 4, 5,
  6, 7, 8];

let humanPiece = GamePieces.x;
let computerPiece = GamePieces.o;
let startingPiece = humanPiece;
let isGameFinished = false;
let humanScore = 0;
let computerScore = 0;

let restartGame = function (startingPlayer) {
  isGameFinished = false;
  document.getElementById('message').textContent = '';
  gameBoard = [
  0, 1, 2,
  3, 4, 5,
  6, 7, 8];
  startingPiece = startingPlayer;
  updateGameBoardElement();
};

let processTurn = function (square, player) {
  gameBoard[square] = player;
  updateGameBoardElement();
  if (checkIfWinningState(gameBoard, player)) {
    isGameFinished = true;
    if (player == humanPiece) {
      humanScore++;
      document.getElementById('message').textContent = 'Human won!';
      document.getElementById('human-score').textContent = 'Human score: ' + humanScore;
      startingPiece = computerPiece;
    }
    else {
      computerScore++;
      document.getElementById('message').textContent = 'AI will annihilate us all!';
      document.getElementById('computer-score').textContent = 'Computer score: ' + computerScore;
      startingPiece = humanPiece;
    }
  }
  else if (checkIfTie()) {
    isGameFinished = true;
    document.getElementById('message').textContent = 'It\'s a delicate balance.';
    startingPiece = (player == humanPiece) ? computerPiece : humanPiece;
  }
  else if (player == humanPiece) {
    processComputerTurn();
  }
};

let processComputerTurn = function () {
  let index = minmax(gameBoard, computerPiece, 0).index;
  if (Math.random() * 100 < AI_DIFFICULTY) {
    console.log('Making suboptimal move');
    index = getSuboptimalMove(index);
  }
  
  processTurn(index, computerPiece);
};

let processClickedSquare = function (id) {
  let index = id.slice(id.length - 1);
  let isValidSquare = checkIfValidSquare(gameBoard, index);

  if (!isGameFinished && isValidSquare) {
    console.log('Clicked ' + index);
    processTurn(index, humanPiece);
  }
};

let updateGameBoardElement = function () {
  for (let i = 0; i < gameBoard.length; i++) {
    let idName = 'game-square-' + i;
    let squareText;
    if (gameBoard[i] != GamePieces.x && gameBoard[i] != GamePieces.o) {
      squareText = '';
    }
    else {
      squareText = gameBoard[i];
    }
    document.getElementById(idName).textContent = squareText;
  }
};

let getSuboptimalMove = function (bestMoveIndex) {
  let emptySquares = getEmptySquares(gameBoard);
  emptySquares.splice(emptySquares.indexOf(bestMoveIndex), 1)
  let randomSquare = emptySquares[Math.floor(Math.random() * 100 % emptySquares.length)];
  return randomSquare;
};

let minmax = function (board, player, depth) {

  if (checkIfWinningState(board, humanPiece)) {
    return {score: -10, depth: depth};
  }
  else if (checkIfWinningState(board, computerPiece)) {
    return {score: 10, depth: depth};
  }
  else if (checkIfTie()) {
    return {score: 0, depth: depth};
  }

  let freeSquares = getEmptySquares(board);
  let moves = [];

  freeSquares.map((square) => {

    let move = {};

    move.index = Number(square);
    board[move.index] = player;
    

    if (player == computerPiece) {
      let result = minmax(board, humanPiece, depth + 1);
      move.score = result.score;
      move.depth = result.depth;
    }
    else {
      let result = minmax(board, computerPiece, depth + 1);
      move.score = result.score;
      move.depth = result.depth;
    }
    
    board[move.index] = move.index;

    moves.push(move);
  });

  let bestMove = {};
  if (player == computerPiece) {
    bestMove.score = -100;
    bestMove.depth = 10;
    moves.map((move) => {
      if (move.score >= bestMove.score) {
        bestMove = move;
      }
    });
    moves.map((move) => {
      if (move.score == bestMove.score) {
        if (move.depth < bestMove.depth) {
          bestMove = move;
        }
      }
    });
  }

  else if (player == humanPiece) {
    bestMove.score = 100;
    bestMove.depth = 10;
    moves.map((move) => {
      if (move.score <= bestMove.score) {
        bestMove = move;
      }
    });
    moves.map((move) => {
      if (move.score == bestMove.score) {
        if (move.depth < bestMove.depth) {
          bestMove = move;
        }
      }
    });
  }

  return bestMove;
};

let checkIfWinningState = function (board, piece) {
  // Check horizontal rows
  if (
    (board[0] == piece && board[1] == piece && board[2] == piece) ||
    (board[3] == piece && board[4] == piece && board[5] == piece) ||
    (board[6] == piece && board[7] == piece && board[8] == piece) ||
  // Check vertical rows
    (board[0] == piece && board[3] == piece && board[6] == piece) ||
    (board[1] == piece && board[4] == piece && board[7] == piece) ||
    (board[2] == piece && board[5] == piece && board[8] == piece) ||
  // Check diagonals
    (board[0] == piece && board[4] == piece && board[8] == piece) ||
    (board[2] == piece && board[4] == piece && board[6] == piece)
  )
    return true;
  else 
    return false;
};

let getEmptySquares = function (board) {
  return board.filter((square) => square != GamePieces.x && square != GamePieces.o);
};

let checkIfValidSquare = function (board, index) {
  return getEmptySquares(board).indexOf(Number(index)) >= 0;
};

let checkIfTie = function () {
  return getEmptySquares(gameBoard).length == 0; 
};

let printBoard = function (board) {
  let boardToString = ` =======
  ${board[0]}|${board[1]}|${board[2]}
  -----
  ${board[3]}|${board[4]}|${board[5]}
  -----
  ${board[6]}|${board[7]}|${board[8]}`
  console.log(boardToString);
};

let bindEventListeners = function () {
  restartGame(startingPiece);
  updateGameBoardElement();

  let gameSquares = document.getElementsByClassName('game-square');
  for (let i = 0; i < gameSquares.length; i++) {
    gameSquares[i].addEventListener('click', () => processClickedSquare(gameSquares[i].getAttribute('id')));
  }

  document.getElementById('reset-game').addEventListener('click', () => restartGame(startingPiece));
};

if (document.readyState != 'loading') {
  bindEventListeners();
}
else {
  document.addEventListener('DOMContentLoaded', () => bindEventListeners());
}