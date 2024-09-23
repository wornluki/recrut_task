const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const fs = require('fs');
const path = require('path');
const DatabaseHandler = require('../../src/utils/DBHandler');
const { duration } = require('moment');


setupTestDB();
const properToken = 'valid-token';

describe('Movie routes', () => {
  describe('POST /v1/movies', () => {
    let newMovie;

    beforeEach(() => {
      newMovie = {
        title: "Movie",
        year: 2012,
        runtime: 120,
        director: "Francis Ford Coppola",
        actors: "Marlon Brando, Al Pacino",
        plot: "In 1945, the New York City Corleone family don, Vito Corleone, listens to requests during his daughter Connie's wedding to Carlo Rizzi. Vito's youngest son Michael, a Marine who has thus far stayed out of the fami",
        genres: ["Comedy"],
      };
    });

    test('should return 201 and successfully create new movie if data is ok', async () => {
      const db = new DatabaseHandler();
      const res = await request(app)
        .post('/v1/movies')
        .set('Authorization', `Bearer ${properToken}`)
        .send(newMovie)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        title: newMovie.title,
        year: newMovie.year,
        runtime: newMovie.runtime,
        director: newMovie.director,
        actors: newMovie.actors,
        plot: newMovie.plot,
        genres: newMovie.genres,
      });

      const dbRes = db.getAll();
      expect(dbRes).toBeDefined();
      expect(dbRes).toHaveLength(3);
      expect(dbRes).toMatchObject([
        {
          "id": 1,
          "title": "Beetlejuice",
          "year": "1988",
          "runtime": "92",
          "genres": [
            "Comedy",
            "Fantasy"
          ],
          "director": "Tim Burton",
          "actors": "Alec Baldwin, Geena Davis, Annie McEnroe, Maurice Page",
          "plot": "A couple of recently deceased ghosts contract the services of a \"bio-exorcist\" in order to remove the obnoxious new owners of their house.",
          "posterUrl": "https://images-na.ssl-images-amazon.com/images/M/MV5BMTUwODE3MDE0MV5BMl5BanBnXkFtZTgwNTk1MjI4MzE@._V1_SX300.jpg"
        },
        {
          "id": 2,
          "title": "The Cotton Club",
          "year": "1984",
          "runtime": "127",
          "genres": [
            "Comedy",
            "Crime",
            "Drama",
            "Music"
          ],
          "director": "Francis Ford Coppola",
          "actors": "Richard Gere, Gregory Hines, Diane Lane, Lonette McKee",
          "plot": "The Cotton Club was a famous night club in Harlem. The story follows the people that visited the club, those that ran it, and is peppered with the Jazz music that made it so famous.",
          "posterUrl": "https://images-na.ssl-images-amazon.com/images/M/MV5BMTU5ODAyNzA4OV5BMl5BanBnXkFtZTcwNzYwNTIzNA@@._V1_SX300.jpg"
        },
        {
          title: 'Movie',
          year: 2012,
          runtime: 120,
          director: 'Francis Ford Coppola',
          actors: 'Marlon Brando, Al Pacino',
          plot: "In 1945, the New York City Corleone family don, Vito Corleone, listens to requests during his daughter Connie's wedding to Carlo Rizzi. Vito's youngest son Michael, a Marine who has thus far stayed out of the fami",
          genres: ['Comedy'],
          id: 3
        }
      ]);
    });


    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/movies').send(newMovie).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if genres is invalid', async () => {
      newMovie.genres = ['Wrong'];

      const res = await request(app)
        .post('/v1/movies')
        .set('Authorization', `Bearer ${properToken}`)
        .send(newMovie)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if runtime is string', async () => {
      newMovie.runtime = 'abc';

      const res = await request(app)
        .post('/v1/movies')
        .set('Authorization', `Bearer ${properToken}`)
        .send(newMovie)
        .expect(httpStatus.BAD_REQUEST);

      expect(res.body).toEqual({ code: 400, message: '"runtime" must be a number' })
    });

    test('should return 400 error if no runtime', async () => {
      delete newMovie.runtime

      const res = await request(app)
        .post('/v1/movies')
        .set('Authorization', `Bearer ${properToken}`)
        .send(newMovie)
        .expect(httpStatus.BAD_REQUEST);

      expect(res.body).toEqual({ code: 400, message: '\"runtime\" is required' })
    });
  });

  describe('GET /v1/movies', () => {
    test('should return 200 and apply the default query options', async () => {
      jest.spyOn(global.Math, 'random').mockReturnValue(0.5);
      const res = await request(app)
        .get('/v1/movies')
        .set('Authorization', `Bearer ${properToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual(
        {
          "id": 2,
          "title": "The Cotton Club",
          "year": "1984",
          "runtime": "127",
          "genres": [
              "Comedy",
              "Crime",
              "Drama",
              "Music"
          ],
          "director": "Francis Ford Coppola",
          "actors": "Richard Gere, Gregory Hines, Diane Lane, Lonette McKee",
          "plot": "The Cotton Club was a famous night club in Harlem. The story follows the people that visited the club, those that ran it, and is peppered with the Jazz music that made it so famous.",
          "posterUrl": "https://images-na.ssl-images-amazon.com/images/M/MV5BMTU5ODAyNzA4OV5BMl5BanBnXkFtZTcwNzYwNTIzNA@@._V1_SX300.jpg"
      }
      );
    });

    test('should return 401 if access token is missing', async () => {
      await request(app).get('/v1/movies').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return validation error for duration if not number', async () => {
      const res = await request(app)
        .get('/v1/movies')
        .set('Authorization', `Bearer ${properToken}`)
        .query({ duration: 'Crime' })
        .send()
        .expect(httpStatus.BAD_REQUEST);
        
        expect(res.body).toEqual({"code": 400, "message": "\"duration\" must be a number"});
    });

    test('should correctly apply filter duration', async () => {
      const res = await request(app)
        .get('/v1/movies')
        .set('Authorization', `Bearer ${properToken}`)
        .query({ duration: 130 })
        .send()
        .expect(httpStatus.OK);

        expect(res.body).toEqual({
          id: 2,
          title: 'The Cotton Club',
          year: '1984',
          runtime: '127',
          genres: [ 'Comedy', 'Crime', 'Drama', 'Music' ],
          director: 'Francis Ford Coppola',
          actors: 'Richard Gere, Gregory Hines, Diane Lane, Lonette McKee',
          plot: 'The Cotton Club was a famous night club in Harlem. The story follows the people that visited the club, those that ran it, and is peppered with the Jazz music that made it so famous.',
          posterUrl: 'https://images-na.ssl-images-amazon.com/images/M/MV5BMTU5ODAyNzA4OV5BMl5BanBnXkFtZTcwNzYwNTIzNA@@._V1_SX300.jpg'
        });
    });

    test('should correctly apply filter genres (one element)', async () => {
      const res = await request(app)
        .get('/v1/movies')
        .set('Authorization', `Bearer ${properToken}`)
        .query({ genres: ['Crime'] })
        .send()
        .expect(httpStatus.OK);
        
        expect(res.body).toEqual([{
          id: 2,
          title: 'The Cotton Club',
          year: '1984',
          runtime: '127',
          genres: [ 'Comedy', 'Crime', 'Drama', 'Music' ],
          director: 'Francis Ford Coppola',
          actors: 'Richard Gere, Gregory Hines, Diane Lane, Lonette McKee',
          plot: 'The Cotton Club was a famous night club in Harlem. The story follows the people that visited the club, those that ran it, and is peppered with the Jazz music that made it so famous.',
          posterUrl: 'https://images-na.ssl-images-amazon.com/images/M/MV5BMTU5ODAyNzA4OV5BMl5BanBnXkFtZTcwNzYwNTIzNA@@._V1_SX300.jpg'
        }]);
    });

    test('should correctly apply filter genres (multiple elements)', async () => {
      const res = await request(app)
        .get('/v1/movies')
        .set('Authorization', `Bearer ${properToken}`)
        .query({ genres: ["Comedy"] })
        .send()
        .expect(httpStatus.OK);
        
        expect(res.body).toEqual([
          {
            id: 1,
            title: 'Beetlejuice',
            year: '1988',
            runtime: '92',
            genres: [ 'Comedy', 'Fantasy' ],
            director: 'Tim Burton',
            actors: 'Alec Baldwin, Geena Davis, Annie McEnroe, Maurice Page',
            plot: 'A couple of recently deceased ghosts contract the services of a "bio-exorcist" in order to remove the obnoxious new owners of their house.',
            posterUrl: 'https://images-na.ssl-images-amazon.com/images/M/MV5BMTUwODE3MDE0MV5BMl5BanBnXkFtZTgwNTk1MjI4MzE@._V1_SX300.jpg'
          },
          {
            id: 2,
            title: 'The Cotton Club',
            year: '1984',
            runtime: '127',
            genres: [ 'Comedy', 'Crime', 'Drama', 'Music' ],
            director: 'Francis Ford Coppola',
            actors: 'Richard Gere, Gregory Hines, Diane Lane, Lonette McKee',
            plot: 'The Cotton Club was a famous night club in Harlem. The story follows the people that visited the club, those that ran it, and is peppered with the Jazz music that made it so famous.',
            posterUrl: 'https://images-na.ssl-images-amazon.com/images/M/MV5BMTU5ODAyNzA4OV5BMl5BanBnXkFtZTcwNzYwNTIzNA@@._V1_SX300.jpg'
          }
        ]);

        expect(res.body).toHaveLength(2);
    });

    test('should correctly apply filter genres and return sorted by count matched', async () => {
      const res = await request(app)
        .get('/v1/movies')
        .set('Authorization', `Bearer ${properToken}`)
        .query({ genres: ["Comedy", "Drama"] })
        .send()
        .expect(httpStatus.OK);
        
        expect(res.body).toEqual([
          {
            id: 2,
            title: 'The Cotton Club',
            year: '1984',
            runtime: '127',
            genres: [ 'Comedy', 'Crime', 'Drama', 'Music' ],
            director: 'Francis Ford Coppola',
            actors: 'Richard Gere, Gregory Hines, Diane Lane, Lonette McKee',
            plot: 'The Cotton Club was a famous night club in Harlem. The story follows the people that visited the club, those that ran it, and is peppered with the Jazz music that made it so famous.',
            posterUrl: 'https://images-na.ssl-images-amazon.com/images/M/MV5BMTU5ODAyNzA4OV5BMl5BanBnXkFtZTcwNzYwNTIzNA@@._V1_SX300.jpg'
          },
          {
            id: 1,
            title: 'Beetlejuice',
            year: '1988',
            runtime: '92',
            genres: [ 'Comedy', 'Fantasy' ],
            director: 'Tim Burton',
            actors: 'Alec Baldwin, Geena Davis, Annie McEnroe, Maurice Page',
            plot: 'A couple of recently deceased ghosts contract the services of a "bio-exorcist" in order to remove the obnoxious new owners of their house.',
            posterUrl: 'https://images-na.ssl-images-amazon.com/images/M/MV5BMTUwODE3MDE0MV5BMl5BanBnXkFtZTgwNTk1MjI4MzE@._V1_SX300.jpg'
          }
        ]);

        expect(res.body).toHaveLength(2);
    });

    test('should correctly apply filter genres and duration', async () => {
      const res = await request(app)
        .get('/v1/movies')
        .set('Authorization', `Bearer ${properToken}`)
        .query({ genres: ["Comedy", "Drama"], duration: 130 })
        .send()
        .expect(httpStatus.OK);
        
        expect(res.body).toEqual([
          {
            id: 2,
            title: 'The Cotton Club',
            year: '1984',
            runtime: '127',
            genres: [ 'Comedy', 'Crime', 'Drama', 'Music' ],
            director: 'Francis Ford Coppola',
            actors: 'Richard Gere, Gregory Hines, Diane Lane, Lonette McKee',
            plot: 'The Cotton Club was a famous night club in Harlem. The story follows the people that visited the club, those that ran it, and is peppered with the Jazz music that made it so famous.',
            posterUrl: 'https://images-na.ssl-images-amazon.com/images/M/MV5BMTU5ODAyNzA4OV5BMl5BanBnXkFtZTcwNzYwNTIzNA@@._V1_SX300.jpg'
          }
        ]);

        expect(res.body).toHaveLength(1);
    });    
  });
});