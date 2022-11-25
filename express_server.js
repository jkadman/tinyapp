const express = require('express');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

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
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase};
  res.render('urls_index', templateVars);
});

// add route for /urls/:id
app.get('/urls/:id', (req, res) => {
  const urlID = req.params.id;
  const longURLs = urlDatabase[urlID];
  const templateVars = { id: urlID, longURL: longURLs }
  res.render('urls_show', templateVars);
});

// app.get('/', (req, res) => {
//   const templateVars = { greeting: 'Hello World!'};
//   res.render('urls_index', templateVars);
// });



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});