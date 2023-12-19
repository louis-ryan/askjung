const MovieInput = ({ movieInputName, directorInputName, movie, director, moviePlaceholder, directorPlaceholder, setMovie, setDirector }) => (

    <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
        <input
            type="text"
            name={movieInputName}
            placeholder={moviePlaceholder}
            value={movie}
            onChange={(e) => setMovie(e.target.value)}
            style={{
                width: "48%",
                border: "2px solid grey"
            }}
        />
        
        <input
            type="text"
            name={directorInputName}
            placeholder={directorPlaceholder}
            value={director}
            onChange={(e) => setDirector(e.target.value)}
            style={{
                width: "48%",
                border: "2px solid grey"
            }}
        />
    </div>
)

export default MovieInput