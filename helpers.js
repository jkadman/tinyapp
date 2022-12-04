
// a helper function to find user by email
const getUserByEmail = function(email, users) {
  for (let user in users) {
    if (email === users[user].email) {
      return users[user];
    }
  }
};



module.exports = getUserByEmail;
  

  