import Head from "next/head";
import { useState } from "react";
import MovieInput from "../components/MovieInput";
import whatToWatchPoster from "../public/Whattowatchposter.png"

export default function Home() {

  const [view, setView] = useState('GENERATE')

  const [movieOne, setMovieOne] = useState("");
  const [directorOne, setDirectorOne] = useState("");
  const [movieTwo, setMovieTwo] = useState("");
  const [directorTwo, setDirectorTwo] = useState("");
  const [movieThree, setMovieThree] = useState("");
  const [directorThree, setDirectorThree] = useState("");

  const [screenDirector, setScreenDirector] = useState(false)
  const [youtubeID, setYoutubeID] = useState("")

  const [result, setResult] = useState();
  const [toBeExcluded, setToBeExcluded] = useState([]);

  const movieOneStr = movieOne ? movieOne + " directed by " + directorOne : ''
  const movieTwoStr = movieTwo ? movieTwo + " directed by " + directorTwo : ''
  const movieThreeStr = movieThree ? movieThree + " directed by " + directorThree : ''


  async function callTrailer(query) {
    // setView('RESULTS')
    try {
      const response = await fetch(`/api/trailer?query=${query} official trailer`);
      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }
      const idFromSearch = data.items[0].id.videoId
      setYoutubeID(idFromSearch)
      setView('RESULTS')
    } catch (error) {
      console.error(error);
    }
  }


  async function callForScreener() {
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieOne: movieOneStr,
          movieTwo: movieTwoStr,
          movieThree: movieThreeStr,
          toBeExcluded: toBeExcluded
        }),
      });
      const data = await response.json();
      if (response.status !== 200) { throw data.error || new Error(`Request failed with status ${response.status}`); }
      screenResult(data.result)
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }


  function excludeRepeats(strTitle) {
    toBeExcluded.forEach((movie) => {

      const movieArr = movie.split(' (')
      const excludedTitle = movieArr[0].toLowerCase()
      const thisTitle = strTitle.toLowerCase()

      console.log("excluded: ", excludedTitle)
      console.log("this: ", thisTitle)

      if (thisTitle.includes(excludedTitle)) {
        console.log("MATCH")
        callForScreener()
      }
    })
  }


  async function screenResult(movieStr) {

    const [strTitle, strYear, strDirector] = movieStr.split('; ')
    const resultStr = `${strTitle} (${strYear}) directed by ${strDirector}`

    console.log("to be excluded: ", toBeExcluded)

    excludeRepeats(strTitle)

    if (screenDirector === false) {
      setResult(resultStr);
      callTrailer(movieStr);
      // setView('RESULTS')
      return
    }

    const sameDirectorAsSearch = (strDirector.toLowerCase() === directorOne || strDirector.toLowerCase() === directorTwo || strDirector.toLowerCase() === directorThree)

    console.log({
      title: strTitle.toLowerCase(),
      year: strYear,
      director: strDirector.toLowerCase()
    })

    if (sameDirectorAsSearch) {
      callForScreener()
    } else {
      setResult(resultStr);
      callTrailer(movieStr);
      // setView('RESULTS')
    }
  }


  async function onSubmit(event) {
    event.preventDefault();
    setView('THINKING')
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieOne: movieOneStr,
          movieTwo: movieTwoStr,
          movieThree: movieThreeStr
        }),
      });
      const data = await response.json();
      if (response.status !== 200) { throw data.error || new Error(`Request failed with status ${response.status}`); }
      screenResult(data.result)
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  async function onTryAgain(result) {
    setView('THINKING')
    var newToBeExcluded = toBeExcluded
    newToBeExcluded.push(result)
    setToBeExcluded(newToBeExcluded)
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieOne: movieOneStr,
          movieTwo: movieTwoStr,
          movieThree: movieThreeStr,
          toBeExcluded: toBeExcluded
        }),
      });
      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }
      screenResult(data.result)
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <div>
      <Head>
        <title>Whattowatch???</title>
        <link rel="icon" href="/dog.png" />
      </Head>

      <main style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "600px" }}>

          <img src={whatToWatchPoster.src} style={{ width: "100%" }}></img>

          {view === 'GENERATE' && (
            <div>
              <h4>Input up to 3 movies which combined, would make your perfect movie for right now.</h4>
              <form onSubmit={onSubmit}>
                <MovieInput
                  movieInputName={"movieOne"}
                  directorInputName={"directorOne"}
                  movie={movieOne}
                  director={directorOne}
                  moviePlaceholder={"First Movie"}
                  directorPlaceholder={"Directed by..."}
                  setMovie={setMovieOne}
                  setDirector={setDirectorOne}
                />
                <div style={{ height: "16px" }} />
                <MovieInput
                  movieInputName={"movieTwo"}
                  directorInputName={"directorTwo"}
                  movie={movieTwo}
                  director={directorTwo}
                  moviePlaceholder={"Second Movie"}
                  directorPlaceholder={"Directed by..."}
                  setMovie={setMovieTwo}
                  setDirector={setDirectorTwo}
                />
                <div style={{ height: "16px" }} />
                <MovieInput
                  movieInputName={"movieThree"}
                  directorInputName={"directorThree"}
                  movie={movieThree}
                  director={directorThree}
                  moviePlaceholder={"Third Movie"}
                  directorPlaceholder={"Directed by..."}
                  setMovie={setMovieThree}
                  setDirector={setDirectorThree}
                />
                <div style={{ height: "16px" }} />

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
