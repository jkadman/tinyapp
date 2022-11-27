const express = require('express');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// add route for /urls

// make data readable
app.use(express.urlencoded({ extended: true }));

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase};
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

// add a post request
app.post('/urls', (req, res) => {
  const newID = generateRandomString();
  const newURL = req.body.longURL;
  urlDatabase[newID] = newURL;  
  console.log(urlDatabase);
  // res.render('urls_show', { id: newID, longURL: newURL });
  return res.redirect(`/urls/${newID}`)
});

app.get("/u/:id", (req, res) => {
  const urlID = req.params.id
  const longURL = urlDatabase[urlID]
  res.redirect(longURL);
});

app.post('/urls/:id/delete', (req, res) => {
  const urlID = req.params.id;
  delete urlDatabase[urlID];
  res.redirect('/urls')
})

// add route for /urls/:id
app.get('/urls/:id', (req, res) => {
  const urlID = req.params.id;
  const originURL = urlDatabase[urlID];
  const templateVars = { id: urlID, longURL: originURL };
  res.render('urls_show', templateVars);
});

// app.get('/', (req, res) => {
//   const templateVars = { greeting: 'Hello World!'};
//   res.render('urls_index', templateVars);
// });

const generateRandomString = function() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});