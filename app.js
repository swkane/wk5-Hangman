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

app.use(express.static(__dirname + '/public'));

app.use(session({
  secret: 'keyboard gunther',
  resave: false,
  saveUninitialized: true
}));

const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");

let game = {
  word: getWord(),
  displayWord: "",
  guesses: 8,
  lettersGuessed: [],
  endMessage: ""
};



app.get('/', function(req, res) {
  game.displayWord = wordHandler(game.word, game.lettersGuessed);
  if (isGameOver(res)) {
    res.render('gameOver', game);
  } else {
    res.render('index', game);
  }
});

app.post('/guess', function(req, res) {
  game.lettersGuessed.push(req.body.guess);
  game.displayWord = wordHandler(game.word, game.lettersGuessed);
  guessCount(req.body.guess);
  res.redirect('/');
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

function isGameOver() {
  if (game.guesses === 0) {
    game.endMessage = "You Lose!";
    return true;
  } else if (!game.displayWord.includes("_")) {
    game.endMessage = "You Win!";
    return true;
  }
  return false;
}



app.listen(3000, function() {
  console.log("Woohoo");
  console.log(game.word);
});
