import Head from "next/head";
import { useState, useEffect } from "react";
import MovieInput from "../components/MovieInput";
// import GoogleAd from "../components/GoogleAd";
import useCallTrailer from "../custom_hooks/useCallTrailer";
import useScreener from "../custom_hooks/useScreener";
import useSubmitEvents from "../custom_hooks/useSubmitEvents";
import useInputArr from "../custom_hooks/useInputArr";


const line1Greetings = ["Welcome to the fortress of solitude...", "Oh great... It's you", "Something tells me I am about to be bored"]
const line2Greetings = ["Let's be clear about one thing. I am in charge here. Now what do you want to watch?", "Just tell me what you like and I will tell you what you want to watch ok?"]


export default function Home() {

  const [movieOne, directorOne, movieTwo, directorTwo, movieThree, directorThree, inputArr] = useInputArr()

  const [windowWidth, setWindowWidth] = useState()
  const [view, setView] = useState('INTRO')
  const [error, setError] = useState("")
  const [screenDirector, setScreenDirector] = useState(true)
  const [youtubeID, setYoutubeID] = useState("")
  const [result, setResult] = useState();
  const [toBeExcluded, setToBeExcluded] = useState([])
  const [openTrailer, setOpenTrailer] = useState(false)

  const [theLoveList, setTheLoveList] = useState([])
  const [theHateList, setTheHateList] = useState([])

  const [primeBanner, setPrimeBanner] = useState('')
  const [mubiBanner, setMubiBanner] = useState('')

  const [greetingLine1, setGreetingLine1] = useState("");
  const [greetingLine2, setGreetingLine2] = useState("");
  const [okButtonVisible, setOkButtonVisible] = useState(false);


  const movieOneStr = () => { if (!movieOne) return; if (directorOne) { return movieOne + " directed by " + directorOne } else { return movieOne } }
  const movieTwoStr = () => { if (!movieTwo) return; if (directorTwo) { return movieTwo + " directed by " + directorTwo } else { return movieTwo } }
  const movieThreeStr = () => { if (!movieThree) return; if (directorThree) { return movieThree + " directed by " + directorThree } else { return movieThree } }

  const { callTrailer } = useCallTrailer(setYoutubeID, setView)
  const { screenResult } = useScreener(movieOneStr, movieTwoStr, movieThreeStr, toBeExcluded, setResult, setView, callTrailer, screenDirector, directorOne, directorTwo, directorThree)
  const [onSubmit, onTryAgain] = useSubmitEvents(movieOneStr, movieTwoStr, movieThreeStr, screenResult, toBeExcluded, setToBeExcluded, setView, setError, theLoveList, theHateList)


  const handleGuyState = () => {
    if (error) { return "/super_genius_intense.svg" }
    if (view === 'THINKING') { return "/super_genius_frustrated.svg" }
    if (view === 'GENERATE') { return "/super_genius_sipping.svg" }
    if (error) { return "/super_genius_intense.svg" }
    return "/super_genius.svg"
  }


  const handleLoveList = (result) => {

    if (theLoveList.includes(result)) {
      let newLoveList = [...theLoveList]
      let filteredLoveList = newLoveList.filter(item => item !== result);
      setTheLoveList(filteredLoveList)

    } else {
      let newLoveList = [...theLoveList]
      newLoveList.push(result)
      setTheLoveList(newLoveList)

      if (theHateList.includes(result)) {
        let newHateList = [...theHateList]
        let filteredHateList = newHateList.filter(item => item !== result);
        setTheHateList(filteredHateList)

      }
    }

  }


  const handleHateList = (result) => {

    if (theHateList.includes(result)) {
      let newHateList = [...theHateList]
      let filteredHateList = newHateList.filter(item => item !== result);
      setTheHateList(filteredHateList)

    } else {
      let newHateList = [...theHateList]
      newHateList.push(result)
      setTheHateList(newHateList)

      if (theLoveList.includes(result)) {
        let newLoveList = [...theLoveList]
        let filteredLoveList = newLoveList.filter(item => item !== result);
        setTheLoveList(filteredLoveList)

      }
    }

  }


  useEffect(() => {
    const ranNum = Math.floor(Math.random() * 3) + 1;
    setPrimeBanner(`/banner_prime_${ranNum}.png`);
  }, []);


  useEffect(() => {
    const ranNum = Math.floor(Math.random() * 3) + 1;
    setMubiBanner(`/banner_mubi_${ranNum}.png`);
  }, []);


  useEffect(() => {
    setWindowWidth(window.innerWidth)
  }, [])


  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
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
      setGreetingLine1(line1Greetings[Math.floor(Math.random() * line1Greetings.length)])
    }, 500)

    setTimeout(() => {
      setGreetingLine2(line2Greetings[Math.floor(Math.random() * line2Greetings.length)])
    }, 1500)

    setTimeout(() => {
      setOkButtonVisible(true)
    }, 2000)
  }, [])



  return (

    <div>
      <Head>
        <title>Which2Watch</title>
        <link rel="icon" href="/Whattowatch_fav.png" />
      </Head>

      {windowWidth > 720 && (
        <main style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <div style={{ maxWidth: "600px", display: "flex", justifyContent: "center" }}>

            {windowWidth > 1200 && (
              <>
                <img src="/shelf_L.png" style={{ position: "absolute", left: "0", height: "800px", opacity: "0.5" }} />
                <img src="/shelf_C.png" style={{ position: "absolute", left: "50%", transform: "translate(-50%)", height: "800px", opacity: "0.5" }} />
                <img src="/shelf_R.png" style={{ position: "absolute", right: "0", height: "800px", opacity: "0.5" }} />
              </>
            )}

            {windowWidth > 1200 && (
              <>
                <a href="https://www.amazon.com/gp/search?ie=UTF8&tag=which2watch-20&linkCode=ur2&linkId=fd770807defac209763be34eb4467994&camp=1789&creative=9325&index=aps&keywords=prime video" target="_blank">
                  <img className="banner_ad" src={primeBanner} style={{ position: "absolute", zIndex: "2", left: "80px", bottom: "160px", height: "400px" }} />
                </a>

                <a href="https://www.amazon.com/gp/search?ie=UTF8&tag=which2watch-20&linkCode=ur2&linkId=cf0e3efd6fe6d13d8b1e3a0cc5ee57b9&camp=1789&creative=9325&index=aps&keywords=mubi" target="_blank">
                  <img className="banner_ad" src={mubiBanner} style={{ position: "absolute", zIndex: "2", right: "80px", bottom: "160px", height: "400px" }} />
                </a>
              </>
            )}



            <div style={{ position: "absolute", width: "100%", top: "16px", zIndex: "4", display: "flex", justifyContent: "center" }}>
              <a className="navigation">{"Home"}</a>
              <a className="navigation" href="/blog" target="_blank">{"Blog"}</a>
              <a className="navigation" href="/privacy" target="_blank">{"Privacy policy"}</a>
            </div>

            {windowWidth > 720 && (
              <>
                <img src="/Which2watch_title.svg" style={{ position: "absolute", top: "-80px", width: "800px" }} />
                {openTrailer ? (
                  <iframe
                    className="the_guy"
                    src={`https://www.youtube.com/embed/${youtubeID}?autoplay=1&modestbranding=1`}
                    width={'600'}
                    height={'280'}
                    style={{ position: "absolute", transform: "translateY(180px)" }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : (
                  <>

                    <img className="the_guy" src={handleGuyState()} style={{ position: "absolute", width: windowWidth > 600 ? "480px" : "80%" }} />
                  </>
                )}

              </>
            )}

            <div style={{ position: "absolute", width: "100vw", height: "100vh", top: "0", left: "0", zIndex: "1", display: "flex", justifyContent: "center", alignItems: "center" }}>

              {view === 'INTRO' && (
                <div style={{ position: "absolute", zIndex: "4", bottom: "40px", width: "600px", padding: "8px", backgroundColor: "rgb(33, 34, 35)" }}>
                  <h3>{greetingLine1}</h3>
                  <h3>{greetingLine2}</h3>
                  <button onClick={() => setView("GENERATE")} style={{ opacity: okButtonVisible ? "1" : "0", transition: "1s" }}>{"OK"}</button>
                </div>

              )}

              {view === 'GENERATE' && (
                <div style={{ position: "absolute", zIndex: "4", bottom: "40px", width: "600px", padding: "8px", backgroundColor: "rgb(33, 34, 35)" }}>
                  {/* <div style={{ position: "absolute", left: "24px", zIndex: "4", width: "300px", height: "600px", backgroundColor: "white" }} >
           <GoogleAd />
         </div> */}

                  {error ? (
                    <h3>{error}</h3>
                  ) : (
                    <form onSubmit={onSubmit} >

                      <h3>{"Tell me up to 3 movies that you are in the mood for and I will tell you what to watch"}</h3>

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

                      {/* <div style={{ display: "flex" }}>
               <input type="checkbox" onClick={() => { screenDirector === false ? setScreenDirector(true) : setScreenDirector(false) }} />
               <div style={{ width: "8px" }} />
               <p>Exclude movies from listed directors</p>
             </div> */}

                      <div style={{ height: "16px" }} />
                      <input
                        type="submit"
                        value="Tell me what to watch"
                        style={{ width: "100%" }}
                      />
                    </form>
                  )}
                </div>

              )}

              {view === 'THINKING' && (
                <h3 style={{ position: "absolute", bottom: "40px", width: "600px", padding: "80px", backgroundColor: "rgb(33, 34, 35)" }}>I'm thinking ok...</h3>
              )}

              {view === 'RESULTS' && (


                <div style={{ position: "absolute", bottom: "40px", width: "600px", padding: "8px", backgroundColor: "rgb(33, 34, 35)" }}>

                  <h3>The movie for you is:</h3>
                  <h3>{result}</h3>
                  <a href="https://www.amazon.com/gp/search?ie=UTF8&tag=which2watch-20&linkCode=ur2&linkId=dc4abe79d5103c50924fb71aa3b8c2bc&camp=1789&creative=9325&index=instant-video&keywords=12 Angry Men 1957 Sidney Lumet rent" target="_blank">
                    <h3>{"WATCH IT HERE"}</h3>
                  </a>


                  <div style={{ height: "16px" }} />

                  <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>


                    <div
                      className="guiding_button"
                      onClick={() => handleLoveList(result)}
                      style={{ opacity: theLoveList.includes(result) ? "1" : "0.5" }}
                    >
                      <div style={{ fontSize: "32px" }}> 👍</div>

                      <div>
                        {"More like this!"}
                      </div>
                    </div>


                    <div
                      className="guiding_button"
                      onClick={() => { setOpenTrailer((prev) => prev ? false : true); callTrailer(result) }}
                      style={{ opacity: openTrailer ? "1" : "0.5" }}
                    >
                      <div style={{ fontSize: "32px" }}> 📺</div>

                      <div>
                        {"Watch trailer"}
                      </div>
                    </div>

                    <div
                      className="guiding_button"
                      onClick={() => handleHateList(result)}
                      style={{ opacity: theHateList.includes(result) ? "1" : "0.5" }}
                    >
                      <div style={{ fontSize: "32px" }}> 👎</div>

                      <div>
                        {"No you are way off!"}
                      </div>
                    </div>


                  </div>

                  <div style={{ height: "16px" }} />

                  <button
                    onClick={() => { setOpenTrailer(false); onTryAgain(result) }}
                    style={{ width: "100%", backgroundColor: "unset", border: "1px solid #B1318E" }}
                  >
                    Try again
                  </button>

                </div>

              )}
            </div>

          </div>
        </main>
      )}


      {windowWidth <= 720 && (
        <div style={{ width: "100vw", display: "flex", justifyContent: "center" }}>
          <img src="/Which2watch_title.svg" style={{ position: "absolute", top: "-40px", width: "100%" }} />
          <img className="the_guy" src={handleGuyState()} style={{ position: "absolute", top: "40px", width: "80%" }} />

          <div style={{ position: "absolute", bottom: "80px", width: "100%", padding: "40px", backgroundColor: "rgb(33, 34, 35)" }}>
            <h3>{"This website does not work on your mobile. You will need to take your computer"}</h3>
            <h3>{"Now is that so hard?"}</h3>
          </div>
        </div>
      )}

    </div>
  );

}
