let GamePieces = Object.freeze({'x': 'x', 'o': 'o'});
let AI_DIFFICULTY = 5; // percentage chance to take suboptimal move
let AI_TURN_WAIT_TIME = 750; // ms to wait before AI turn
let AI_TURN_AFTER_DELAY = 250; // ms to wait befor accepting input after ai turn
let GAME_RESET_DELAY = 2000; // ms to wait before starting a new round
let PIECE_ELEMENTS = {
  x: {icon: '<i class="game-icon-x align-self-center fas fa-times"></i>',
      id: 'icon-select-x'},
  o: {icon: '<i class="game-icon-o align-self-center fas fa-ban"></i>', 
      id: 'icon-select-o'}
};

let gameBoard = [
  0, 1, 2,
  3, 4, 5,
  6, 7, 8];

let humanPiece = GamePieces.x;
let computerPiece = GamePieces.o;
let isGameFinished = false;
let isPiecePicked = false;
let humanScore = 0;
let computerScore = 0;
let currentTurn = humanPiece;

let restartGame = function (startingPlayer) {
  currentTurn = startingPlayer;
  isGameFinished = false;
  document.getElementById('message').textContent = '';
  gameBoard = [
  0, 1, 2,
  3, 4, 5,
  6, 7, 8];
  
  updateGameBoardElement();
  if (startingPlayer == computerPiece) {
    setTimeout(() => processComputerTurn(), AI_TURN_WAIT_TIME);
  }
  animateCurrentTurn();
};



let animateCurrentTurn = function () {

  let xPiece = document.getElementById('icon-select-x');
  let oPiece = document.getElementById('icon-select-o');

  if (isGameFinished) {
    oPiece.classList.remove('fa-spin');
    oPiece.style.cssText = "font-size: 1em;"
    xPiece.classList.remove('fa-spin');
    xPiece.style.cssText = "font-size: 1em;"
  }
  else if (isPiecePicked) {
    if (currentTurn == GamePieces.x) {
      oPiece.classList.remove('fa-spin');
      oPiece.style.cssText = "font-size: 1em;"
      xPiece.classList.add('fa-spin');
      xPiece.style.cssText = "font-size: 1.5em;"

    }
    else {
      xPiece.classList.remove('fa-spin');
      xPiece.style.cssText = "font-size: 1em;"
      oPiece.classList.add('fa-spin');
      oPiece.style.cssText = "font-size: 1.5em;"
    }
  }
}

let processTurn = function (square, player) {
  gameBoard[square] = player;
  updateGameBoardElement();
  if (checkIfWinningState(gameBoard, player)) {
    isGameFinished = true;
    if (player == humanPiece) {
      humanScore++;
      updateMessageElement('Hope in humanity restored!');
      updateScoreElements();
      animateCurrentTurn();
      setTimeout(() => restartGame(computerPiece), GAME_RESET_DELAY);
    }
    else {
      computerScore++;
      updateMessageElement('AI will annihilate us all!');
      updateScoreElements();
      animateCurrentTurn();
      setTimeout(() => restartGame(humanPiece), GAME_RESET_DELAY);
    }
  }
  else if (checkIfTie()) {
    isGameFinished = true;
    updateMessageElement('It\'s a delicate balance.');
    let startingPiece = (player == humanPiece) ? computerPiece : humanPiece;
    animateCurrentTurn();
    setTimeout(() => restartGame(startingPiece), GAME_RESET_DELAY);
  }
  else if (player == humanPiece) {
    currentTurn = computerPiece;
    animateCurrentTurn();
    setTimeout(() => processComputerTurn(), AI_TURN_WAIT_TIME);
  }
};

let processComputerTurn = function () {
  let index = minmax(gameBoard, computerPiece, 0).index;
  if (Math.random() * 100 < AI_DIFFICULTY) {
    console.log('Making suboptimal move');
    index = getSuboptimalMove(index);
  }
  setTimeout(() => {
    currentTurn = humanPiece;
    animateCurrentTurn();
  }, AI_TURN_AFTER_DELAY);
  
  processTurn(index, computerPiece);
};

