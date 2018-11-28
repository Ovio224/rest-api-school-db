'use strict';

const express = require('express');
const router = express.Router();
const User = require('../models').User;
const Course = require('../models').Course;
const basicauth = require('basic-auth');


// gets the course id
router.param('cID', (req, res, next, id) => {
  Course.findById(id, (err, doc) => {
    if (err) return next(err);
    if (!doc) {
      err = new Error("Not found");
      err.status = 404;
    } else {
      req.course = doc;
      return next();
    }
  });
});

// gets all users
router.get('/users', (req, res, next) => {
  User.find({}).then((users) => {
    res.json(users);
  }).catch((err) => {
    next(err);
  });
});

router.get('/')

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
  Course.find({}).populate('user').then((courses) => {
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
router.post('/courses', (req, res, next) => {
  Course.create(req.body, (err, course) => {
    if (err && err.name === "ValidationError") {
      res.status(400).send(err.errors)
    } else if (err) {
      return res.status(500).send(err);
    } else if(!err) {
      res.status(201).location(`/courses/${course._id}`).end();
    }
  });
});

// updates a course
router.put('/courses/:id', (req, res) => {
  const query = {
    _id: req.params.id
  };
  Course.findOneAndUpdate(query, req.body, (err, doc) => {
      if (err && err.name === "ValidationError") {
        res.status(400).send(err.errors)
      } else if (err) {
          return res.status(500).send(err);
      } else {
          res.status(204);
      }
  }).then((req, res) => {
    res.status(204);
  }).catch(err => res.send(err));
});

// deletes a course
router.delete('/courses/:id', (req, res) => {
  const query = {
    _id: req.params.id
  };
  Course.findOneAndDelete(query, (err) => {
    res.status(204);
  }).then(res => res.status(204)).catch(err => res.send(err));
});

module.exports = router;