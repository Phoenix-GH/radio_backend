
var request = require('supertest');
var agent = require('../server');

var expect = require('chai').expect;
var route = "/";
var token = "";

var testData = {
	name: 'unitTest',
	email: 'unitTest@gmail.com',
	password: 'unitTest'
}

var updatedTestData = {
	name: 'updatedTestUser'
}

describe('Testing User Services', function() {

	describe('Testing to create new User: POST /signup', function() {

		beforeEach(function() {

		});

		it('Testing that we cannot create admin user without login: should return a 401 without token', function(done) {
			request(agent)
				.post(route + '/signup')
				.set('Accept', 'application/json')
				.expect(401)
				.end(done);
		});

		it('Testing that Super Admin can create admin user after login: should return a 200 with valid token', function(done) {
			request(agent)
				.post(route + '/signup')
				.set('Accept', 'application/json')
				.send(testData)
				.expect(200)
				.end(done);
		});
	});

	describe('Login testing: POST /login', function() {

		beforeEach(function() {

		});

		it('Testing that we cannot login with invlalid user credentials: should return a 404 with wrong credentials', function(done) {
			request(agent)
				.post(route + '/login')
				.set('Accept', 'application/json')
				.send({email: 'unitTest@gmail.com', password: 'unitTest2'})
				.expect(403)
				.end(done);
		});		

		it('Testing that we can login with valid user credentials: should return a 200 with valid credentials', function(done) {
			request(agent)
				.post(route + '/login')
				.set('Accept', 'application/json')
				.send({email: testData.email, password: testData.password})
				.expect(200)
				.end(function(err, res) {
					if (err) {
						return done(err);
					}
					token = res.body.token;
					testData.token = token;
					updatedTestData.token = token;
					done();
				});
		});
	});

	describe('Testing to edit User: PUT /user', function() {

		beforeEach(function() {

		});

		it('Testing that we cannot update user without login: should return a 401 without token', function(done) {
			request(agent)
				.put(route + '/user')
				.set('Accept', 'application/json')
				.expect(401)
				.end(done);
		});

		it('Testing that we cannot create tenants with the same login: should return a 200 with valid token', function(done) {
			request(agent)
				.put(route + '/user')
				.set('Accept', 'application/json')
				.send(updatedTestData)
				.expect(200)
				.end(done);
		});
	});

	describe('Testing to get User List: GET /users', function() {

		beforeEach(function() {

		});


		it('Testing that we cannot get user user without login: should return a 401 without token', function(done) {
			request(agent)
				.get(route + '/user')
				.set('Accept', 'application/json')
				.expect(401)
				.end(done);
		});

		it('Testing that we can get user list after login with admin user: should return a 200 with valid token', function(done) {
			request(agent)
				.get(route + '/user')
				.set('Accept', 'application/json')
				.send({token: token})
				.expect(200)
				.end(function(err, res) {
					if (err) {
						return done(err);
					}

					expect(res.body).to.be.an('array');
					expect(res.body[0]).to.have.property('name').to.be.a('String');
					expect(res.body[0]).to.have.property('login').to.be.a('String');

					done();
				});
		});
	});


	describe('Testing to change password of logged in Admin User: POST /admin-users/{login}/change-password', function() {		

		beforeEach(function() {

		});


		it('Testing that Admin User cannot change his password without login: should return a 401 without token', function(done) {
			request(agent)
				.post(route + '/user/' + testData.login + '/change-password')
				.set('Accept', 'application/json')
				.expect(401)
				.end(done);
		});

		it('Testing that Admin User cannot change his password with wrong old password: should return a 404 with wrong old password', function(done) {
			var wrongPassword = {
				newPassword: "test000",
				oldPassword: "test123",
				token: token
			};
			request(agent)
				.post(route + '/user/' + testData.login + '/change-password')
				.set('Accept', 'application/json')
				.send(wrongPassword)
				.expect(404)
				.end(done);
		});

		it('Testing that Admin User can change his password with only correct old password: should return a 200 with correct old password', function(done) {
			var correctPassword = {
				newPassword: "test000",
				oldPassword: testData.password,
				token: token
			}
			request(agent)
				.post(route + '/user/' + testData.login + '/change-password')
				.set('Accept', 'application/json')
				.send(correctPassword)
				.expect(200)
				.end(done);
		});
	});

	describe('Testing to delete User: DELETE /user', function() {

		beforeEach(function() {

		});


		it('Testing that we cannot delete Admin User without login: should return a 401 without token', function(done) {
			request(agent)
				.delete(route + '/user')
				.set('Accept', 'application/json')
				.send(testData)
				.expect(401)
				.end(done);
		});

		it('Testing that Super Admin cannot delete his account himself: should return a 403 when trying to remove super admin', function(done) {
			request(agent)
				.delete(route + '/user')
				.set('Accept', 'application/json')
				.send({token: token})
				.expect(403)
				.end(done);
		});

		it('Testing that Super Admin can delete other Admin User after login: should return a 200 with valid token', function(done) {
			request(agent)
				.delete(route + '/user')
				.set('Accept', 'application/json')
				.send({token: token})
				.expect(200)
				.end(done);
		});
	});

});
