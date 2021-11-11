const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};
const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};
const generateRandomString = function() {
  const shortURL = Math.random().toString(16).substr(2, 6);
  return shortURL;
};
const lookupEmail = function(userEmail) {
  for (const key in users) {
    if (users[key].email === userEmail) {
      return true;
    }
  }
  return false;
};
const lookupPassword = function(userPassword) {
  for (const key in users) {
    if (users[key].password === userPassword) {
      return true;
    }
  }
  return false;
};
const loginVerifier = function(userEmail, userPassword) {
  for (const key in users) {
    if (users[key].email === userEmail && users[key].password === userPassword) {
      
      return users[key].id;
    }
  }
  return false;
};
const findUserByEmail = function(email, users) {
  for (const key in users) {
    if (users[key].email === email) {
      return users[key];
    }
  }
  // if no user, go to register
  // if user, check that user password matches given password

  // in register: if user is found go to login, else create new user
};

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/login', (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  const templateVars = { user, };
  if (user) {
    res.redirect('/urls');
  } else {
  res.render('login', templateVars);
  }
});

app.post('/login', (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userID = loginVerifier(userEmail, userPassword);
  if(!lookupEmail(userEmail)) {
    return res.status(403).send('Incorrect Email');
  }
  if (!lookupPassword(userPassword)) {
    return res.status(403).send('Incorrect Password');
  }
  if (userID) {
    res.cookie('user_id', userID);
    return res.redirect('/urls');
  } 
  return res.status(500).send('something went really wrong');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  const templateVars = { user, };
  res.render('registration', templateVars);
});

app.post('/register', (req, res) => {
  const newUserID = generateRandomString();
  const newUser = {
    id: newUserID,
    email: req.body.email,
    password: req.body.password,
  };
  

  if(lookupEmail(newUser.email)) {
    return res.status(400).send('email already exists');
  }
  if (newUser.email === '' || newUser.password === '') {
    return res.status(400).send('enter stuff');
  }
  users[newUserID] = newUser;
  // console.log(users);
  res.cookie('user_id', newUserID)
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  // console.log(req.cookies);
  console.log('USERS OBJ:', users);
  const userID = req.cookies.user_id;
  const user = users[userID];
  const templateVars = { urls: urlDatabase, user, };
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
  const userID = req.cookies.user_id;
  const user = users[userID];
  const templateVars = { user, };
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user, };
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