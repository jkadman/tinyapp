const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const generateRandomString = function() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
};

// a helper function to find user by email
const getUserByEmail = function(email, users) {
  
  for (let user in users) {
    
    if (email === users[user].email) {
      return users[user];
      
    }
  }
};

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
};

// make data readable
app.use(express.urlencoded({ extended: true }));

// add route for /urls
app.get('/urls', (req, res) => {
  
  const user_id = req.cookies['user_id'];

  if (!user_id) {
    const userEmail = users[user_id].email;
    const templateVars = {
      user_id: user_id,
      urls: urlDatabase,
      userEmail: userEmail
    }
  }

  const templateVars = {
    user_id: user_id,
    urls: urlDatabase,
  };

  
  
  res.render('urls_index', templateVars);
});

// for submitting a new url to be shortened
app.get('/urls/new', (req, res) => {

  const user_id = req.cookies['user_id'];

  if (!user_id) {
    
    return res.redirect('/login');

  }

  const userEmail = users[user_id].email;
    const templateVars = {
      user_id: req.cookies['user_id'],
      userEmail: userEmail
    };

    return res.render('urls_new', templateVars);
  

 
});

// access the registration page
app.get('/register', (req, res) => {
  
  const user_id = req.cookies['user_id'];

  if (user_id) {
    const userEmail = users[user_id].email;
    const templateVars = {
      user_id: user_id,
      userEmail: userEmail
    };

    res.redirect('urls')
  }

  const templateVars = {
    user_id: user_id,
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
  
  users[user_id] = {
    id: user_id,
    email: userEmail,
    password: userPassword
  };

  res.cookie('user_id', user_id);
  res.redirect('urls');

});

// login page
app.get('/login', (req, res) => {

  const user_id = req.cookies['user_id'];

  if (user_id) {
    const userEmail = users[user_id].email;

    const templateVars = {
      user_id: user_id,
      userEmail: userEmail
    };

    redirect('urls')
  }

  const templateVars = {
    user_id: user_id,
  };
  
  res.render('login', templateVars);
});

// Login request
app.post('/login', (req, res) => {
  
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  const foundUser = getUserByEmail(userEmail, users);

  // if the email inputed doesn't exist
  if (!foundUser) {
    return res.status(403).send('no user by that email');
  }

  // if the password is wrong
  if (foundUser.password !== userPassword) {
    return res.status(403).send('password not correct');
  }

  // if both email and password are correct
  if (foundUser.email && foundUser.password) {
    res.cookie('user_id', foundUser.id);
    return res.redirect('/urls');
  }
  
});

// add a new URL to be shortened
app.post('/urls', (req, res) => {
  const newID = generateRandomString();
  const newURL = req.body.longURL;
  urlDatabase[newID] = newURL;
  // res.render('urls_show', { id: newID, longURL: newURL });
  return res.redirect(`/urls/${newID}`);
});

// redirect to the longURL by clicking on the shortened one
app.get("/u/:id", (req, res) => {
  const urlID = req.params.id;
  const longURL = urlDatabase[urlID];
  
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
  delete urlDatabase[urlID];
  res.redirect('urls');
});


// Update Request
app.post('/urls/:id', (req, res) => {

  let urlID = req.params.id;
  const newURL = req.body.newURL;

  urlDatabase[urlID] = newURL;
  
  res.redirect(`urls`);
});

// add route for /urls/:id
app.get('/urls/:id', (req, res) => {
  const urlID = req.params.id;
  const originURL = urlDatabase[urlID];
  const user_id = req.cookies['user_id'];

  if (user_id) {
    const userEmail = users[user_id].email;

    const templateVars = {
      user_id: user_id,
      userEmail: userEmail,
      id: urlID,
      longURL: originURL,
    };
  }

  const templateVars = {
    user_id: user_id,
    id: urlID,
    longURL: originURL,
  };
  res.render('urls_show', templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});