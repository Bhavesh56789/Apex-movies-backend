const express = require('express');

const moviesController = require('../controller/home');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.use(checkAuth);

router.get('/', moviesController.getMovies);

router.get('/:id', moviesController.getMovieById);

router.post('/:id', moviesController.watch);

module.exports = router;
