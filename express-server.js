const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
// const cookieSession = require('cookie-session');
const PORT = 8080;
const { findUserByEmail, generateRandomString } = require('./helpers');
const urlDatabase = {
  'b2xVn2': {
   longURL: 'http://www.lighthouselabs.ca',
   userID: 'default',
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'default',
  },
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
// const generateRandomString = function() {
//   const shortURL = Math.random().toString(16).substr(2, 6);
//   return shortURL;
// };
// const lookupPassword = function(userPassword, user) {
//     if (user.password === userPassword) {
//       return true;
//     }
//     return null;
// };
// const findUserByEmail = function(email, users) {
//   for (const key in users) {
//     if (users[key].email === email) {
//       return users[key];
//     }
//   }
//   return null;
// };

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');


// not much going on here
app.get('/', (req, res) => {
  res.send('Hello!');
});

// GET /login
// __TEMPLATEVARS__: user
// checks to see if user is logged in based on user_id cookie. if there is a cookie, then logged in
  // also if logged in, redirects to: /urls (GET /urls)
// renders: login.ejs
app.get('/login', (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  const templateVars = { user, };
  if (user) {
    return res.redirect('/urls');
  } else {
    return res.render('login', templateVars);
  }
});


// POST /login
// should check to see if user exists based on input email.
// if user does not exist, sends error that "email is not registered"
// if user exists, check to see if input password matches password in user object
// if it matches, user_id cookie is created and redirects to: /urls (GET urls)
// if it does not match, sends error "incorrect password"
// if it reaches the end before triggering one of the previous scenarios, sends error "something went really wrong"
app.post('/login', (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  if (userEmail === '' || userPassword === '') {
    return res.status(400).send('email and password must be specified')
  }

  const user = findUserByEmail(userEmail, users);
  
  if (!user) {
    return res.status(403).send('Unregistered Email');
  }
  bcrypt.compare(userPassword, user.password, (err, success) => {
    if(!success){
      return res.status(400).send('password does not match')
    }
  });
  // if(!lookupPassword(userPassword, user)) {
  //   return res.status(403).send('Incorrect Password');
  // }
  res.cookie('user_id', user.id);
  return res.redirect('/urls');
});


// POST /logout
// just a logout button that should appear in _header.ejs IF logged in (should already be taken care of in _header.ejs)

// *** Question: how does _header.ejs check user on line 12

// clears cookies
// redirects to: /urls (GET /urls)
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});


// GET /register
// __TEMPLATEVARS__: user
// render: registration.ejs
app.get('/register', (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  const templateVars = { user, };
  res.render('registration', templateVars);
});


// POST /register
// should take email and check if user already exists in users object using lookupByEmail()
// if no input in either email or password input, sends error saying to enter stuff
// if email exists, error should be sent saying that email already registered
// if email does not exist creates userID and new user object in users object
// also, a user_id cookie is made based on new userID
// redirects to: /urls (GET /url)
app.post('/register', (req, res) => {
  const userEmail = req.body.email;
  const user = findUserByEmail(userEmail, users);
  if(user) {
    return res.status(303).send('email already registered')
  }
  const userPassword = req.body.password;
  if (userEmail === '' || userPassword === '') {
    return res.status(400).send('email and password must be specified')
  }
  if(!user) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(userPassword, salt, (err, hash) => {
  
        const newUserID = generateRandomString();
        const newUser = {
          id: newUserID,
          email: req.body.email,
          password: hash,
        };
        users[newUserID] = newUser;
        res.cookie('user_id', newUserID)
        res.redirect('/urls');
      })
    })
  }
});


// GET /urls ... this is the only route that renders urls_index.ejs
// __TEMPLATEVARS__: urls, ????longURLs???, user
// renders: urls_index.ejs
app.get('/urls', (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  console.log('USERS OBJ:', users);
  if (!user) {
    const templateVars = { urls: {}, user };
    return res.render('urls_index', templateVars)
  }
  const filteredUrls = {};
  for(const url in urlDatabase){
    if (urlDatabase[url].userID === userID){
      filteredUrls[url] = {
        longURL: urlDatabase[url].longURL,
        userID: userID,
      }
    }
  }
  const templateVars = { urls: filteredUrls, user, };
  return res.render('urls_index', templateVars);
});


