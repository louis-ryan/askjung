import { useState, useEffect, useRef } from "react";
import Head from "next/head";

export default function Home() {
  const [inputMethod, setInputMethod] = useState("SPEECH");
  const [dream, setDream] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [conversationStep, setConversationStep] = useState(-2); // Start at -2 for initial state
  const [currentSprite, setCurrentSprite] = useState("jung_neutral.png");
  const [isJungSpeaking, setIsJungSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const animationRef = useRef(null);
  const blinkRef = useRef(null);

  // Welcome messages
  const welcomeMessages = [
    "Welcome, dear dreamer.",
    "Greetings, seeker of the unconscious.",
    "Hello, fellow explorer of the psyche.",
    "Welcome to our journey through the unconscious.",
    "Greetings, traveler of the dream realm.",
    "Hello, and welcome to our exploration of the unconscious mind."
  ];

  const getRandomWelcomeMessage = () => {
    const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
    return welcomeMessages[randomIndex];
  };

  const startConversation = () => {
    setConversationStep(-1);
    handleSpeech(getRandomWelcomeMessage());
  };

  useEffect(() => {
    // Play welcome message when component mounts
    if (conversationStep === -1) {
      handleSpeech(getRandomWelcomeMessage());
    }
  }, []);

  async function onSubmit() {
    try {
      if (!dream.trim()) {
        // Show reminder message if input is empty
        handleSpeech("Please share your dream with me. I cannot analyze what I cannot see.");
        return;
      }

      setIsLoading(true);
      setCurrentSprite("jung_inhale.png");
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dream: dream,
          conversationHistory: conversationHistory
        }),
      });
      const data = await response.json();
      const newResponse = data.result.choices[0].text;

      setAnalysis(newResponse);
      setConversationHistory([...conversationHistory, { dream, response: newResponse }]);
      setConversationStep(conversationStep + 1);
      setDream('');

      handleSpeech(newResponse);

      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error("on submit err: ", error);
      setCurrentSprite("jung_neutral.png");
    } finally {
      setIsLoading(false);
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
    setIsJungSpeaking(true);
    const response = await fetch('/api/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: data }),
    });

    if (response.ok) {
      const audioData = await response.arrayBuffer();
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      // Start the mouth animation
      animationRef.current = setInterval(() => {
        setCurrentSprite(prev => prev === "jung_neutral.png" ? "jung_open_mouth.png" : "jung_neutral.png");
      }, 300);

      audioCtx.decodeAudioData(audioData, (buffer) => {
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = 0.75;
        source.connect(audioCtx.destination);

        source.onended = function () {
          // Stop the animation when audio ends
          if (animationRef.current) {
            clearInterval(animationRef.current);
            animationRef.current = null;
          }
          setCurrentSprite("jung_neutral.png");
          setIsJungSpeaking(false);
          setDream("");
          setAnalysis("");
          if (conversationStep === -1) {
            setConversationStep(0);
          }
        };

        source.start(0);
      }, (e) => {
        console.log("Error with decoding audio data", e.err);
        if (animationRef.current) {
          clearInterval(animationRef.current);
          animationRef.current = null;
        }
        setIsJungSpeaking(false);
        setCurrentSprite("jung_neutral.png");
      });
    } else {
      console.error('Failed to generate speech');
      setIsJungSpeaking(false);
      setCurrentSprite("jung_neutral.png");
    }
  };

  const handleChange = (event) => {
    setDream(event.target.value);
  };

  const resetConversation = () => {
    setConversationHistory([]);
    setConversationStep(-2);
    setDream('');
    setAnalysis('');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  // Add blinking animation
  useEffect(() => {
    if (!isJungSpeaking) {
      const blink = () => {
        setCurrentSprite("jung_blink.png");
        setTimeout(() => {
          setCurrentSprite("jung_neutral.png");
        }, 200); // Blink duration
      };

      // Random interval between 2-5 seconds
      const getRandomInterval = () => Math.floor(Math.random() * 3000) + 2000;

      const scheduleBlink = () => {
        blinkRef.current = setTimeout(() => {
          blink();
          scheduleBlink();
        }, getRandomInterval());
      };

      scheduleBlink();
    }

    return () => {
      if (blinkRef.current) {
        clearTimeout(blinkRef.current);
      }
    };
  }, [isJungSpeaking]);

  return (
    <div>
      <Head>
        <title>Ask Jung</title>
      </Head>

      <div className="App">
        <header className="App-header" style={{
          width: "100vw",
          height: "100vh",
          position: "relative",
          overflow: "hidden",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <img
              src={currentSprite}
              alt="Carl Jung portrait"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain"
              }}
            />
          </div>

          {/* <div style={{ 
            position: "relative",
            zIndex: 1,
            width: "100%",
            textAlign: "center",
            padding: "20px"
          }}>
            <h1 style={{ 
              color: "white", 
              margin: 0,
              fontSize: "2.5em",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)"
            }}>🕯️ AskJung.net 🕯️</h1>
          </div> */}

          {inputMethod === "SPEECH" && isListening && dream && (
            <p style={{
              textAlign: "left",
              position: "absolute",
              bottom: "52px",
              maxWidth: "400px",
              transform: "translateY(-132px)",
              backgroundColor: "black",
              color: "white",
              opacity: "0.8",
              zIndex: 1
            }}>
              {`ME: ${dream}`}
            </p>
          )}

          {conversationStep > -1 && analysis && (
            <p style={{
              textAlign: "left",
              position: "absolute",
              bottom: "0px",
              maxWidth: "400px",
              backgroundColor: "black",
              color: "white",
              opacity: "0.8",
              zIndex: 1
            }}>
              {`JUNG: ${analysis}`}
            </p>
          )}

          {!isJungSpeaking && (
            <div style={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              textAlign: "center",
              padding: "20px",
              marginTop: "auto"
            }}>
              {conversationStep === -2 ? (
                <button
                  onClick={startConversation}
                  style={{
                    width: "200px",
                    height: "60px",
                    fontSize: "1.2em",
                    backgroundColor: "#4a4a4a",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                >
                  Begin
                </button>
              ) : conversationStep === 2 ? (
                <>
                  <p style={{ marginBottom: "20px", color: "white" }}>Thank you for sharing your dream. I hope my analysis and book recommendation have been helpful.</p>
                  <p
                    onClick={resetConversation}
                    style={{
                      textDecoration: "underline",
                      cursor: "pointer",
                      color: "#ff4444",
                      fontSize: "1.2em",
                      fontWeight: "bold"
                    }}
                  >
                    Start New Conversation
                  </p>
                </>
              ) : (
                <>
                  {inputMethod === "SPEECH" ? (
                    <button onClick={() => {
                      if (!isListening) {
                        setIsListening(true);
                      } else {
                        setIsListening(false);
                        if (!dream.trim()) {
                          handleSpeech("Please share your dream with me. I cannot analyze what I cannot see.");
                          return;
                        }
                        onSubmit();
                      }
                    }} style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      backgroundColor: "white",
                      border: "none",
                      cursor: "pointer",
                      filter: isListening ? "invert(1)" : "invert(0)"

                    }}>
                      <img src="/icon_mic.png" alt="microphone" style={{ width: "100%", height: "100%" }} />
                    </button>
                  ) : (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (!dream.trim()) {
                        handleSpeech("Please share your dream with me. I cannot analyze what I cannot see.");
                        return;
                      }
                      onSubmit();
                    }}>
                      <textarea
                        value={dream}
                        onChange={handleChange}
                        placeholder={
                          conversationStep === -1
                            ? "Waiting for Jung's welcome message..."
                            : conversationStep === 0
                              ? "Describe your dream..."
                              : conversationStep === 1
                                ? "Answer the follow-up question..."
                                : "Share your thoughts..."
                        }
                        style={{
                          width: "80%",
                          maxWidth: "400px",
                          height: "160px",
                          marginBottom: "20px",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "none"
                        }}
                        disabled={conversationStep === -1}
                      />
                      <div>
                        <button type="submit" style={{
                          width: "80%",
                          maxWidth: "400px",
                          height: "40px",
                          backgroundColor: "#4a4a4a",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer"
                        }} disabled={conversationStep === -1}>
                          {conversationStep === -1
                            ? "Waiting for Jung..."
                            : conversationStep === 0
                              ? "Analyze Dream"
                              : conversationStep === 1
                                ? "Continue Analysis"
                                : "Get Book Recommendation"}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* {conversationStep !== -1 && (
                    <p
                      onClick={() => {
                        inputMethod === "SPEECH" ? setInputMethod("TEXT") : setInputMethod("SPEECH");
                        setDream("");
                      }}
                      style={{ 
                        textDecoration: "underline", 
                        cursor: "pointer",
                        color: "white",
                        textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)"
                      }}
                    >
                      {`Or would you rather ${inputMethod === "SPEECH" ? "type" : "talk"} ?`}
                    </p>
                  )} */}
                </>
              )}
            </div>
          )}
        </header>
      </div>
    </div>
  );
}
