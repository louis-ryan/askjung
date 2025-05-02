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
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const animationRef = useRef(null);
  const blinkRef = useRef(null);
  const audioContextRef = useRef(null);
  const scrollContainerRef = useRef(null);

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
    const welcomeMessage = getRandomWelcomeMessage();
    setCurrentMessage(welcomeMessage);
    setConversationStep(-1);
    handleSpeech(welcomeMessage);
  };

  useEffect(() => {
    // Play welcome message when component mounts
    if (conversationStep === -1) {
      handleSpeech(getRandomWelcomeMessage());
    }
  }, []);

  // Initialize audio context on user interaction
  useEffect(() => {
    const initializeAudio = async () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        try {
          await audioContextRef.current.resume();
          setIsAudioInitialized(true);
          console.log('Audio context initialized:', audioContextRef.current.state);
        } catch (error) {
          console.error('Error initializing audio context:', error);
        }
      }
    };

    // Add event listeners for user interaction
    const handleUserInteraction = () => {
      initializeAudio();
      // Remove event listeners after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
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
      setIsTransitioning(true);
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
      setIsTransitioning(false);
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
    console.log("Starting speech handling");
    setIsJungSpeaking(true);
    setIsTransitioning(false);
    setCurrentMessage(data);
    const response = await fetch('/api/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: data }),
    });

    if (response.ok) {
      const audioData = await response.arrayBuffer();

      try {
        // Create audio context if it doesn't exist
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // Resume audio context if it's suspended (required for mobile)
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }

        // Start the mouth animation
        animationRef.current = setInterval(() => {
          setCurrentSprite(prev => prev === "jung_neutral.png" ? "jung_open_mouth.png" : "jung_neutral.png");
        }, 300);

        const buffer = await audioCtx.decodeAudioData(audioData);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = 0.75;
        source.connect(audioCtx.destination);

        // Set playing state immediately before starting
        setIsAudioPlaying(true);
        console.log("Audio playing state set to true");

        // Start auto-scroll after a short delay to allow content to render
        setTimeout(() => {
          if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const contentHeight = container.scrollHeight;
            const containerHeight = container.clientHeight;
            const scrollDistance = contentHeight - containerHeight;
            
            if (scrollDistance > 0) {
              const startTime = performance.now();
              // Base duration of 20 seconds for medium length text (about 200px scroll)
              // Add 2 seconds for every additional 100px of scroll
              const baseDuration = 20000; // 20 seconds
              const additionalDuration = Math.floor(scrollDistance / 100) * 2000; // 2 seconds per 100px
              const duration = baseDuration + additionalDuration;
              
              const animateScroll = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const currentScroll = progress * scrollDistance;
                container.scrollTop = currentScroll;
                
                if (progress < 1) {
                  requestAnimationFrame(animateScroll);
                }
              };
              
              requestAnimationFrame(animateScroll);
            }
          }
        }, 500);

        source.onended = function () {
          console.log("Audio ended");
          // Stop the animation when audio ends
          if (animationRef.current) {
            clearInterval(animationRef.current);
            animationRef.current = null;
          }
          setCurrentSprite("jung_neutral.png");
          setIsJungSpeaking(false);
          setIsAudioPlaying(false);
          setDream("");
          setAnalysis("");
          // Always set conversationStep to 0 after speech ends
          setConversationStep(0);
        };

        source.start(0);
        console.log("Audio source started");
      } catch (error) {
        console.error("Error with audio playback:", error);
        if (animationRef.current) {
          clearInterval(animationRef.current);
          animationRef.current = null;
        }
        setIsJungSpeaking(false);
        setIsAudioPlaying(false);
        setCurrentSprite("jung_neutral.png");
      }
    } else {
      console.error('Failed to generate speech');
      setIsJungSpeaking(false);
      setIsAudioPlaying(false);
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
          width: "100%",
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
            {isAudioPlaying && (
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                maxHeight: "240px",
                backgroundColor: "white",
                padding: "20px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                zIndex: 2,
                overflow: "hidden"
              }}>
                <div 
                  ref={scrollContainerRef}
                  style={{
                    maxHeight: "200px", // 240px - 40px padding
                    overflowY: "auto",
                    paddingRight: "10px"
                  }}
                >
                  <p style={{
                    margin: 0,
                    color: "black",
                    fontSize: "1.2em",
                    lineHeight: "1.5",
                    whiteSpace: "pre-wrap"
                  }}>
                    {currentMessage}
                  </p>
                </div>
              </div>
            )}
            <img
              src={isTransitioning ? "jung_inhale.png" : currentSprite}
              alt="Carl Jung portrait"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain"
              }}
            />
          </div>

          {!isJungSpeaking && (
            <div style={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              textAlign: "center",
              padding: "20px",
              marginTop: "auto",
              backgroundColor: "white"
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
                    <>
                      {!isListening ? (
                        <button onClick={() => setIsListening(true)} style={{
                          width: "120px",
                          height: "120px",
                          borderRadius: "50%",
                          backgroundColor: "white",
                          border: "none",
                          cursor: "pointer",
                          filter: "invert(1)",
                          padding: "16px",
                        }}>
                          <img src="/icon_mic.png" alt="microphone" style={{ width: "100%", height: "100%" }} />
                        </button>
                      ) : (
                        <>
                          <p style={{
                            color: "black",
                            fontSize: "1.4em",
                            marginBottom: "20px",
                            backgroundColor: "white",
                          }}>
                            {dream || "Listening..."}
                          </p>
                          <div style={{
                            display: "flex",
                            gap: "20px",
                            justifyContent: "center"
                          }}>
                            <button 
                              onClick={() => {
                                setIsListening(false);
                                onSubmit();
                              }}
                              style={{
                                width: "120px",
                                height: "60px",
                                fontSize: "1.2em",
                                backgroundColor: "#4a4a4a",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer"
                              }}
                            >
                              Submit
                            </button>
                            <button 
                              onClick={() => {
                                setIsListening(false);
                                setDream("");
                                setIsListening(true);
                              }}
                              style={{
                                width: "120px",
                                height: "60px",
                                fontSize: "1.2em",
                                backgroundColor: "#4a4a4a",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer"
                              }}
                            >
                              Start Over
                            </button>
                          </div>
                        </>
                      )}
                    </>
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
                </>
              )}
            </div>
          )}
        </header>
      </div>
    </div>
  );
}