// POST /urls
// should check to see if a user is logged in using user_id cookie
// if not logged in, sends error "you must be logged in to create URLs"
// if logged in creates a new shortURL using generateRandomString()
// assigns longURL to urlDatabase[shortURL].longURL (urls_index.ejs then adds this to its page)
// then sends code 302 (found) and redirects to: /urls/whatever the new shortURL is
app.post('/urls', (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  if (!user) {
    return res.status(401).send('you must be logged in to create urls')
  }
  const longURL = req.body.longURL
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = {
    'longURL': longURL,
    'userID': userID,
  };
  res.redirect(302, `/urls/${newShortURL}`);
});


// GET /urls/new
// __TEMPLATEVARS__: user
// should check to see if logged in using user_id cookie
// if not logged in redirects to: login
// if logged in, renders: urls_new.ejs
app.get('/urls/new', (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  const templateVars = { user, };
  // if (!user) {
  //   res.status().redirect('/login');
  // }
  res.render('urls_new', templateVars);
});

// GET /urls/:shortURL
// __TEMPLATEVARS__: shortURL(from req.params.shortURL), longURL(from urlDatabase[shortURL(req.params.shortURL)].longURL, user)
// probably make a variable to hold req.params.shortURL called shortURL
// should check if shortURL exists with if(urlDatabase[shortURL]
// if it does not exist, redirects to: /urls/new (GET /urls/new)
// if it does exist renders: urls_show.ejs
app.get('/urls/:shortURL', (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  const shortURL = req.params.shortURL;
  if(!urlDatabase[shortURL]) {
    return res.status(404).send('no such short url in datbase');
  }
  const templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL].longURL, user, };
  if(urlDatabase[shortURL]) {
    console.log('urlDatabase:', urlDatabase);
    return res.render('urls_show', templateVars);
  }
  return res.render('urls_new', templateVars);
});


// WILL BE AFFECTED BY URLDATA
// POST /urls/:shortURL/edit
// should check to see if logged in using user_id cookie
// if not logged in sends error "you must be logged in to edit urls"
// if logged in:
// assigns req.params.shortURL to shortURL variable
// assigns req.body.newLongURL to longURL
// updates the urlDatabase - urlDatabase[shortURL] = longURL
// redirects to: /urls (GET /urls)
app.post('/urls/:shortURL/edit', (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  if(!user) {
    return res.status(401).send('must be logged in to edit urls')
  }
  const shortURL = req.params.shortURL;
  const longURL = req.body.newLongURL;
  if (urlDatabase[shortURL].userID !== userID) {
    return res.send(401).send('only your urls can be edited by you');
  }
  urlDatabase[shortURL].longURL = longURL;
  return res.redirect('/urls');
});

app.get('/urls/:shortURL/delete', (req, res) => {
  const userID = req.cookies.user_id;
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID !== userID) {
    return res.send(401).send('only your urls can be deleted by you');
  }
});
// POST /urls/:shortURL/delete
// assigns req.params.shortURL to variable shortURL
// uses express's delete to delete urlDatabase[shortURL]
// redirects to: /urls (GET /urls) which should now contain one less url
app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  if(!user) {
    return res.status(401).send('must be logged in to delete urls')
  }
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID !== userID) {
    return res.send(401).send('only your urls can be deleted by you');
  }
  delete urlDatabase[shortURL];
  return res.redirect('/urls');
});


// GET /u/:shortURL
// assigns req.params.shortURL to variable to shortURL
// assigns urlDatabase[shortURl] to variable longURL
// should check to see if urlDatabase[shortURL] exists
// if it does not redirects to: /urls (GET /urls)
// if it does exist, redirects to: longURL
app.get('/u/:shortURL', (req, res) => {
  const shortURL = (req.params.shortURL);
  const longURL = urlDatabase[shortURL].longURL;
  if (!urlDatabase[shortURL]) {
    return res.redirect('/urls');
  }
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