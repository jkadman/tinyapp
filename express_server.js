const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser')

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const generateRandomString = function() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

// a helper function to find user by email
const getUserByEmail = function(email, userObject) {
  for (let user in userObject) {
    if (email === userObject[user].email) {
      return true;
    }
  }
}

// a helper function to find a users password
const findPassword = function(password, userObject) {
  for (let user in userObject) {
    if (password === userObject[user].password) {
      return true;
    }
  }
}

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// user object
const users = {
  userId : {
    id: 'Jack',
    email: 'Jack@ham.ca',
    password: '5678'
  },
  jkl : {
    id: 'fred',
    email: 'fred@ham.ca',
    password: 'nert'
  }
}

// make data readable
app.use(express.urlencoded({ extended: true }));

// add route for /urls
app.get('/urls', (req, res) => {
  const templateVars = { 
    user_id: req.cookies['user_id'],
    urls: urlDatabase,
    users: users
  };
  res.render('urls_index', templateVars);
});

// for submitting a new url to be shortened
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user_id: req.cookies['user_id'],
    users: users
  };
  res.render('urls_new', templateVars);
});

// access the registration page
app.get('/register', (req, res) => {
  const templateVars = {
    user_id: req.cookies['user_id'],
    users: users
  };
  res.render('register', templateVars);
});

// register as a new user
app.post('/register', (req, res) => {
  userEmail = req.body.email;
  userPassword = req.body.password;
  if (!userEmail || !userPassword) {
    return res.status(400).send('Please enter a valid user_id and password.');
  } 
  
  if (getUserByEmail(userEmail, users)) {
    return res.status(400).send('User already exists');
  }

  const uniqueId = generateRandomString();
  
  users[uniqueId] = {
    id: uniqueId, 
    email: userEmail, 
    password: userPassword
  };
  res.cookie('user_id', uniqueId);
  res.redirect('urls');

});

// login page
app.get('/login', (req, res) => {
  
  templateVars = {
    user_id: req.cookies['user_id'],
    //userEmail: users[uniqueId].email
  }
  
  res.render('login', templateVars)
});

app.post('/login', (req, res) => {
  userEmail = req.body.email;
  userPassword = req.body.password;
  uniqueId = req.cookies['user_id']

  if (!getUserByEmail(userEmail, users)) {
    return res.status(403).send('no user by that email');
  }
  if (!findPassword(userPassword, users)) {
    
    return res.status(403).send('password not correct');
  }
  if (getUserByEmail(userEmail, users) === true && findPassword(userPassword, users) === true) {
    res.cookie('user_id', uniqueId)
    return res.redirect('urls')
  }

});

// problems: logout page is going nowhere




// add a new URL to be shortened
app.post('/urls', (req, res) => {
  const newID = generateRandomString();
  const newURL = req.body.longURL;
  urlDatabase[newID] = newURL;  
  // res.render('urls_show', { id: newID, longURL: newURL });
  return res.redirect(`/urls/${newID}`)
});

// redirect to the longURL by clicking on the shortened one
app.get("/u/:id", (req, res) => {
  const urlID = req.params.id
  const longURL = urlDatabase[urlID];
  templateVars = {
    user_id: req.cookies["user_id"],
    users: users
  }
  res.redirect(longURL, templateVars);
});


// Logout Route
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  return res.redirect('urls');
})


// add a delete request
app.post('/urls/:id/delete', (req, res) => {
  const urlID = req.params.id;
  delete urlDatabase[urlID];
  res.redirect('urls')
})


// Update Request
app.post('/urls/:id', (req, res) => {
  
  let urlID = req.params.id;
  const longURL = urlDatabase[urlID];
  const newURL = req.body.newURL

  urlDatabase[urlID] = newURL
  
  res.redirect(`urls`);
});

// add route for /urls/:id
app.get('/urls/:id', (req, res) => {
  const urlID = req.params.id;
  const originURL = urlDatabase[urlID];
  const templateVars = { 
    user_id: req.cookies["user_id"],
    id: urlID, 
    longURL: originURL,
    users: users
  };
  res.render('urls_show', templateVars);
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});