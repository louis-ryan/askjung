import Head from "next/head";
import { useState } from "react";
import MovieInput from "../components/MovieInput";
import whatToWatchPoster from "../public/Whattowatchposter.png";
import useCallTrailer from "../custom_hooks/useCallTrailer";
import useScreener from "../custom_hooks/useScreener";
import useSubmitEvents from "../custom_hooks/useSubmitEvents";
import useInputArr from "../custom_hooks/useInputArr";


export default function Home() {

  const [ movieOne, directorOne, movieTwo, directorTwo, movieThree, directorThree, inputArr] = useInputArr()

  const [view, setView] = useState('GENERATE')
  const [screenDirector, setScreenDirector] = useState(false)
  const [youtubeID, setYoutubeID] = useState("")
  const [result, setResult] = useState();
  const [toBeExcluded, setToBeExcluded] = useState([]);

  const movieOneStr = movieOne ? movieOne + " directed by " + directorOne : ''
  const movieTwoStr = movieTwo ? movieTwo + " directed by " + directorTwo : ''
  const movieThreeStr = movieThree ? movieThree + " directed by " + directorThree : ''

  const { callTrailer } = useCallTrailer(setYoutubeID, setView)
  const { screenResult } = useScreener(movieOneStr, movieTwoStr, movieThreeStr, toBeExcluded, setResult, callTrailer, screenDirector, directorOne, directorTwo, directorThree)
  const [onSubmit, onTryAgain] = useSubmitEvents(movieOneStr, movieTwoStr, movieThreeStr, screenResult, toBeExcluded, setToBeExcluded, setView)


  return (
    <div>
      <Head>
        <title>Whattowatch???</title>
        <link rel="icon" href="/dog.png" />
      </Head>

      <main style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "600px" }}>

          {view === 'GENERATE' && (
            <div>
              <img src={whatToWatchPoster.src} style={{ width: "100%" }}></img>
              <h4>Input up to 3 movies which combined, would make your perfect movie for right now.</h4>
              <form onSubmit={onSubmit}>

                {inputArr.map((input) => {
                  return (
                    <div key={input.moviePlaceholder}>
                      <MovieInput
                        movieInputName={input.movieInputName}
                        directorInputName={input.directorInputName}
                        movie={input.movie}
                        director={input.director}
                        moviePlaceholder={input.moviePlaceholder}
                        directorPlaceholder={input.directorPlaceholder}
                        setMovie={input.setMovie}
                        setDirector={input.setDirector}
                      />
                      <div style={{ height: "16px" }} />
                    </div>
                  )
                })}

                <div style={{ display: "flex" }}>
                  <input type="checkbox" onClick={() => { screenDirector === false ? setScreenDirector(true) : setScreenDirector(false) }} />
                  <div style={{ width: "8px" }} />
                  <p>Exclude movies from listed directors</p>
                </div>

                <div style={{ height: "16px" }} />
                <input
                  type="submit"
                  value="Generate Movies"
                  style={{ width: "100%" }}
                />
              </form>
            </div>
          )}

          {view === 'THINKING' && (
            <div>THINKING...</div>
          )}

          {view === 'RESULTS' && (
            <div>
              <p>for the films, {movieOneStr} {movieTwoStr && ', ' + movieTwoStr}, {movieThreeStr && ', ' + movieThreeStr}, the movie for you is:</p>
              <h4>{result}</h4>
              <div style={{ height: "8px" }} />
              <iframe
                src={`https://www.youtube.com/embed/${youtubeID}`}
                width={'600'}
                height={'300'}
              />
              <div style={{ height: "16px" }} />
              <button
                onClick={() => onTryAgain(result)}
                style={{ width: "100%" }}
              >
                Try again
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
