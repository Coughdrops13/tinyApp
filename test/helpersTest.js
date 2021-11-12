const { assert } = require('chai');
const { findUserByEmail, generateRandomString } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });
  it('should return undefined if no user exists in database with given email', () => {
    const user = findUserByEmail('mike@mike.com', testUsers);
    const expectedUser = undefined;
    assert.equal(user, expectedUser);
  });
});