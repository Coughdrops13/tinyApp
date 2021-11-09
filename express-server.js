const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};
const generateRandomString = function() {
  const shortURL = Math.random().toString(16).substr(2, 6);
  return shortURL;
};

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.post('/urls', (req, res) => {
  // console.log(req.body);
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL; 
  // console.log(urlDatabase);
  res.redirect(302, `/urls/${newShortURL}`);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  // console.log(templateVars);
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = (req.params.shortURL);
  const longURL = urlDatabase[shortURL];
  // console.log(longURL);
  res.redirect(longURL);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
