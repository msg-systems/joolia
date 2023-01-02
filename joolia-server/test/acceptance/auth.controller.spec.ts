import * as bcrypt from 'bcryptjs';
import { assert, expect } from 'chai';
import { describe } from 'mocha';
import * as request from 'supertest';
import { checkCookies, clearDatabases, extractAuthCookie, loadFixtures, seeds } from '../utils';
import { server } from './test.common.spec';
import * as moment from 'moment';
import * as jwt from 'jwt-simple';
import { getConf } from '../../src/config';
import { JWTResponse, ProfileResponse } from '../../src/api/responses';
import * as httpStatus from 'http-status';
import { LoginProfileResponse } from '../../src/api/responses/loginProfile.response';

const authConf = getConf().authConf;
const users = seeds.users;

describe('Authorization', async () => {
    before(async () => {
        await loadFixtures();
    });

    after(async () => {
        await clearDatabases();
    });

    describe('/signout', async () => {
        it('Sign-in/out test', async () => {
            let [cookieToken, jwtToken] = [undefined, undefined];

            await request(server.application)
                .post('/signin')
                .send({
                    email: users.ObiWan.email,
                    password: users.ObiWan.password
                })
                .expect(httpStatus.OK)
                .expect((res) => {
                    checkCookies(res);
                    const cookie = extractAuthCookie(res);
                    cookieToken = cookie.token;
                });

            await request(server.application)
                .get('/token')
                .set('Cookie', `${authConf.cookieTokenName}=${cookieToken}`) // Must use a valid Cookie
                .expect(200)
                .expect((res) => {
                    checkCookies(res);
                    jwtToken = res.body as JWTResponse;
                });

            await request(server.application)
                .get('/profile')
                .set('Authorization', jwtToken.token) // Must use a valid JWT token
                .expect(httpStatus.OK);

            await request(server.application)
                .post('/signout')
                .set('Cookie', `${authConf.cookieTokenName}=${cookieToken}`)
                .expect(httpStatus.NO_CONTENT)
                .expect((res) => {
                    const cookie = extractAuthCookie(res);
                    cookieToken = cookie.token;
                });

            await request(server.application)
                .get('/token')
                .set('Cookie', `${authConf.cookieTokenName}=${cookieToken}`) // Must use a valid Cookie
                .expect(401);
        });
    });

    describe('/signin', async () => {
        it('Sign-in, get profile & auth token', async () => {
            let [cookieToken, jwtToken] = [undefined, undefined];

            await request(server.application)
                .post('/signin')
                .send({
                    email: users.ObiWan.email,
                    password: users.ObiWan.password
                })
                .expect(200)
                .expect((res) => {
                    checkCookies(res);
                    expect(res.body).has.keys(LoginProfileResponse.attrs);
                    expect(res.body).has.keys(LoginProfileResponse.attrs);
                    expect(res.body.id).equals(users.ObiWan.id);

                    const cookie = extractAuthCookie(res); // extracted options are lowercase

                    expect(cookie.token).to.be.not.undefined;
                    expect(cookie.domain).to.be.not.undefined;
                    expect(cookie.domain).equals('localhost');
                    expect(cookie.httponly).to.be.not.undefined;
                    expect(cookie.httponly).equals(true);

                    cookieToken = cookie.token;
                });

            await request(server.application)
                .get('/token')
                .set('Cookie', `${authConf.cookieTokenName}=${cookieToken}`) // Must use a valid Cookie
                .expect(200)
                .expect((res) => {
                    checkCookies(res); // Cookies are refreshed
                    expect(res.body).has.keys(JWTResponse.attrs);
                    expect(res.body.token).includes('JWT ');
                    expect(res.body.expires).is.not.empty;
                    jwtToken = res.body as JWTResponse;
                });

            await request(server.application)
                .get('/profile')
                .set('Authorization', jwtToken.token) // Must use a valid JWT token
                .expect(200)
                .expect((res) => {
                    expect(res.body).has.keys(ProfileResponse.attrs);
                    expect(res.body.id).equals(users.ObiWan.id);
                });
        });

        it('Wrong password returns 401', async () => {
            await request(server.application)
                .post('/signin')
                .send({
                    email: 'obi.wan@jedi-order.com',
                    password: 'WrongPassword'
                })
                .expect(401);
        });

        it('Five failed logins block user', async () => {
            for (let i = 0; i < 4; i++) {
                await request(server.application)
                    .post('/signin')
                    .set('Accept', 'application/json')
                    .send({
                        email: 'obi.wan@jedi-order.com',
                        password: 'WrongPassword'
                    })
                    .expect(401);
            }

            await request(server.application)
                .post('/signin')
                .set('Accept', 'application/json')
                .send({
                    email: 'obi.wan@jedi-order.com',
                    password: 'WrongPassword'
                })
                .expect(412);
        });
    });

    describe('/signup', async () => {
        it('#POST Responds with an newly created user', async () => {
            await request(server.application)
                .post('/signup')
                .set('Accept', 'application/json')
                .send({
                    name: 'test',
                    email: 'TEST@testing.com',
                    password: 'test1234'
                })
                .expect((res) => {
                    expect(res.body.user).be.an('object');
                    expect(res.body.user.name).equal('test');
                    expect(res.body.user.email).equal('test@testing.com');
                    expect(res.body.user.admin).equal(false);
                    bcrypt.compare('test1234', res.body.user.password, (err, resb) => {
                        assert(resb, 'Password not  hashed correctly');
                    });
                })
                .expect(201);
        });

        it('#POST Responds with a newly created user with admin rights', async () => {
            await request(server.application)
                .post('/signup')
                .set('Accept', 'application/json')
                .send({
                    name: 'Leo',
                    email: 'Leo@msg.group',
                    password: 'test1234'
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body.user).be.an('object');
                    expect(res.body.user.email).equal('Leo@msg.group');
                    expect(res.body.user.admin).equal(true);
                    bcrypt.compare('test1234', res.body.user.password, (err, resb) => {
                        assert(resb, 'Password not hashed correctly');
                    });
                });
        });

        it('#POST Responds with an error, because the email was already registered', async () => {
            await request(server.application)
                .post('/signup')
                .set('Accept', 'application/json')
                .send({
                    name: 'test',
                    email: 'luke@alliance.com',
                    password: 'test1234'
                })
                .expect('Content-Type', /json/)
                .expect(409);
        });

        it('#POST Responds with an error, because an id is included in the body', async () => {
            await request(server.application)
                .post('/signup')
                .send({
                    id: 'idInTheBody',
                    name: 'test',
                    email: 'testIdInTheBody?',
                    password: 'test1234'
                })
                .expect((res) => {
                    expect(res.body).to.have.key('errors');
                })
                .expect(422);
        });

        it('#POST Responds with an error, because the password is empty', async () => {
            await request(server.application)
                .post('/signup')
                .send({
                    name: 'test',
                    email: 'test@testing.com'
                })
                .expect((res) => {
                    expect(res.body).to.have.key('errors');
                })
                .expect(422);
        });

        it('#POST Responds with an error, because the name is empty', async () => {
            await request(server.application)
                .post('/signup')
                .send({
                    email: 'test@testing.com',
                    password: 'test1234'
                })
                .expect((res) => {
                    expect(res.body).to.have.key('errors');
                })
                .expect(422);
        });

        it('#POST Responds with an error, because the name is too long', async () => {
            await request(server.application)
                .post('/signup')
                .send({
                    name: '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
                    email: 'test2@testing.com',
                    password: 'test1234'
                })
                .expect((res) => {
                    expect(res.body).to.have.key('errors');
                })
                .expect(422);
        });

        it('#POST Responds with an error, because the email is empty', async () => {
            await request(server.application)
                .post('/signup')
                .send({
                    name: 'test',
                    password: 'test1234'
                })
                .expect((res) => {
                    expect(res.body).to.have.key('errors');
                })
                .expect(422);
        });

        it('#POST Responds with an error, because admin status is included in the body', async () => {
            await request(server.application)
                .post('/signup')
                .send({
                    name: 'test',
                    email: 'test@mail.com',
                    password: 'test1234',
                    admin: true
                })
                .expect((res) => {
                    expect(res.body).to.have.key('errors');
                })
                .expect(422);
        });

        it('#POST Duplicated gmail-address with dot should fail', async () => {
            await request(server.application)
                .post('/signup')
                .set('Accept', 'application/json')
                .send({
                    name: 'test',
                    email: 'test.dot@gmail.com',
                    password: 'test1234'
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body.user).be.an('object');
                    expect(res.body.user.name).equal('test');
                    expect(res.body.user.email).equal('test.dot@gmail.com');
                    expect(res.body.user.admin).equal(false);
                    bcrypt.compare('test1234', res.body.user.password, (err, resb) => {
                        assert(resb, 'Password not  hashed correctly');
                    });
                });

            await request(server.application)
                .post('/signup')
                .set('Accept', 'application/json')
                .send({
                    name: 'test',
                    email: 'test.dot@gmail.com',
                    password: 'test1234'
                })
                .expect(409)
                .expect('Content-Type', /json/);
        });
    });

    describe('Tests to reset password', async () => {
        it('#PUT request an email to change password', async () => {
            await request(server.application)
                .put('/request-password-reset')
                .send({
                    email: users.Luke.email
                })
                .expect(204);
        });

        it('#PUT request an email with unkown email to change password', async () => {
            await request(server.application)
                .put('/request-password-reset')
                .send({
                    email: 'notluke@alliance.com'
                })
                .expect(204);
        });

        it('#GET reset password with invalid token fails as token is expired', async () => {
            const authConf = getConf().authConf;
            const JWT_SECRET = authConf.jwtSecret;
            const expirationDate = moment()
                .utc()
                .add(-60, 'minutes')
                .unix();

            const token = jwt.encode(
                {
                    expirationDate: expirationDate,
                    userId: users.Luke.id
                },
                JWT_SECRET
            );
            await request(server.application)
                .patch('/reset-password')
                .send({
                    token: token,
                    password: 'luke1234'
                })
                .expect(401);
        });

        it('#GET reset password with valid token', async () => {
            const authConf = getConf().authConf;
            const JWT_SECRET = authConf.jwtSecret;
            const expirationDate = moment()
                .utc()
                .add(5, 'minutes')
                .unix();

            const token = jwt.encode(
                {
                    expirationDate: expirationDate,
                    userId: users.Luke.id
                },
                JWT_SECRET
            );
            await request(server.application)
                .patch('/reset-password')
                .send({
                    token: token,
                    password: 'luke1234'
                })
                .expect(204);
        });
    });
});
