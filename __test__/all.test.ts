import { test, it, describe, expect, beforeAll, afterAll, jest } from '@jest/globals';
import superTest, { Request, Response } from 'supertest';
import mongoose from 'mongoose';
import app from '../src/server';


const MONGO_URL='mongodb+srv://shebz:shebz123@cluster0.iwskxk4.mongodb.net/blogdb?retryWrites=true&w=majority';
const token: { token: string } = { token: '' };
const token2: { token2: string } = { token2: '' };

beforeAll(async () => {
  await mongoose.connect(MONGO_URL);
}, 50000);

afterAll(async () => {
  await mongoose.connection.close();
});

describe("endpoints", () => {
  it('should return 404', async () => {
    const response = await superTest(app)
    .get('/*');
    expect(response.statusCode).toBe(404);
  });
  
  it('should give 404 for already saveds', async () => {
    const response = await superTest(app)
      .post('/signup')
      .send({
        username: 'Musabe',
        password: 'musabe123',
        email: 'musabe@gmail.com',
      });
    expect(response.statusCode).toBe(400);
  });
  
  it('Logging in', async () => {
    const response = await superTest(app)
      .post('/login')
      .send({
        username: 'Musabe',
        password: 'musabe123'
      });
    token2.token2 = response.body.token;
    expect(response.statusCode).toBe(200);
  });

  it('Logging in', async () => {
    const response = await superTest(app)
      .post('/login')
      .send({
        username: 'shebelle',
        password: 'shebelle123',
      });
    token.token = response.body.token;
    expect(response.statusCode).toBe(200);
  });
  
  it('Logging in validation error', async () => {
    const response = await superTest(app)
      .post('/login')
      .send({
        username: 's',
        password: 'shebelle123'
      });
    expect(response.statusCode).toBe(401);
  });
    it('Logging in doesnot exist', async () => {
    const response = await superTest(app)
      .post('/login')
      .send({
        username: 'Doesnotexist',
        password: 'asdGe3',
      });
    expect(response.statusCode).toBe(401);
  });


});


describe('blog test',()=>{

      it('Posting a blog', async () => {
    const res = await superTest(app)
      .post('/blogs')
      .send({
        title: "Testingg12",
        content: "blog created in testing",
      })
      .set('Authorization', 'Bearer ' + token.token);
    expect(res.statusCode).toBe(201);
  });


      it('Posting a blog error', async () => {
    const res = await superTest(app)
      .post('/blogs')
      .send({
        title: "",
        content: "",
      })
      .set('Authorization', 'Bearer ' + token.token);
    expect(res.statusCode).toBe(400);
  });

  it('editing a blog', async () => {
    const res = await superTest(app)
        .patch('/blogs/65e37915dfd0ff9a6ec18715')
        .send({
        content: "Testing update",
        })
        .set('Authorization', 'Bearer ' + token.token);
    expect(res.body.message).toContain('Blog updated!')
    });


      it('should be 200..get a blog', async () => {
    const res = await superTest(app)
      .get('/blogs/65e37915dfd0ff9a6ec18715')
      .set('Authorization', 'Bearer ' + token.token);
    expect(res.statusCode).toBe(200);
  });
  
  it('get a blog error', async () => {
    const res = await superTest(app)
      .get('/blogs/65e37915dfd0ff9a6ec1815')
      .set('Authorization', 'Bearer ' + token.token);
    expect(res.statusCode).toBe(404);
  });

    
  it('should give 200..deleting a blog', async () => {
    const res = await superTest(app)
      .delete('/blogs/65e44b63ee89e10a3b1829f4')
      .set('Authorization', 'Bearer ' + token.token);
    expect(res.statusCode).toBe(200);
  });

});


describe("commenting tests",()=>{

    
  it('should return 201..Posting a comment', async () => {
    const res = await superTest(app)
      .post('/blogs/65e37915dfd0ff9a6ec18715/comment')
      .send({
        email: "she@gmail.com",
        comment: "coment of test",
      })
      .set('Authorization', 'Bearer ' + token.token);
    expect(res.statusCode).toBe(201);
  });
  it('error Posting a comment', async () => {
    const res = await superTest(app)
      .post('/blogs/65e0fe53b61562a46e33e6dd/comment')
      .send({

        email: "hhg@gmail.com",
        comment: "like this",
      })
      .set('Authorization', 'Bearer ' + token.token);
    expect(res.statusCode).toBe(400);
  });
});


describe("messages",()=>{
      it('should give 400 ..create a message', async () => {
    const response = await superTest(app)
      .post('/messages')
      .send({
        title: 'v',
        email: 'ddssgmail.com',
        message: 'the message send',
      });
    expect(response.statusCode).toBe(400);
  });
  it('should send a message', async () => {
    const response = await superTest(app)
      .post('/messages')
      .send({
        title: 'petero',
        email: 'petero@gmail.com',
        message: 'Testing queries',
      });
    expect(response.statusCode).toBe(201);
  });

    it('should be..unauthorized', async () => {
    const res = await superTest(app)
      .get('/messages')
      .set('Authorization', 'Bearer ' + token2.token2);
    expect(res.body.message).toContain('Unauthorized access');
  });

  it('should give 404 ..get a msg error', async () => {
    const res = await superTest(app)
      .get('/messages/655ddfbcc954392f2eeda438')
      .set('Authorization', 'Bearer ' + token.token);
    expect(res.statusCode).toBe(404);
  });


})

describe("liking",() =>{
    
  it('should give 500 ..Liking', async () => {
    const res = await superTest(app)
      .post('/blogs/65e0fe53b61562a46e33e6dd/like')
      .send({
        name: "mudanago",
        email: "hhg@gmail.com",
      })
      .set('Authorization', 'Bearer ' + token.token);
    expect(res.statusCode).toBe(500);
  });
  it('Liking', async () => {
    const res = await superTest(app)
      .post('/blogs/65e0fe53b61562a46e33e6dd/like')
      .send({
        email:"muka@gmail.com",
        postId:"65e0fe53b61562a46e33e6dd"
      })
      .set('Authorization', 'Bearer ' + token.token);
    expect(res.statusCode).toBe(200);
  });
  
  it('Liking', async () => {
    const res = await superTest(app)
      .post('/blogs/65e37915dfd0ff9a6ec18715/like')
      .set('Authorization', 'Bearer ' + token.token);
    expect(res.statusCode).toBe(404);
  });


})






