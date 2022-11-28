const express = require('express');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

let urlDatabase = {
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

// redirect to the longURL by clicking on the shortened one
app.get("/u/:id", (req, res) => {
  const urlID = req.params.id
  const longURL = urlDatabase[urlID];
  res.redirect(longURL);
});

// add a delete request
app.post('/urls/:id/delete', (req, res) => {
  const urlID = req.params.id;
  delete urlDatabase[urlID];
  res.redirect('/urls')
})


// Update request ////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
app.post('/urls/:id', (req, res) => {
  
  let urlID = req.params.id;
  const longURL = urlDatabase[urlID];
  const newURL = req.body.newURL

  urlDatabase[urlID] = newURL
  // console.log(urlDatabase)
  
  /*  -issues: can't enter new longURL while keeping the old one for editing
      -can't return to the main page after submitting edited URL (when I try, the edit button doesn't move to the correct page)
      - Think I have the client side good but the server side I am struggling with

  */
  res.redirect(`/urls`);
  
})

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

// add route for /urls/:id
app.get('/urls/:id', (req, res) => {
  const urlID = req.params.id;
  const originURL = urlDatabase[urlID];
  const templateVars = { id: urlID, longURL: originURL };
  res.render('urls_show', templateVars);
  // return res.redirect('/urls')
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