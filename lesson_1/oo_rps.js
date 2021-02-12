/*
LS 120 : Object Oriented RPS
Implement RPS using an Object Oriented structure
*/

/*
OO RPS Bonus Features:
---Keeping Score up to 5---
  High level overview: Currently the game loops 1 time and displays the winner.
  If keeping score up to 5 wins, the game will need to track the score for both 
  players and automatically end if 5 wins are reached by either player.

    new object or state?
      Tracking the scores of each player seems like a state (PLAYER has a SCORE)
      A separate scoreboard object would work but would be more mental overhead.

      Since a GAME has a WINNING CONDITION, it's natural to add the match limit 
      (5) and condition checks to the main RPSGame object. Using state and 
      condition checks for scoring appear simpler in this case.

---Adding Lizard/Spock---
  High level overview: A classic feature! Simple to implement on the surface...
  x The random number that the computer chooses will need to be increased to 5
  x Player logic will need provide and accept two more options.
  x Checks for win conditions will need to be expanded.

---Move history---
  A 'Scoreboard' object would be a good place to hold a move history, and
  would also be a good way to handle UI and certain parts of the game logic.
  x History:
    - a new ScoreBoard object:
      - tracks the history of all moves by both players and who won each round
        x a 2D array [[humanMove, computerMove, roundWinner], ...]
      - can also track scores directly, moving them out of the 'player' object.
        x refactor is necessary
      - Control parts of the UI by moving some score-related methods into it
      - pretty table for displaying move history at the end of the game
  x The scoreboard object is now the biggest because it is the main interface to
    the game itself. Scores, all console output, and history are part of it.
      
---history based assistant for computer moves---
  x A 'homunculus' (an archaic term that can be construed to apply to AI)
    - The homunculus is only an assistant for the computer,
      but has its own functions and variables, so it is its own object,
      but is only ever called by computer player functions
    - The homunculus HAS a ledger of moves (this.computer.assistant.ledger)
      x the ledeger is an array. It is initialized with 2 of every move.
        ['rock', 'rock', 'paper', 'paper', 'scissors', 'scissors', ...]
    - The homunculus DOES 3 things:
      x addWinningMoveToLedger() 
        - the homunculus reads the last scoreboard entry
        - if the computer won, add the computer's move to the ledger.
        - if the human won, figure out what move *would* have won, and add that
            value to the ledger (this is why the 'Other UPDATE' is necessary)
      x calculateWeights(<ledger Array>)
        - the hom. generates ratios for each possible move based on how many
          times it appears in the ledger
        - these ratios are collected into an object, and returned.
        - weights = {'rock': 0.18, 'paper': 0.27, 'scissors': 0.18, etc. etc.}
        - before returning this object, it is normalized.
          x the next step requires that all ratios (weights) add to 1, so...
          x the function adds the weights together, and subtracts that from 1
          x the remaining value (usually 0.01) is added to the highest value
            - similar to the idea of the 'angel's share' when aging alcohol
            - any weight that is lost in division MUST be added back for the 
                following weighted RNG function to work.
          x once the weights are normalized, the weights Object is returned
      x weightedRNG(<weights Object>)
        - this function is small and well known. 
        
            https://redstapler.co/javascript-weighted-random/
        - it calculates a random number based on the weights provided
        - this function will then return the associated move for the computer.
  : the function call for this logic chain is simple to understand and doesn't 
    require much modification of the already existing code.

  computerMove = weightedRNG(calculateWeights(ledger))
  : the ledger is the only permanently stored data
    - the object containing the weights is created in calculateWeights and 
      only exists until the weightedRNG function is complete.
*/

const readline = require('readline-sync');
const MAX_WINS = 5;
const VALID_CHOICES = ['rock', 'paper', 'scissors', 'lizard', 'spock'];
const WINNING_COMBOS = {
  rock: ['scissors', 'lizard'],
  paper: ['rock', 'spock'],
  scissors: ['paper', 'lizard'],
  lizard: ['paper', 'spock'],
  spock: ['rock', 'scissors'],
};

function createPlayer() {
  return {
    move: null,
  };
}
function createHomunculus() {
  return {
    ledger: VALID_CHOICES.concat(VALID_CHOICES),
    losingCombos: {
      rock: ['paper', 'spock'],
      paper: ['scissors', 'lizard'],
      scissors: ['rock', 'spock'],
      lizard: ['rock', 'scissors'],
      spock: ['paper', 'lizard'],
    },

    addWinningMoveToLedger(lastMove) {
      // lastMove = [humanMove, computerMove, winner]
      if (lastMove[2] === 'computer') this.ledger.push(lastMove[1]);
      else {
        let bestMove = this.losingCombos[lastMove[0]];
        this.ledger.push(bestMove[Math.round(Math.random())]);
      }
    },
    calculateWeights() {
      let weights = {
        rock: 0.2,
        paper: 0.2,
        scissors: 0.2,
        lizard: 0.2,
        spock: 0.2,
      };
      // code to update weights goes here.
      return weights;
    },
    // https://redstapler.co/javascript-weighted-random/
    weightedRNG(weightsObj) {
      let sum = 0;
      for (let value in weightsObj) {
        sum += weightsObj[value];
        if (Math.random() <= sum) return value;
      }
    },
  };
}

