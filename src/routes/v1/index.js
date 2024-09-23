const express = require('express');
const movieRoute = require('./movie.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/movies',
    route: movieRoute,
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
