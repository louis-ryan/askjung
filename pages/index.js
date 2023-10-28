import Head from "next/head";
import { useState, useEffect } from "react";
import MovieInput from "../components/MovieInput";
import title from "../public/which2watch_title.svg";
import superGenius from "../public/super_genius.svg";
import superGeniusFrustrated from "../public/super_genius_frustrated.svg";
import useCallTrailer from "../custom_hooks/useCallTrailer";
import useScreener from "../custom_hooks/useScreener";
import useSubmitEvents from "../custom_hooks/useSubmitEvents";
import useInputArr from "../custom_hooks/useInputArr";


export default function Home() {

  const [movieOne, directorOne, movieTwo, directorTwo, movieThree, directorThree, inputArr] = useInputArr()

  const [view, setView] = useState('INTRO')
  const [screenDirector, setScreenDirector] = useState(false)
  const [youtubeID, setYoutubeID] = useState("")
  const [result, setResult] = useState();
  const [toBeExcluded, setToBeExcluded] = useState([]);

  const [greetingLine1, setGreetingLine1] = useState("");
  const [greetingLine2, setGreetingLine2] = useState("");
  const [okButtonVisible, setOkButtonVisible] = useState(false);

  const movieOneStr = movieOne ? movieOne + " directed by " + directorOne : ''
  const movieTwoStr = movieTwo ? movieTwo + " directed by " + directorTwo : ''
  const movieThreeStr = movieThree ? movieThree + " directed by " + directorThree : ''

  const { callTrailer } = useCallTrailer(setYoutubeID, setView)
  const { screenResult } = useScreener(movieOneStr, movieTwoStr, movieThreeStr, toBeExcluded, setResult, callTrailer, screenDirector, directorOne, directorTwo, directorThree)
  const [onSubmit, onTryAgain] = useSubmitEvents(movieOneStr, movieTwoStr, movieThreeStr, screenResult, toBeExcluded, setToBeExcluded, setView)


  useEffect(() => {
    if (typeof window.adScriptLoaded === 'undefined') {
      console.log("adblocker")
    } else {
      console.log("no adblocker")
    }
  }, []);


  useEffect(() => {
    setTimeout(() => {
      setGreetingLine1("Welcome to the fortress of solitude...")
    }, 500)

    setTimeout(() => {
      setGreetingLine2("Just tell me what you like and I will tell you what you want to watch ok?")
    }, 1500)

    setTimeout(() => {
      setOkButtonVisible(true)
    }, 4000)
  }, [])


  return (
    <div>
      <Head>
        <title>Which2Watch</title>
        <link rel="icon" href="/Whattowatch_fav.png" />
      </Head>

      <main style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "600px", display: "flex", justifyContent: "center" }}>

          <img src="/shelf_L.png" style={{ position: "absolute", left: "0", height: "720px", opacity: "0.5" }} />

          <img src="/which2watch_title.png" style={{ position: "absolute", top: "-120px", maxWidth: "720px" }} />
          <img src={view === 'THINKING' ? superGeniusFrustrated.src : superGenius.src} style={{ position: "absolute", maxWidth: "480px" }} />

          <div style={{ position: "absolute", width: "100vw", height: "100vh", top: "0", left: "0", zIndex: "1", display: "flex", justifyContent: "center", alignItems: "center" }}>

            {view === 'INTRO' && (
              <div style={{ backgroundColor: "#000128", width: "600px", height: "400px", padding: "24px", transform: "translateY(320px)" }}>
                <h3>{greetingLine1}</h3>
                <h3>{greetingLine2}</h3>
                <button onClick={() => setView("GENERATE")} style={{ display: okButtonVisible ? "inherit" : "none" }}>{"OK"}</button>
              </div>

            )}

            {view === 'GENERATE' && (

              <form onSubmit={onSubmit} style={{ backgroundColor: "#000128", width: "600px", padding: "24px", transform: "translateY(200px)" }} >

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
                  value="Tell me what to watch"
                  style={{ width: "100%" }}
                />
              </form>

            )}

            {view === 'THINKING' && (
              <div>THINKING...</div>
            )}

            {view === 'RESULTS' && (
              <div style={{ width: "600px" }}>
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

        </div>
      </main>
    </div>
  );
}
