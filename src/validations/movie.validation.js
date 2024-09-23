const Joi = require('joi');

const CATEGORIES = [
  "Comedy",
  "Fantasy",
  "Crime",
  "Drama",
  "Music",
  "Adventure",
  "History",
  "Thriller",
  "Animation",
  "Family",
  "Mystery",
  "Biography",
  "Action",
  "Film-Noir",
  "Romance",
  "Sci-Fi",
  "War",
  "Western",
  "Horror",
  "Musical",
  "Sport"
] // This can be read & cached from DB

const validCateogries = Joi.string().valid(
  ...CATEGORIES
);

const genresValidation = Joi.array().items(validCateogries);

const createMovie = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    year: Joi.number().required(),
    runtime: Joi.number().required(),
    director: Joi.string().max(255).required(),
    actors: Joi.string(),
    plot: Joi.string(),
    posterUrl: Joi.string(),
    genres: genresValidation.required(),
  })
};

const getMovies = {
  query: Joi.object().keys({
    duration: Joi.number(),
    genres: Joi.alternatives(validCateogries, Joi.custom((val, helper) => {
      if (Array.isArray(val)) {
        return val;
      }
      if (typeof val === 'string') {
        try {
          val = JSON.parse(val)
          if (!Array.isArray(val)) {
            
            return CATEGORIES.includes(val) ? val : helper.message('genres not array');
          }
          
          return genresMatched(val, CATEGORIES) == val.length ? val : helper.message(`genres should be one of ${CATEGORIES.join(', ')}`);
        } catch {
          return helper.message('genres is not valid');
        }
      }
    }))
  }),
};

const genresMatched = (genres, allGenres) => {
  return genres.filter(genre => 
    allGenres.includes(genre)
  ).length;
};

module.exports = {
  createMovie,
  getMovies,
};
