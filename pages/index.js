import Head from "next/head";
import { useState, useEffect } from "react";
import MovieInput from "../components/MovieInput";
import useCallTrailer from "../custom_hooks/useCallTrailer";
import useScreener from "../custom_hooks/useScreener";
import useSubmitEvents from "../custom_hooks/useSubmitEvents";
import useInputArr from "../custom_hooks/useInputArr";


export default function Home() {

  const [movieOne, directorOne, movieTwo, directorTwo, movieThree, directorThree, inputArr] = useInputArr()

  const [view, setView] = useState('INTRO')
  const [error, setError] = useState("")
  const [screenDirector, setScreenDirector] = useState(false)
  const [youtubeID, setYoutubeID] = useState("")
  const [thumbnail, setThumbnail] = useState("")
  const [result, setResult] = useState();
  const [toBeExcluded, setToBeExcluded] = useState([]);

  const [greetingLine1, setGreetingLine1] = useState("");
  const [greetingLine2, setGreetingLine2] = useState("");
  const [okButtonVisible, setOkButtonVisible] = useState(false);

  const movieOneStr = movieOne ? movieOne + " directed by " + directorOne : ''
  const movieTwoStr = movieTwo ? movieTwo + " directed by " + directorTwo : ''
  const movieThreeStr = movieThree ? movieThree + " directed by " + directorThree : ''

  const { callTrailer } = useCallTrailer(setYoutubeID, setThumbnail, setView)
  const { screenResult } = useScreener(movieOneStr, movieTwoStr, movieThreeStr, toBeExcluded, setResult, callTrailer, screenDirector, directorOne, directorTwo, directorThree)
  const [onSubmit, onTryAgain] = useSubmitEvents(movieOneStr, movieTwoStr, movieThreeStr, screenResult, toBeExcluded, setToBeExcluded, setView, setError)


  useEffect(() => {
    if (typeof window.adScriptLoaded === 'undefined') {
      console.log("adblocker")
    } else {
      console.log("no adblocker")
    }
  }, []);


  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError("")
      }, 3000)
    }
  }, [error])


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


  const handleGuyState = () => {
    if (view === 'THINKING') { return "/super_genius_frustrated.svg" }
    if (view === 'RESULTS') {return "/super_genius_holding.svg"}
    if (error) { return "/super_genius_intense.svg" }
    return "/super_genius.svg"
  }


  return (
    <div>
      <Head>
        <title>Which2Watch</title>
        <link rel="icon" href="/Whattowatch_fav.png" />
      </Head>

      <main style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "600px", display: "flex", justifyContent: "center" }}>

          <img src="/shelf_L.png" style={{ position: "absolute", left: "0", height: "720px", opacity: "0.5" }} />
          <img src="/shelf_R.png" style={{ position: "absolute", right: "0", height: "720px", opacity: "0.5" }} />

          <img src="/Which2watch_title.png" style={{ position: "absolute", top: "-120px", maxWidth: "720px" }} />
          <img src={handleGuyState()} style={{ position: "absolute", maxWidth: "480px" }} />

          <div style={{ position: "absolute", width: "100vw", height: "100vh", top: "0", left: "0", zIndex: "1", display: "flex", justifyContent: "center", alignItems: "center" }}>

            {view === 'INTRO' && (
              <div style={{ backgroundColor: "#000128", width: "600px", height: "400px", padding: "24px", transform: "translateY(320px)" }}>
                <h3>{greetingLine1}</h3>
                <h3>{greetingLine2}</h3>
                <button onClick={() => setView("GENERATE")} style={{ display: okButtonVisible ? "inherit" : "none" }}>{"OK"}</button>
              </div>

            )}

            {view === 'GENERATE' && (
              <>
                {error ? (
                  <h3 style={{ padding: "24px", backgroundColor: "#000128" }}>{error}</h3>
                ) : (
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
              </>

            )}

            {view === 'THINKING' && (
              <h3 style={{ padding: "24px", backgroundColor: "#000128" }}>I'm thinking ok...</h3>
            )}

            {view === 'RESULTS' && (
              <>
                <img src={thumbnail} style={{ position: "absolute", width: "100px", top: "360px" }} />
                <div style={{ width: "600px", padding: "24px", backgroundColor: "#000128", transform: "translateY(240px)" }}>
                  <h3>The movie for you is:</h3>
                  <h3>{result}</h3>
                  <div style={{ height: "8px" }} />
                  {/* <iframe
                  src={`https://www.youtube.com/embed/${youtubeID}`}
                  width={'600'}
                  height={'300'}
                /> */}
                  <div style={{ height: "16px" }} />
                  <button
                    onClick={() => onTryAgain(result)}
                    style={{ width: "100%" }}
                  >
                    Try again
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
