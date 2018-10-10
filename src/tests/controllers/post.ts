import app from '../../server';
import * as request from 'supertest';
import { expect, } from 'chai';

var agent = request.agent(app);

describe('/posts', () => {
  beforeEach((done) => {
    app.on('ready', () => {
      done();
    });
  });

  it('should return posts', async() => {
    const result = await agent.get('/posts');

    expect(result.status).to.equal(200);
    expect(result.body).to.be.a("array");
  });  
});