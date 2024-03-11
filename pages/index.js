import { useState, useEffect } from "react";
import Head from "next/head";

export default function Home() {

  const [inputMethod, setInputMethod] = useState("SPEECH")

  const [jungImg, setJungImg] = useState("https://ichef.bbci.co.uk/images/ic/320x320/p01gn560.jpg.webp")

  const [dream, setDream] = useState('');
  const [analysis, setAnalysis] = useState('');

  const [isListening, setIsListening] = useState(false);


  async function onSubmit() {

    setJungImg("https://www.thesap.org.uk/wp-content/uploads/2023/03/cgjung-4-600x600.jpeg")

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dream: dream
        }),
      });
      const data = await response.json();

      setAnalysis(data.result.choices[0].text)

      handleSpeech(data.result.choices[0].text)

      if (response.status !== 200) { throw data.error || new Error(`Request failed with status ${response.status}`); }
    } catch (error) {
      console.error("on submit err: ", error);
    }
  }


  /**
   * Speech-to-text
   */
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();

      recognition.continuous = true; // Keep listening even after a pause
      recognition.interimResults = true; // Show results even before it's final

      recognition.onstart = () => {
        console.log('Voice recognition started. Speak into the microphone.');
      };

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setDream(transcript);
      };

      recognition.onend = () => {
        console.log('Voice recognition stopped.');
      };

      if (isListening) {
        recognition.start();
      } else {
        recognition.stop();
      }

      return () => recognition.abort();
    } else {
      console.warn('Speech recognition not available');
    }
  }, [isListening]);



  const handleSpeech = async (data) => {
    const response = await fetch('/api/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: data }),
    });

    if (response.ok) {
      const audioData = await response.arrayBuffer(); // Get audio data as array buffer
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)(); // Create a new AudioContext
      audioCtx.decodeAudioData(audioData, (buffer) => {
        const source = audioCtx.createBufferSource(); // Creates a sound source
        source.buffer = buffer; // Tell the source which sound to play

        // Lower the playback rate, which slows down the audio and lowers its pitch
        source.playbackRate.value = 0.75;

        source.connect(audioCtx.destination); // Connect the source to the context's destination (the speakers)

        source.onended = function () {
          setJungImg("https://ichef.bbci.co.uk/images/ic/320x320/p01gn560.jpg.webp");
          setDream("");
          setAnalysis("");
        };

        setJungImg("VIDEO")

        source.start(0); // Play the sound now
      }, (e) => { console.log("Error with decoding audio data", e.err); });
    } else {
      console.error('Failed to generate speech');
    }
  };




  const handleChange = (event) => {
    setDream(event.target.value);
  };



  return (

    <div>
      <Head>
        <title>Ask Jung</title>
        <link rel="icon" href="/pngtree-mourning-candle-png-image_6568463.png" />
      </Head>




      <div className="App">
        <header className="App-header" style={{ width: "400px" }}>

          <div style={{ height: "8px" }} />

          <h1>🕯️ AskJung.net 🕯️</h1>

          <div style={{ height: "8px" }} />


          {jungImg !== 'VIDEO' ? (
            <img src={jungImg} style={{ width: "400px" }} />
          ) : (
            <video
              src="https://dnznrvs05pmza.cloudfront.net/4804d158-f17b-48cc-9c0a-65f507545400.mp4?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNDY1OGU3ODdjOGYzOGM1ZSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTcxMDI4ODAwMH0.MEt80-vu_ntynyQ9Dsl8YPnyFcYfuLT36kxpL-pW8BY"
              type="video/mp4"
              autoPlay={true}
              loop={true}
              muted={true}
              style={{ width: "400px" }}
            />
          )}

          {inputMethod === "SPEECH" && isListening && dream && (
            <p style={{ textAlign: "left", position: "absolute", bottom: "52px", maxWidth: "400px", transform: "translateY(-132px)", backgroundColor: "black", color: "white", opacity: "0.8" }}>
              {`ME: ${dream}`}
            </p>
          )}


          {jungImg === 'VIDEO' && analysis && (
            <p style={{ textAlign: "left", position: "absolute", bottom: "0px", maxWidth: "400px", backgroundColor: "black", color: "white", opacity: "0.8" }}>
              {`JUNG: ${analysis}`}
            </p>
          )}



          <div style={{ height: "24px" }} />

          {jungImg === "https://ichef.bbci.co.uk/images/ic/320x320/p01gn560.jpg.webp" && (
            <>
              {inputMethod === "SPEECH" ? (
                <div>
                  <button onClick={() => {
                    if (!isListening) {
                      setIsListening(true)
                    } else {
                      setIsListening(false)
                      onSubmit()
                    }
                    // setIsListening((prevIsListening) => !prevIsListening)
                  }
                  } style={{ width: "120px", height: "120px", borderRadius: "50%" }}>
                    {isListening ? 'Stop Listening' : 'Start Listening'}
                  </button>
                  {/* <p>Transcript: {transcript}</p> */}
                </div>
              ) : (
                <form onSubmit={onSubmit}>

                  <div style={{ height: "24px" }} />

                  <textarea value={dream} onChange={handleChange} placeholder="Describe your dream..." style={{ width: "400px", height: "160px" }} />

                  <div style={{ height: "24px" }} />


                  <div>
                    <button type="submit" style={{ width: "400px", height: "40px" }}>Analyze Dream</button>
                  </div>

                </form>
              )}



              <p
                onClick={() => {
                  inputMethod === "SPEECH" ? setInputMethod("TEXT") : setInputMethod("SPEECH");
                  setDream("")
                }}
                style={{ textDecoration: "underline", cursor: "pointer" }}
              >
                {`Or would you rather ${inputMethod === "SPEECH" ? "type" : "talk"} ?`}
              </p>

            </>
          )}

        </header>
      </div>
    </div>
  );

}
