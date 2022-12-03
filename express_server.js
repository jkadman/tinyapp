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

// function that finds a Url
// const findUrlByUserId = function(userId, database) {
//   for (let key in database) {
//     // if the userId inputed in the function matches the userID in the database, it will return the whole database.
//     // Not what I want, I want it to return only the URL's associated with the ID
//     //Just need to change value to database[key] but that will effect the rest of my code
//     if (database[key].userID === userId) {
//       return database[key]
//     }
//   }
// }

const databaseParser = function(database) {
  for (let key in database) {
    return database
  }
}
// if the userId inputed in the function matches the userID in the database, it will return the whole database.
    // Not what I want, I want it to return only the URL's associated with the ID
    //Just need to change value to database[key] but that will effect the rest of my code

// function for comparing logged in userID to the userID in the database
const urlsForUser = function(id) {
  let userURLs = {};
  for (let key in urlDatabase) {
    if (id === urlDatabase[key].userID) {
      userURLs[key] = urlDatabase[key];
    }
  }
  return userURLs;
};

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

// user object
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
  
  const user_id = req.cookies['user_id'];

  if (!user_id) {
    res.send('Must be logged in to access URLs')
  }
  
  const userEmail = users[user_id].email;

// if it is the userID, then the URL 

   const newDatabase = urlsForUser(user_id)
   
  
      const templateVars = {
        user_id,
        urls: newDatabase,
        userEmail,
      }

      console.log('newDatabase:', newDatabase)
      console.log('templateVars:', templateVars)
      res.render('urls_index', templateVars);
    
      
  

});

// access the registration page
app.get('/register', (req, res) => {
  
  const user_id = req.cookies['user_id'];
  
  if (user_id) {
    res.redirect('/urls')
    // return res.send("login to have access to the page")
    

    // res.redirect('urls')
  } 

  const userEmail = users[user_id]
    
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

  if (req.cookies['user_id']) {
    res.redirect('/urls')
    return 
  }

  const templateVars = {
    userEmail: users[req.cookies['user_id']]
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

// add a new URL to be shortened
app.post('/urls', (req, res) => {
  
  const user_id = req.cookies['user_id'];

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
  delete urlDatabase[urlID];
  res.redirect('/urls');
});


// shows all links sometimes but other times it doesn't -- Maybe gone


// Update Request
app.post('/urls/:id', (req, res) => {

  let urlID = req.params.id;
  const newURL = req.body.newURL;

  urlDatabase[urlID].longURL = newURL;
  
  // without / throws an error that it cannot get and seeks out urls/:id/urls
  res.redirect(`/urls`);
});

// add route for /urls/:id
app.get('/urls/:id', (req, res) => {
  const urlID = req.params.id;
  const originURL = urlDatabase[urlID].longURL;
  const user_id = req.cookies['user_id'];

  if (!user_id) {
    res.send('Need to be logged in')
    
  }

  const userEmail = users[user_id].email;

  const templateVars = {
    user_id: user_id,
    userEmail: userEmail,
    id: urlID,
    longURL: originURL,
  };
  res.render('urls_show', templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});