let processClickedSquare = function (id) {
  let index = id.slice(id.length - 1);
  let isValidSquare = checkIfValidSquare(gameBoard, index);

  if (!isGameFinished && isValidSquare && currentTurn == humanPiece) {
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
      if (gameBoard[i] == GamePieces.x) {
        squareText = PIECE_ELEMENTS.x.icon;
      }
      else {
        squareText = PIECE_ELEMENTS.o.icon;
      }
    }
    document.getElementById(idName).innerHTML = squareText;
  }
};

let updateScoreElements = function () {
  document.getElementById('human-score').textContent = humanScore;
  document.getElementById('computer-score').textContent = computerScore;
};

let updateMessageElement = function (message) {
  document.getElementById('message').textContent = message;
};

let getSuboptimalMove = function (bestMoveIndex) {
  let emptySquares = getEmptySquares(gameBoard);
  if (emptySquares.length == 1) {
    return bestMoveIndex;
  } else {
    emptySquares.splice(emptySquares.indexOf(bestMoveIndex), 1)
    let randomSquare = emptySquares[Math.floor(Math.random() * 100 % emptySquares.length)];
    return randomSquare;
  }
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

function bindEventListeners  () {
  document.getElementById('game-field').style.display = 'none';
  updateGameBoardElement();

  let elements = document.getElementsByClassName('game-square');
  for (let i = 0; i < elements.length; i++) {
    //console.log(elements[i]);
    elements[i].addEventListener('click', () =>  {
      processClickedSquare(elements[i].getAttribute('id'));
    });
  }

  document.getElementById('o-col').addEventListener('click', setPickedPiece);
  document.getElementById('x-col').addEventListener('click', setPickedPiece);

  let resetButton = document.getElementById('icon-reset');
  resetButton.addEventListener('mouseenter', () => {
    resetButton.classList.add('fa-spin');
  });
  resetButton.addEventListener('mouseleave', () => {
    resetButton.classList.remove('fa-spin');
  });
  document.getElementById('icon-reset').addEventListener('click', () => resetGameProgress());
};

if (document.readyState != 'loading') {
  bindEventListeners();
}
else {
  document.addEventListener('DOMContentLoaded', bindEventListeners(), false);
}

function setPickedPiece () {
  isPiecePicked = true;
  let callerID = this.getAttribute('id');
  console.log(this);
  if (callerID == 'o-col') {
    humanPiece = GamePieces.o;
    computerPiece = GamePieces.x;
  }
  else {
    humanPiece = GamePieces.x;
    computerPiece = GamePieces.o;
  }
  let elements = document.getElementsByClassName('player-icons');
  for (let i = 0; i < elements.length; i++) {
    let el = elements[i];
    el.style.cssText = "height: 40px; font-size: 2em;";
  }
  if (humanPiece == GamePieces.x) {
    document.getElementById('x-col').style.color = "rgb(223, 54, 54)";
    document.getElementById('o-col').style.color = "rgb(189, 189, 189)";
  } else {
    document.getElementById('x-col').style.color = "rgb(189, 189, 189)";
    document.getElementById('o-col').style.color = "rgb(162, 247, 77)";
  }

  document.getElementById('x-col').classList.remove('border-right');
  document.getElementById('piece-choice-text').style.display = 'none';
  document.getElementById('game-field').style.display = 'inline';

  document.getElementById('o-col').removeEventListener('click', setPickedPiece);
  document.getElementById('x-col').removeEventListener('click', setPickedPiece);
    
  computerScore = 0;
  humanScore = 0;
  updateScoreElements();
  restartGame(humanPiece);
};

function xPieceHover () {
  document.getElementById('x-col').style.color = 'rgb(223, 54, 54);';
};

function oPieceHover () {
  document.getElementById('o-col').style.color = 'rgb(162, 247, 77);';
}

let resetGameProgress = function () {
  isPiecePicked = false;
  document.getElementById('piece-choice-text').style.display = 'inline';
  document.getElementById('game-field').style.display = 'none';

  let elements = document.getElementsByClassName('player-icons');
  for (let i = 0; i < elements.length; i++) {
    let el = elements[i];
    el.style.cssText = "height: 50vh; font-size: 3em;";
  }

  document.getElementById('x-col').classList.add('border-right');
  document.getElementById('icon-select-x').classList.remove('fa-spin');
  document.getElementById('icon-select-o').classList.remove('fa-spin');

  document.getElementById('o-col').addEventListener('click', setPickedPiece);
  document.getElementById('x-col').addEventListener('click', setPickedPiece);
};