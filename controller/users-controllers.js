const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');
const User = require('../models/user');

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  // console.log(errors);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }
  req.body = JSON.parse(Object.keys(req.body)[0]);
  const { fname, lname, cnumber, country, email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      'User exists already, please login instead.',
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      'Could not create user, please try again.',
      500
    );
    return next(error);
  }

  const createdUser = new User({
    fname,
    lname,
    cnumber,
    country,
    email,
    password: hashedPassword,
    language: [],
    genres: []
  });

  try {
    await createdUser.save();
    // console.log(createdUser);
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.29',
      500
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser._id, email: createdUser.email },
      'supersecret_dont_share',
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }

  res
    .status(201)
    .json({ userId: createdUser._id, email: createdUser.email, token: token });
};

const userchoice = async (req, res, next) => {
  const errors = validationResult(req);
  // console.log(errors);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }
  // req.body = JSON.parse(Object.keys(req.body)[0]);
  const { language, genres, email } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }

  if (existingUser) {
    const user = await User.findOneAndUpdate({ email: email }, { language: language, genres: genres })
  }

  // try {
  //   await createdUser.save();
  //   console.log(createdUser);
  // } catch (err) {
  //   const error = new HttpError(
  //     'Signing up failed, please try again later.29',
  //     500
  //   );
  //   return next(error);
  // }

  res
    .status(201)
    .json({ user: true });
};

const login = async (req, res, next) => {
  req.body = JSON.parse(Object.keys(req.body)[0]);
  const { email, password } = req.body;
  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Loggin in failed, please try again later.',
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      403
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      'Could not log you in, please check your credentials and try again.',
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      403
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser._id, email: existingUser.email },
      'supersecret_dont_share',
      { expiresIn: '1d' }
    );
  } catch (err) {
    const error = new HttpError(
      'Logging in failed, please try again later.',
      500
    );
    return next(error);
  }
  console.log(existingUser);
  res.json({
    user: existingUser,
    userId: existingUser._id,
    email: existingUser.email,
    token: token
  });
};

// exports.getUsers = getUsers;
exports.signup = signup;
exports.userchoice = userchoice;
exports.login = login;
