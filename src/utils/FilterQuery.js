class FilterQuery {
    filter(data, filterConfig) {
        let result = data;
        
        for (const filterKey in filterConfig) {
            result = this.filterCondition(filterKey, result, filterConfig);
        }

        return result;
    }

    filterCondition(type, data, filters) {
        switch (type) {
            case 'genres':
                let genresQuery = filters['genres'];
                if (typeof genresQuery === "string" && this.isJsonString(genresQuery)) {
                    genresQuery = JSON.parse(genresQuery);
                }
                if (!Array.isArray(genresQuery)) {
                    genresQuery = [genresQuery]
                }
                return this.getResultForGenres(data, genresQuery)
            
            case 'duration':
                const method = filters['genres'] ? 'filter' : 'find';
                const filterValue = filters['duration'];
                return data[method]((singleData) => {
                    return Number(singleData.runtime) <= filterValue + 10 && Number(singleData.runtime) >= filterValue - 10
                })
                
            default:
                return false;
                break;
        }
    }

    getResultForGenres(data, allGenres) {
        allGenres = allGenres.map((it) => it.toUpperCase())
        const genresMatched = (genres) => {
          return genres.filter(genre => 
            allGenres.includes(genre.toUpperCase())
          ).length;
        };
      
        return data
          .filter((item) => genresMatched(item.genres) > 0)
          .sort((a, b) => genresMatched(b.genres) - genresMatched(a.genres));
    }

    isJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
}

module.exports = FilterQuery;