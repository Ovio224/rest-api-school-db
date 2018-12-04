'use strict';

const express = require('express');
const router = express.Router();
const User = require('../models').User;
const Course = require('../models').Course;
const auth = require('basic-auth');
const bcrypt = require('bcrypt');

// auth function
function getAuth(req, res, next) {
  User.find({
    emailAddress: auth(req).name
  }).then((users) => {
    if (users.length > 0) {
      let isAuth;
      bcrypt.compare(auth(req).pass, users[0].password)
        .then((res) => {
          isAuth = res;
        }).then(() => {
          if (isAuth) {
            req.user = users[0];
            next();
          } else {
            res.status(401).end();
          }
        }).catch(err => res.send(err));
    } else {
      res.status(401).end();
    }
  }).catch((err) => {
    next(err);
  });
};


// gets the course id -- one different way to approach this
router.param('cID', (req, res, next, id) => {
  Course.findById(id, (err, course) => {
    if (err) return next(err);
    if (!course) {
      err = new Error("Not found");
      err.status = 404;
    } else {
      req.course = course;
      return next();
    }
  }).populate({
    path: 'user',
    select: 'firstName lastName'
  });
});

// gets all users
router.get('/users', getAuth, (req, res, next) => {
  User.find({}).then((users) => {
    res.json(users);
  }).catch((err) => {
    next(err);
  });
});

// creates new user
router.post('/users', (req, res) => {
  const user = new User(req.body);
  user.save((err, user) => {
    if (err) return res.status(500).send(err);
    res.status(201).location('/').end();
  });
});

// gets all the courses
router.get('/courses', (req, res, next) => {
  Course.find({}).populate({
    path: 'user',
    select: 'firstName lastName'
  }).then((courses) => {
    res.json(courses);
  }).catch((err) => {
    next(err);
  });
});

// gets an specific course
router.get('/courses/:cID', (req, res) => {
  res.json(req.course);
});

// post a new course
router.post('/courses', getAuth, (req, res) => {
  Course.create(req.body, (err, course) => {

    if (err && err.name === "ValidationError") {
      res.status(400).send(err.errors)
    } else if (err) {
      return res.status(500).send(err);
    } else if (!err) {
      res.status(201).location(`/courses/${course._id}`).end();
    }
  });
});

// updates a course
router.put('/courses/:id', getAuth, (req, res) => {
  const query = {
    _id: req.params.id
  };
  Course.findByIdAndUpdate(query, req.body, (err, course) => {
    if (course.user !== req.user._id) { // sends a 403 status code if the user doesn't own the course
      return res.status(403).end();
    }
    if (err && err.name === "ValidationError") {
      res.status(400).send(err.errors)
    } else if (err) {
      return res.status(500).send(err);
    } else {
      return res.status(204);
    }
  }).then((req, res) => {
    return res.status(204);
  }).catch(err => res.send(err));
});
//   Course.findOneAndUpdate(query, req.body, (err, course) => {


// });

// deletes a course
router.delete('/courses/:id', getAuth, (req, res) => {
  const query = {
    _id: req.params.id
  };
  Course.findOneAndDelete(query, (err, course) => {
    if (course.user !== req.user._id) { // sends a 403 status code if the user doesn't own the course
      return res.status(403).end();
    } else {
      res.status(204);
    }
  }).then(res => res.status(204)).catch(err => res.send(err));
});

module.exports = router;