import { useState } from 'react';

const useInputArr = () => {

    const [movieOne, setMovieOne] = useState(""); const [directorOne, setDirectorOne] = useState("");
    const [movieTwo, setMovieTwo] = useState(""); const [directorTwo, setDirectorTwo] = useState("");
    const [movieThree, setMovieThree] = useState(""); const [directorThree, setDirectorThree] = useState("");

    const inputArr = [
        {
            movieInputName: "movieOne",
            directorInputName: "directorOne",
            movie: movieOne,
            director: directorOne,
            moviePlaceholder: "First Movie",
            directorPlaceholder: "Directed by...",
            setMovie: setMovieOne,
            setDirector: setDirectorOne
        },
        {
            movieInputName: "movieTwo",
            directorInputName: "directorTwo",
            movie: movieTwo,
            director: directorTwo,
            moviePlaceholder: "Second Movie",
            directorPlaceholder: "Directed by...",
            setMovie: setMovieTwo,
            setDirector: setDirectorTwo
        },
        {
            movieInputName: "movieThree",
            directorInputName: "directorThree",
            movie: movieThree,
            director: directorThree,
            moviePlaceholder: "Third Movie",
            directorPlaceholder: "Directed by...",
            setMovie: setMovieThree,
            setDirector: setDirectorThree
        }
    ]

    return [
        movieOne,
        directorOne,
        movieTwo,
        directorTwo,
        movieThree,
        directorThree,
        inputArr
    ]
}

export default useInputArr;