const express = require('express');
const app = express();
const mustacheExpress = require('mustache-express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');


app.engine('mustache', mustacheExpress());
app.set('views', './views');
app.set('view engine', 'mustache');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.use(express.static("public"));


app.use(session({
  secret: 'keyboard gunther',
  resave: false,
  saveUninitialized: true
}));

const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");

let game = {
  word: getWord(),
  displayWord: [],
  guesses: 8,
  lettersGuessed: [],
  endMessage: "",
  missedLetters: [],
  endResult: ""
};


app.get('/', function(req, res) {
  game.displayWord = wordHandler(game.word, game.lettersGuessed);
  if (isGameOver(res)) {
    console.log(game.displayWord);
    console.log(game.word);
    game.missedLetters = getUnsuccesfulDisplayWord();
    res.render('gameOver', game);
  } else {
    res.render('index', game);
  }
});

app.post('/guess', function(req, res) {
  if (isGameOver()) {
    game = newGame();
    console.log(game.word);
    res.redirect('/');
  } else {
    if (!game.lettersGuessed.includes(req.body.guess)) {
      game.lettersGuessed.push(req.body.guess);
      guessCount(req.body.guess);
    }
    res.redirect('/');
  }
});



function getWord() {
  var word = words[Math.floor(Math.random()*words.length)];
  return word;
}

function wordHandler(word, letters) {
  var displayWord = [];
  for(var i = 0; i < word.length; i++) {
    if(letters.includes(word[i])) {
      displayWord.push(word[i]);
    } else {
      displayWord.push('_');
    }
  }
  return displayWord;
}

function guessCount(guess) {
  let splitWord = game.word.split("");
  if (!splitWord.includes(guess)) {
    game.guesses --;
  }
}

// function hasBeenGuessed(x) {
//   let answer = game.lettersGuessed.find(function(element) {return element === guess});
//   console.log(answer);
// }

function isGameOver() {
  if (game.guesses === 0) {
    game.endMessage = "You Lose!";
    game.endResult = "failure";
    return true;
  } else if (!game.displayWord.includes("_")) {
    game.endMessage = "You Win!";
    game.endResult = "success";
    return true;
  }
  return false;
}

function getUnsuccesfulDisplayWord() {
  const unsuccessfulDisplayWord = [];
  for (let i = 0; i < game.word.length; i++) {
    unsuccessfulDisplayWord.push({
      letter: game.word[i],
      className: game.word[i] === game.displayWord[i] ? "" : "not-guessed"
    });
  }
  return unsuccessfulDisplayWord;
}

function newGame() {
  var newGame = {
    word: getWord(),
    displayWord: "",
    guesses: 8,
    lettersGuessed: [],
    endMessage: "",
    missedLetters: []
  };
  return newGame;
}



app.listen(3000, function() {
  console.log("Woohoo");
  console.log(game.word);
});
