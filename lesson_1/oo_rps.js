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

---Move history + history based computer moves---
  These features seem tightly linked and should be designed together.
  UPDATE: I was wrong. A full game history alone doesn't include the
  necessary parts for a functional move suggestor.
  Other UPDATE: The huge if statement to dermine who won based on moves
    will need to be replaced with the much simpler global object of win
    conditions used in the JS101 RPS solution for this to work
  x History:
    - scoreBoard object
      HAS 2D array to store both moves and winner (comp, hume, tie) per round
      HAS a display (UI)

  x History-based moves homunculus
    (Homunculus is a very very old term that can be construed to apply to AI)
    - The homunculus is its own object, separate from the scoreboard
    - The homunculus HAS a ledger of moves (this.homunculus.ledger?)
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
    score: 0,
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
  //NOTE: Object.assign copies properties from arg1 (source) to arg2 (target)
}

function createComputer() {
  let playerObject = createPlayer();

  let computerObject = {
    choose() {
      let randomIndex = Math.floor(Math.random() * VALID_CHOICES.length);
      this.move = VALID_CHOICES[randomIndex];
    },
  };

  return Object.assign(playerObject, computerObject);
}
/*
HAS 2D array to store both moves and winner (comp, hume, tie) per round
DOES a display (UI)
*/
const scoreBoard = {
  history: [],

  displayWinner() {},
  compareMoves(humanMove, computerMove) {}, // returns [humMov,compMov,W/L/D]
  updateBoard(compareMovesArray) {},
  showWinner(humanScore, computerScore, maxScore) {
    if (humanScore === maxScore) {
      console.log('Congratulations, you win the match!');
    } else if (computerScore === maxScore) {
      console.log('Sorry, the computer won this match.');
    } else {
      console.log('Match forefit, the computer wins.');
    }
  },
};

const RPSGame = {
  human: createHuman(),
  computer: createComputer(),
  maxScore: 5, // first to 'n' wins, determined by game logic not scoreboard

  displayWelcomeMessage() {
    console.log('Welcome to RPS!');
  },

  displayGoodbyeMessage() {
    console.log('Goodbye from RPS!');
  },

  /*
  move if statement of main game loop to scoreBoard.
  also allows for building a move history on scoreboard,
  also allows building a simple UI.
  logs the result as part of the UI, and also updates the game history
  the homonculus can build the ledger from the scoreboard
  */
  mainGameLoop() {
    let humanMove = this.human.move;
    let computerMove = this.computer.move;
    // the following should be a scoreBoard function
    // moving the whole function would require passing a lot.
    // two nested functions: updateBoard(compareMoves(humanMove, computerMove))?
    console.log(`You chose: ${this.human.move}`);
    console.log(`The computer chose: ${this.computer.move}`);

    if (WINNING_COMBOS[humanMove].includes(computerMove)) {
      this.human.score++;
      console.log('You win!');
    } else if (WINNING_COMBOS[computerMove].includes(humanMove)) {
      this.computer.score++;
      console.log('Computer wins!');
    } else {
      console.log("It's a tie");
    }
  },

  playAgain() {
    console.log('Would you like to play again? (y/n)');
    let answer = readline.question();
    return answer.toLowerCase()[0] === 'y';
  },

  play() {
    this.displayWelcomeMessage();
    while (true) {
      this.human.choose();
      this.computer.choose();
      this.mainGameLoop(); // move to scoreboard object? partly.
      // move log statement to scoreboard? yes.
      console.log(
        `Current scores: Human: ${this.human.score}, Computer: ${this.computer.score}`,
      );
      // can this if statement be moved to a scoreboard function?
      // yes, uses magic number. something like
      // scoreBoard.matchWinCheck(humanScore, computerScore, maxScore)
      if (this.human.score === 5 || this.computer.score === 5) break;
      if (!this.playAgain()) break;
    }

    scoreBoard.showWinner(this.human.score, this.computer.score, this.maxScore);
    this.displayGoodbyeMessage();
  },
};

RPSGame.play();
