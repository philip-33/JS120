/*
LS 120 : Object Oriented RPS
Implement RPS using an Object Oriented structure
*/

/*
OO RPS Bonus Features:
Keeping Score up to 5: 
High level overview: Currently the game loops 1 time and displays the winner.
If keeping score up to 5 wins, the game will need to track the score for both 
players and automatically end if 5 wins are reached by either player.

new object or state?
  tracking the scores of each player seems like a state (PLAYER has a SCORE)
    and also a method to get the score. These could be added to createPlayer().
    score comparison would use a method, .getScore() 
  a new 'score' object would need to track both players and have logic to   
    increment win counts separately.
  The separate scoreboard object could work...
    but including the score and it's methods part of the createPlayer() object factory is a cleaner fit that requires less mental and technical overhead.

  Once the score can be kept, a looping structure based on the winning score 
  can be included in the gameplay loop (which already exists). This Winning
  Condition would naturally be part of the RPS game object itself since 
  a GAME has a WINNING CONDITION.
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
        console.log('Please choose rock, paper, or scissors:');
        choice = readline.question();
        if (['rock', 'paper', 'scissors'].includes(choice)) break;
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
      const choices = ['rock', 'paper', 'scissors'];
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
      (humanMove === 'paper' && computerMove === 'rock') ||
      (humanMove === 'scissors' && computerMove === 'paper')
    ) {
      this.human.score++;
      console.log('You win!');
    } else if (
      (humanMove === 'rock' && computerMove === 'paper') ||
      (humanMove === 'paper' && computerMove === 'scissors') ||
      (humanMove === 'scissors' && computerMove === 'rock')
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
