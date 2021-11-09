const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};
const generateRandomString = function() {
  const shortURL = Math.random().toString(16).substr(2, 6);
  return shortURL;
};

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  // console.log(req.cookies);
  const templateVars = { urls: urlDatabase, username: req.cookies['username'], };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  // console.log(req.body);
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL; 
  // console.log(urlDatabase);
  res.redirect(302, `/urls/${newShortURL}`);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { username: req.cookies['username'], };
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies['username'] };
  // console.log(templateVars);
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL/edit', (req, res) => {
  console.log(req.body.newLongURL);
  const longURL = req.body.newLongURL;
  urlDatabase[req.params.shortURL] = longURL;
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = (req.params.shortURL);
  const longURL = urlDatabase[shortURL];
  if (!urlDatabase[shortURL]) {
    return res.redirect('/urls');
  }
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
