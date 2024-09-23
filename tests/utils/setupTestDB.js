const DatabaseHandler = require('../../src/utils/DBHandler');

const setupTestDB = () => {


  beforeEach(async () => {
    const mockTestData = {
      movies: [
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
        }
      ]
    };
    
    jest.spyOn(DatabaseHandler.prototype, 'load').mockImplementation((path) => {
      return mockTestData; // Zwracamy dane, które mają być użyte w testach
    });

    jest.spyOn(DatabaseHandler.prototype, 'post').mockImplementation((data) => {
      const lastID = mockTestData.movies[mockTestData.movies.length - 1].id;
      const dataToSave = {
          ...data,
          id: lastID + 1
      }
      if (mockTestData.movies[mockTestData.movies.length]) {
        throw new Error(
          `ID already exists: ${id}\nTry using put() method to update that ID with data instead.`
        );
      } else {
        mockTestData.movies[mockTestData.movies.length] = dataToSave;

        return dataToSave;
      }
    });

    jest.spyOn(DatabaseHandler.prototype, 'getAll').mockImplementation((data) => {
      return mockTestData.movies;
    });
  });

  beforeEach(async () => {

  })

  afterAll(async () => {

  });
};

module.exports = setupTestDB;
