const findUserByEmail = function(email, users) {
for (const key in users) {
  if (users[key].email === email) {
    return users[key];
  }
}
return null;
};

const generateRandomString = function() {
  const shortURL = Math.random().toString(16).substr(2, 6);
  return shortURL;
};


module.exports = {
  findUserByEmail,
  generateRandomString,
};