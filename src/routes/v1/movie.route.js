const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const movieValidation = require('../../validations/movie.validation');
const movieController = require('../../controllers/movie.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageMovies'), validate(movieValidation.createMovie), movieController.createMovie)
  .get(auth('getMovies'), validate(movieValidation.getMovies), movieController.getMovies);


module.exports = router;