const express = require('express');
const { check } = require('express-validator');

const usersController = require('../controller/users-controllers');

const router = express.Router();
// router.get('/', usersController.getUsers);
router.post(
  '/sn',
  usersController.signup
);

router.post(
  '/sn/choice',
  usersController.userchoice
);

router.post('/ln', usersController.login);

module.exports = router;
