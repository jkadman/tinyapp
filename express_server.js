//Require
const express = require('express');
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const getUserByEmail = require('./helpers');

// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'user_id',
  keys: ['key_1', 'key_2'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// function to generate random string
const generateRandomString = function() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
};

//function for comparing logged in userID to the userID in the database
const urlsForUser = function(id) {
  let userURLs = {};
  for (let key in urlDatabase) {
    if (id === urlDatabase[key].userID) {
      userURLs[key] = urlDatabase[key];
    }
  }
  return userURLs;
};

// url database example
let urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID:  "i9ov4r"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: 'k4l07f'
  }
};

// user object example
const users = {
  i9ov4r : {
    id: 'i9ov4r',
    email: 'Jack@ham.ca',
    password: '5678'
  },
  k4l07f : {
    id: 'k4l07f',
    email: 'fred@ham.ca',
    password: 'nert'
  }
};

// make data readable
app.use(express.urlencoded({ extended: true }));

// add route for /urls
app.get('/urls', (req, res) => {
  
  const user_id = req.session['user_id'];

  // can't see urls if not logged in
  if (!user_id) {
    res.send('Must be logged in to access URLs');
  }
  
  const userEmail = users[user_id].email;

  // if it is the userID, then the URL

  const newDatabase = urlsForUser(user_id);
  
  const templateVars = {
    user_id,
    urls: newDatabase,
    userEmail,
  };
      
  res.render('urls_index', templateVars);
    
});

// access the registration page
app.get('/register', (req, res) => {
  
  const user_id = req.session['user_id'];

  // if user is already logged in
  if (user_id) {
    return res.redirect('/urls');

  }

  const userEmail = users[user_id];
    
  const templateVars = {
    userEmail
  };

  res.render('register', templateVars);
});

// register as a new user
app.post('/register', (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const foundUser = getUserByEmail(userEmail, users);
  
  if (!userEmail || !userPassword) {
    return res.status(400).send('Please enter a valid user_id and password.');
  }

  if (foundUser) {
    if (userEmail === foundUser.email) {
      return res.status(400).send('User already exists');
    }
  }
  const user_id = generateRandomString();

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(userPassword, salt);
   
  users[user_id] = {
    id: user_id,
    email: userEmail,
    password: hashedPassword
  };

  req.session.user_id = user_id;

  res.redirect('urls');

});

// login page
app.get('/login', (req, res) => {

  // if user is already logged in
  if (req.session['user_id']) {
    res.redirect('/urls');
    return;
  }

  const templateVars = {
    userEmail: users[req.session['user_id']]
  };
  
  res.render('login', templateVars);
});


// Login request
app.post('/login', (req, res) => {
  
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  const foundUser = getUserByEmail(userEmail, users);

  const passwordMatch = bcrypt.compareSync(userPassword, foundUser.password);

  // if the email inputed doesn't exist
  if (!foundUser) {
    return res.status(403).send('no user by that email');
  }

  // if the password is wrong
  if (!passwordMatch) {
    return res.status(403).send('password not correct');
  }

  req.session.user_id = foundUser.id;
  return res.redirect('/urls');

});

// for submitting a new url to be shortened
app.get('/urls/new', (req, res) => {

  const user_id = req.session['user_id'];

  // if not logged in
  if (!user_id) {
    
    return res.redirect('/login');

  }

  const userEmail = users[user_id];
  const templateVars = {
    user_id: req.session['user_id'],
    userEmail: userEmail.email
  };

  return res.render('urls_new', templateVars);
  
});

// add a new URL to be shortened
app.post('/urls', (req, res) => {

  const user_id = req.session['user_id'];

  // if not logged in
  if (!user_id) {
    return res.status(401).send('non registered users are not able to make new shortened URLs');
  }

  const newID = generateRandomString();
  const newURL = req.body.longURL;
  
  urlDatabase[newID] = {
    longURL: newURL,
    userID: user_id
  };
  
  return res.redirect(`/urls/${newID}`);
});

// redirect to the longURL by clicking on the shortened one
app.get("/u/:id", (req, res) => {

  const urlID = req.params.id;
  const longURL = urlDatabase[urlID].longURL;

  //if the URL doesn't exist
  if (!longURL) {
    res.status(400).send('Short url does not exist');
  }

  res.redirect(longURL);
});


// Logout Route
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  return res.redirect('login');
});


// add a delete request
app.post('/urls/:id/delete', (req, res) => {
  const urlID = req.params.id;
  const user_id = req.session['user_id'];

  // if user is not associated with the url in question
  if (!urlDatabase[urlID]) {
    return res.status(404).send('This URL does not exist');
  }

  // if user is authenticated to make changes
  if (urlDatabase[urlID].userID === user_id) {
    delete urlDatabase[urlID];
  } else {
    return res.status(403).send('You are forbidden.');
  }

  return res.redirect('/urls');
    
});

// Update Request
app.post('/urls/:id', (req, res) => {
  const user_id = req.session['user_id'];
  let urlID = req.params.id;
  
  // if user is not logged in
  if (!user_id) {
    res.status(403).send('Please login');
  }

  // if a non authorized user tries to make changes
  if (users[user_id].id !== urlDatabase[urlID].userID) {
    return res.status(403).send('You are forbidden.');
  
  }
  
  const newURL = req.body.newURL;
  
  urlDatabase[urlID].longURL = newURL;

  res.redirect(`/urls`);
  
});

// add route for /urls/:id
app.get('/urls/:id', (req, res) => {
  const urlID = req.params.id;
  
  const user_id = req.session['user_id'];
  
  // if url doesn't exist
  if (!urlDatabase[urlID]) {
    return res.status(404).send('This URL does not exist, please enter a valid URL');
  }

  // non user tries to access short URL
  if (!user_id) {
    return res.status(403).send('Please login');
  }

  // User other than the owner of the URL tries to access short URL
  if (users[user_id].id !== urlDatabase[urlID].userID) {
    return res.status(403).send('You are forbidden.');
  }

  const originURL = urlDatabase[urlID];
  
  const userEmail = users[user_id];

  const templateVars = {
    user_id: user_id,
    userEmail: userEmail.email,
    id: urlID,
    originURL,
  };
  res.render('urls_show', templateVars);
});

// access a page that doesn't exist
app.use((req, res) => {
  res.status(404).send("Sorry can't find that!");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
