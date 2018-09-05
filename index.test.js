const app = require('./index');
const request = require('supertest');

request(app)
  .get('/api/posts?lat=-7.2146555&lon=-35.908928615135174&maxDistance=30000000')
  .expect('Content-Type', /json/)
  .expect(200)
  .end(function(err, res) {
    if (err) throw err;
  });