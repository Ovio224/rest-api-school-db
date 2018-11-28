'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const {
  Schema
} = mongoose;

// schemas
const UserSchema = new Schema({
  firstName: {
    type: String,
    required: [true, "You need to enter your first name."]
  },
  lastName: {
    type: String,
    required: [true, "You need to enter your last name."]
  },
  emailAddress: {
    type: String,
    required: [true, "The email is required!"],
    index: {
      unique: true
    }
  },
  password: {
    type: String,
    required: [true, "A password is required!"]
  }
});

const CourseSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, "Please enter a title."]
  },
  description: {
    type: String,
    required: [true, "The description is required"]
  },
  estimatedTime: String,
  materialsNeeded: String
});

UserSchema.pre("save", function (next) {
  const user = this;

  //only hash the password if it's new or modified
  if (!user.isModified('password')) return next();

  // hash the password
  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) return next(err);

    //override the password
    user.password = hash;
    next();
  });
});

UserSchema.methods.comparePassword = function (usrPassword, callback) {
  bcrypt.compare(usrPassword, this.password, function (err, isMatch) {
    if(err) return callback(err);
    callback(null, isMatch);
  });
}


// models
const User = mongoose.model("User", UserSchema);
const Course = mongoose.model("Course", CourseSchema);

module.exports.User = User;
module.exports.Course = Course;