function createHuman() {
  let playerObject = createPlayer();

  let humanObject = {
    choose() {
      let choice;

      while (true) {
        console.log('Please choose rock, paper, scissors, lizard, or spock:');
        choice = readline.question().toLowerCase();
        if (VALID_CHOICES.includes(choice)) break;
        console.log('Sorry, invalid choice.');
      }
      this.move = choice;
    },
  };

  return Object.assign(playerObject, humanObject);
}

function createComputer() {
  let playerObject = createPlayer();

  let computerObject = {
    assistant: createHomunculus(),

    choose() {
      this.move = this.assistant.weightedRNG(this.assistant.calculateWeights());
    },

    checkLastMove(lastMoveArray) {
      this.assistant.addWinningMoveToLedger(lastMoveArray);
    },
  };

  return Object.assign(playerObject, computerObject);
}

function createScoreBoard() {
  return {
    history: [],
    humanScore: 0,
    computerScore: 0,

    updateBoard(lastMoveArray) {
      let winner = lastMoveArray[2];
      if (winner === 'human') this.humanScore++;
      if (winner === 'computer') this.computerScore++;
      this.history.push(lastMoveArray);
    },
    showCurrentScores() {
      console.log('Current score:');
      console.log(
        `\nHuman - ${this.humanScore} vs. Computer - ${this.computerScore}\n`,
      );
    },
    matchWinCheck(maxScore) {
      return this.humanScore === maxScore || this.computerScore === maxScore;
    },
    displayHistory() {
      console.log(
        'Player move'.padEnd(15, ' ') +
          'Computer move'.padEnd(18, ' ') +
          'Winner'.padEnd(15, ' '),
      );
      console.log('='.repeat(45));
      this.history.forEach((round) => {
        console.log(
          round[0].padEnd(15, ' ') +
            round[1].padEnd(18, ' ') +
            round[2].padEnd(15, ' '),
        );
      });
    },
    showWinner(maxScore) {
      if (this.humanScore === maxScore) {
        console.log('\nCongratulations, you win the match!');
      } else if (this.computerScore === maxScore) {
        console.log('\nSorry, the computer won this match.');
      } else {
        console.log('\nMatch forefit, the computer wins.');
      }
    },
  };
}

const RPSGame = {
  human: createHuman(),
  computer: createComputer(),
  board: createScoreBoard(),
  maxScore: MAX_WINS,

  displayWelcomeMessage() {
    console.log('Welcome to RPS!');
  },

  displayGoodbyeMessage() {
    console.log('Goodbye from RPS!');
  },

  mainGameLoop() {
    let humanMove = this.human.move;
    let computerMove = this.computer.move;
    let winner = '';

    console.log(`You chose: ${humanMove}`);
    console.log(`The computer chose: ${computerMove}`);

    if (WINNING_COMBOS[humanMove].includes(computerMove)) {
      winner = 'human';
      console.log('\nYOU win the round!\n');
    } else if (WINNING_COMBOS[computerMove].includes(humanMove)) {
      winner = 'computer';
      console.log('\nTHE COMPUTER wins the round!\n');
    } else {
      winner = 'tie';
      console.log('\nThis round is a TIE\n');
    }
    let lastMove = [humanMove, computerMove, winner];
    this.computer.checkLastMove(lastMove);
    this.board.updateBoard(lastMove);
  },

  playAgain() {
    console.log('Would you like to play again? (y/n)');
    let answer = readline.question();
    return answer.toLowerCase()[0] === 'y';
  },
  //game loop
  play() {
    this.displayWelcomeMessage();
    while (true) {
      this.human.choose();
      this.computer.choose();

      console.clear();
      this.mainGameLoop();
      this.board.showCurrentScores();
      console.log(this.computer.assistant.ledger); //testing

      if (this.board.matchWinCheck(this.maxScore)) break;
      if (!this.playAgain()) break;
      console.clear();
    }
    //endgame
    console.clear();
    this.board.displayHistory();
    this.board.showWinner(this.maxScore);
    this.displayGoodbyeMessage();
  },
};

RPSGame.play();
