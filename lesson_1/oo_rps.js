/*
LS 120 : Object Oriented RPS
Implement RPS using an Object Oriented structure
*/

/*
OO RPS Bonus Features:
---Keeping Score up to 5---
  The individual scores for both players are tracked by a 'scoreboard' object,
  which has several functions used by other bonus features. 5 wins is
  arbitrary, so this component was factored out to a global variable.

  ---Adding Lizard/Spock---
  Adding two additional moves increases the complexity of checking for the
  winning move. This check was converted from a multi-line if/or monster to
  a key/value lookup.
  x This does not require new code, just extending the existing code.

---Move history---
  A 'Scoreboard' object was used to implement game history, and to add
  to the metaphor, several functions relevant to the UI and scoring were
  moved into this object.

  A 2D array containing both players moves and the winner, as well as
  primitives for player scores were added as properties to the scoreboard
  object. A formatted table of the game history is displayed at the end.

---History-based assistant for computer moves---
  'homunculus' - term from alchemy for an 'artificial' being. This assistant
  only works for the computer player, but has several unique features so it
  was implemented as a sub-object to the computer player.

  The homunculus keeps a 'ledger' as a property. This ledger is initialized
  with two of every move. With each round, the homunculus looks at the
  result, and then adds to the ledger based on the move that would have allowed
  the computer to win.

  The homunculus calculates the weights it uses for the possible moves by how
  often the move appears in the ledger (ex if 'rock' is the winning move 3/11
  times in the ledger, then the weight for 'rock' will be .27 repeating).

  These weights are collected into an object and passed to another function
  that generates a move based on a random number and the current weights.

  The RNG function uses this formula to generate a move based on an object
  of weights. https://redstapler.co/javascript-weighted-random/ This formula
  requires that the sum of the weights is equal to 1, so the function that
  generates the weights adds the difference to a random move, if necessary.
*/

const readline = require('readline-sync');

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
        const bestMove = this.losingCombos[lastMove[0]];
        this.ledger.push(bestMove[Math.round(Math.random())]);
      }
    },

    getRatioForWord(word) {
      const { length } = this.ledger;
      const wordCount = this.ledger.reduce((acc, cur) => {
        if (cur === word) acc += 1; // eslint-disable-line no-param-reassign
        return acc;
      }, 0);
      return wordCount / length;
    },
    calculateWeights() {
      const weights = {
        rock: 0,
        paper: 0,
        scissors: 0,
        lizard: 0,
        spock: 0,
      };
      let weightTotal = 0;

      Object.keys(weights).forEach((move) => {
        weights[move] = this.getRatioForWord(move);
      });

      weightTotal = Object.values(weights).reduce((acc, cur) => acc + cur, 0);
      if (weightTotal !== 1) {
        const diff = 1 - weightTotal;
        const index = Math.floor(Math.random() * 5);
        weights[Object.keys(weights)[index]] += diff;
      }
      return weights;
    },
    // https://redstapler.co/javascript-weighted-random/
    weightedRNG(weightsObj) {
      const keys = Object.keys(weightsObj);
      let sum = 0;
      for (let idx = 0; idx < keys.length; idx += 1) {
        const move = keys[idx];
        sum += weightsObj[move];
        if (Math.random() <= sum) return move;
      }
      return '';
    },
  };
}

function createHuman() {
  const playerObject = createPlayer();

  const humanObject = {
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
  const playerObject = createPlayer();

  const computerObject = {
    assistant: createHomunculus(),

    choose() {
      this.move = this.assistant.weightedRNG(this.assistant.calculateWeights());
      console.log('choose ~ this.move', this.move);
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
      const winner = lastMoveArray[2];
      if (winner === 'human') this.humanScore += 1;
      if (winner === 'computer') this.computerScore += 1;
      this.history.push(lastMoveArray);
    },
    showCurrentScores() {
      console.log('Current score:');
      console.log(
        `Human - ${this.humanScore} vs. Computer - ${this.computerScore}`,
      );
    },
    matchWinCheck(maxScore) {
      console.log(`\nThe first to ${maxScore} wins the match.\n`);
      return this.humanScore === maxScore || this.computerScore === maxScore;
    },

    displayHistory() {
      // prettier-ignore
      console.log(
        'Player move'.padEnd(15, ' ')
          + 'Computer move'.padEnd(18, ' ')
          + 'Winner'.padEnd(15, ' '),
      );
      console.log('='.repeat(45));
      this.history.forEach((round) => {
        // prettier-ignore
        console.log(
          round[0].padEnd(15, ' ')
            + round[1].padEnd(18, ' ')
            + round[2].padEnd(15, ' '),
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
  maxScore: 5,

  displayWelcomeMessage() {
    console.log('Welcome to RPS!');
  },

  displayGoodbyeMessage() {
    console.log('Goodbye from RPS!');
  },

  mainGameLoop() {
    const humanMove = this.human.move;
    const computerMove = this.computer.move;
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
    const lastMove = [humanMove, computerMove, winner];
    this.computer.checkLastMove(lastMove);
    this.board.updateBoard(lastMove);
  },

  playAgain() {
    console.log('Would you like to play again? (y/n)');
    const answer = readline.question();
    return answer.toLowerCase()[0] === 'y';
  },
  // game loop
  play() {
    this.displayWelcomeMessage();
    while (true) {
      this.human.choose();
      this.computer.choose();

      console.clear();
      this.mainGameLoop();
      this.board.showCurrentScores();

      if (this.board.matchWinCheck(this.maxScore)) break;
      if (!this.playAgain()) break;
      console.clear();
    }
    // endgame
    console.clear();
    this.board.displayHistory();
    this.board.showWinner(this.maxScore);
    this.displayGoodbyeMessage();
  },
};

RPSGame.play();
