const { assert } = require('chai');

const  getUserByEmail  = require('../helpers.js');

const testUsers = {
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


describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("Jack@ham.ca", testUsers);
    const expectedUserID = "i9ov4r";
    assert(testUsers[expectedUserID].id === expectedUserID);
  });
});

describe('getUserByEmail', function() {
  it('should return undefined when a user is not in the database', function() {
    const user = getUserByEmail("bob@ham.ca", testUsers);
    assert.isUndefined(user, 'yes user is undefined');
  });
});