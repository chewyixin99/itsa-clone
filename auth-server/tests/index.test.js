const request = require("supertest");
const { app, init } = require("../app");
const db = require("../models");
const AWS = require("aws-sdk");
var bcrypt = require("bcryptjs");
const { sendMail } = require("../controllers/mail.controller");

const sendEmailMock = jest.fn();
AWS.SES = jest.fn(() => ({
  sendEmail: sendEmailMock
}));

jest.setTimeout(100000);

beforeAll(async () => {
    await init();
});

afterAll(async () => {
    await db.sequelize.close();
});

describe("get /health", () => {
    describe("when called", () => {
        test("should respond with a 200 status code", async () => {
            const response = await request(app).get("/health");
            expect(response.statusCode).toBe(200);
        });
    });
});

describe('POST /signup', () => {
  db.user.destroy({
    where: {
      email: 'test@email.com'
    }
  })
  
  it('Create a new user and return success message', async () => {
    const response = await request(app)
      .post('/oauth/signup')
      .send({
        email: 'test@email.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
        roles: ['user']
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('User was registered successfully!');
  });


  it('Fail to create a new user and return error message due to account exist', async () => {
    const response = await request(app)
      .post('/oauth/signup')
      .send({
        email: 'test@email.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
        roles: ['user']
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Failed! Account already created!');
  });

  it('Fail to create a new user due to non existed user', async () => {
    const response = await request(app)
      .post('/oauth/signup')
      .send({
        email: 'test2@email.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
        roles: ['user']
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Failed! Email not valid');
  });
});

describe('sendMail function', () => {
  beforeEach(() => {
    sendEmailMock.mockClear();

    // Mock the implementation for successful email send
    sendEmailMock.mockImplementation((params, callback) => {
      callback(null, { MessageId: '1234' }); // Simulate a successful response
    });
  });

  it('should send an email successfully', async () => {
    // Await the sendMail function and check the resolved value
    await expect(sendMail({
      email: 'cs301g3t6@gmail.com',
      code: '123456',
      resetpw: false
    })).resolves.toEqual({ MessageId: '1234' }); // This should match the resolved value

    expect(sendEmailMock).toHaveBeenCalledTimes(1);
  });

  it('should handle email sending failure', async () => {
    // Mock implementation for failed email send
    sendEmailMock.mockImplementationOnce((params, callback) => {
      callback(new Error('Sending failed'), null);
    });

    await expect(sendMail({
      email: 'test@example.com',
      code: '123456',
      resetpw: false
    })).rejects.toThrow('Sending failed');

    expect(sendEmailMock).toHaveBeenCalledTimes(1);
  });
});

describe('POST /signin', () => {
  it('should require an email and password', async () => {
    const response = await request(app)
      .post('/oauth/signin')
      .send({ email: '', password: '' });

    expect(response.status).toBe(400);
    expect(response.text).toContain('Please enter an email');
  });

  it('should handle invalid username/password', async () => {
    const response = await request(app)
      .post('/oauth/signin')
      .send({ email: 'nonexistent@example.com', password: 'password123' });

    expect(response.status).toBe(400);
    expect(response.text).toContain('Invalid Username / Password');
  });

  it('should sign in user successfully with correct credentials', async () => {
    const response = await request(app)
      .post('/oauth/signin')
      .send({ email: 'test@email.com', password: 'password123' });

    expect(response.status).toBe(200);
  });
});

describe('POST /signinotp', () => {
  db.user.create({
    sub: "testsub1",
    email: "test2@email.com",
    password: bcrypt.hashSync("password", 8),
    first_name: "Demo",
    last_name: "User",
    birthdate: "2010-10-10",
    status: "Pending",
  })

  db.userValidate.destroy({
    where:{
      email: "test2@email.com"
    }
  })
  db.userValidate.create({
    email: "test2@email.com",
    otp: bcrypt.hashSync('123456', 8),
    status: 1    
  })
  
  it('Should fail OTP check', async () => {
    const response = await request(app)
      .post('/oauth/signinOtp')
      .send({ email: 'test2@email.com', code: '123455' });

    expect(response.status).toBe(400);
    expect(response.text).toContain('Invalid OTP, please try again');
  });

  it('Should pass OTP check', async () => {
    const response = await request(app)
      .post('/oauth/signinOtp')
      .send({ email: 'test2@email.com', code: '123456' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
  });
});

describe('GET /jwks', () => {
  it('Should GET JWKS stuff', async () => {
    const response = await request(app)
      .get('/oauth/jwks')
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('keys');
  });
})

describe('API with JWT credentials', () => {
  db.user.create({
    sub: "tester",
    email: "test5@email.com",
    password: bcrypt.hashSync("password", 8),
    first_name: "Demo",
    last_name: "User",
    birthdate: "2010-10-10",
    status: "Pending",
  })

  beforeEach(async() =>{ 
    db.userValidate.destroy({
      where:{
        email: "test5@email.com"
      }
    })
  
    db.userValidate.create({
      email: "test5@email.com",
      otp: bcrypt.hashSync('123456', 8),
      status: 1    
    })
    
    const response = await request(app)
      .post('/oauth/signinOtp')
      .send({ email: 'test5@email.com', code: '123456' });
    
    accessToken = response.body.accessToken
  })

  it('/GET getUserInfo', async () => {
    const response = await request(app)
      .get('/user/userinfo')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('sub');
  });
})