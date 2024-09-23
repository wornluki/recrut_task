const fs = require("fs");

const DB_DATA = './data/db.json'

class DatabaseHandler {
    constructor(path) {
        this.snapshot = this.load(path);
    }

    load(path) {
        let dbData;
        let pathToDataFile = path ? path : DB_DATA;
        if (fs.existsSync(pathToDataFile)) {
            if (fs.readFileSync(pathToDataFile, "utf-8") === "") {
                fs.writeFileSync(pathToDataFile, "{}");
            }

            dbData = JSON.parse(fs.readFileSync(pathToDataFile, "utf8"));
        } else {
            throw new Error(`JSON file not found: ${pathToDataFile}`);
        }


        return dbData;
    }

    getAll() {
        return this.snapshot.movies;
    }

    post(data) {
        const lastID = this.snapshot.movies[this.snapshot.movies.length - 1].id;
        const dataToSave = {
            ...data,
            id: lastID + 1
        }
        if (this.snapshot.movies[this.snapshot.movies.length]) {
          throw new Error("Already exist");
        } else {
          this.snapshot.movies[this.snapshot.movies.length] = dataToSave;
    
          fs.writeFileSync(DB_DATA, JSON.stringify(this.snapshot));
    
          return dataToSave;
        }
      }
}

module.exports = DatabaseHandler;