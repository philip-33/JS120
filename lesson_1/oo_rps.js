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
*/

const readline = require('readline-sync');

function createPlayer() {
  //template object factory with components common to all players
  return {
    move: null,
    score: 0,

    getScore: function () {
      return this.score;
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
        if (['rock', 'paper', 'scissors', 'lizard', 'spock'].includes(choice))
          break;
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
      const choices = ['rock', 'paper', 'scissors', 'lizard', 'spock'];
      let randomIndex = Math.floor(Math.random() * choices.length);
      this.move = choices[randomIndex];
    },
  };

  return Object.assign(playerObject, computerObject);
}

const RPSGame = {
  // this data structure is an object that contains all
  // game properties, rules, and logic.
  human: createHuman(),
  computer: createComputer(),
  winningScore: 5,

  displayWelcomeMessage() {
    console.log('Welcome to RPS!');
  },

  displayGoodbyeMessage() {
    console.log('Goodbye from RPS!');
  },

  displayWinner() {
    let humanScore = this.human.getScore();
    let computerScore = this.computer.getScore();
    if (humanScore === 5) {
      console.log('Congratulations, you win the match!');
    } else if (computerScore === 5) {
      console.log('Sorry, the computer won this match.');
    } else {
      console.log('Match forefit, the computer wins.');
    }
  },

  mainGameLoop() {
    //renamed so displayWinner() can just display the winner
    let humanMove = this.human.move;
    let computerMove = this.computer.move;

    console.log(`You chose: ${this.human.move}`);
    console.log(`The computer chose: ${this.computer.move}`);

    if (
      (humanMove === 'rock' && computerMove === 'scissors') ||
      (humanMove === 'rock' && computerMove === 'lizard') ||
      (humanMove === 'paper' && computerMove === 'rock') ||
      (humanMove === 'paper' && computerMove === 'spock') ||
      (humanMove === 'scissors' && computerMove === 'paper') ||
      (humanMove === 'scissors' && computerMove === 'lizard') ||
      (humanMove === 'lizard' && computerMove === 'paper') ||
      (humanMove === 'lizard' && computerMove === 'spock') ||
      (humanMove === 'spock' && computerMove === 'rock') ||
      (humanMove === 'spock' && computerMove === 'scissors')
    ) {
      this.human.score++;
      console.log('You win!');
    } else if (
      (computerMove === 'rock' && humanMove === 'scissors') ||
      (computerMove === 'rock' && humanMove === 'lizard') ||
      (computerMove === 'paper' && humanMove === 'rock') ||
      (computerMove === 'paper' && humanMove === 'spock') ||
      (computerMove === 'scissors' && humanMove === 'paper') ||
      (computerMove === 'scissors' && humanMove === 'lizard') ||
      (computerMove === 'lizard' && humanMove === 'paper') ||
      (computerMove === 'lizard' && humanMove === 'spock') ||
      (computerMove === 'spock' && humanMove === 'rock') ||
      (computerMove === 'spock' && humanMove === 'scissors')
    ) {
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
    // this specific method is the main game loop
    // the 'game' doesn't 'start' until this method is called.
    this.displayWelcomeMessage();
    while (true) {
      this.human.choose();
      this.computer.choose();
      this.mainGameLoop();
      console.log(
        `Current scores: Human: ${this.human.getScore()}, Computer: ${this.computer.getScore()}`,
      );
      if (this.human.getScore() === 5 || this.computer.getScore() === 5) break;
      if (!this.playAgain()) break;
    }
    this.displayWinner();
    this.displayGoodbyeMessage();
  },
};

RPSGame.play();
