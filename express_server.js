const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser')

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


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
    username: req.cookies['user_id'],
    urls: urlDatabase,
    users: users
  };
  res.render('urls_index', templateVars);
});

// for submitting a new url to be shortened
app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies['user_id'],
    users: users
  };
  res.render('urls_new', templateVars);
});

// access the registration page
app.get('/register', (req, res) => {
  const templateVars = {
    username: req.cookies['user_id'],
    users: users
  };
  res.render('register', templateVars);
});

// register as a new user
app.post('/register', (req, res) => {
  // const templateVars = {
  // username: req.cookies['username']
  // };
  const uniqueId = generateRandomString();
  users[uniqueId] = {
    id: uniqueId, 
    email: req.body.email, 
    password: req.body.password
  };
  
  res.cookie('user_id', uniqueId);

  console.log(users[uniqueId])
  console.log(users);

  res.redirect('urls');
});

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
    username: req.cookies["user_id"],
    users: users
  }
  res.redirect(longURL, templateVars);
});

// Login Route
app.post('/login', (req, res) => {
  res.cookie('user_id', uniqueId);
  templateVars = {
    users: users
  };
  return res.redirect('/urls')
})

// Logout Route
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  return res.redirect('/urls');
})


// add a delete request
app.post('/urls/:id/delete', (req, res) => {
  const urlID = req.params.id;
  delete urlDatabase[urlID];
  res.redirect('/urls')
})


// Update Request
app.post('/urls/:id', (req, res) => {
  
  let urlID = req.params.id;
  const longURL = urlDatabase[urlID];
  const newURL = req.body.newURL

  urlDatabase[urlID] = newURL
  
  res.redirect(`/urls`);
});

// add route for /urls/:id
app.get('/urls/:id', (req, res) => {
  const urlID = req.params.id;
  const originURL = urlDatabase[urlID];
  const templateVars = { 
    username: req.cookies["user_id"],
    id: urlID, 
    longURL: originURL,
    users: users
  };
  res.render('urls_show', templateVars);
});

const generateRandomString = function() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});