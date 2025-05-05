import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { booksList } from "../booksList";

export default function Home() {
  const [inputMethod, setInputMethod] = useState("SPEECH");
  const [dream, setDream] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [conversationStep, setConversationStep] = useState(-2); // Start at -2 for initial state
  const [currentSprite, setCurrentSprite] = useState("jung_neutral_ext.png");
  const [isJungSpeaking, setIsJungSpeaking] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [speechInstruction, setSpeechInstruction] = useState(true);
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

  const startConversation = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream after getting permission

      // Initialize audio context
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
        
        // Resume audio context if it's suspended (required for mobile)
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        
        setIsAudioInitialized(true);
        console.log('Audio context initialized:', audioContextRef.current.state);
      }

      const welcomeMessage = getRandomWelcomeMessage();
      setCurrentMessage(welcomeMessage);
      setConversationStep(-1);
      handleSpeech(welcomeMessage);
    } catch (error) {
      console.error('Error initializing audio:', error);
      // Provide fallback for mobile devices
      setIsAudioInitialized(false);
      alert('Please allow microphone access to hear Jung\'s responses.');
    }
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
      setCurrentSprite("jung_inhale_ext.png");
      setIsTransitioning(true);
      setIsListening(false); // Ensure microphone is turned off

      let fullResponse = '';
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dream: dream,
          conversationHistory: conversationHistory,
          booksList: booksList
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                fullResponse += data.text;
                setCurrentMessage(fullResponse);
              }
            } catch (error) {
              console.error('Error parsing chunk:', error);
            }
          }
        }
      }

      setAnalysis(fullResponse);
      setConversationHistory([...conversationHistory, { dream, response: fullResponse }]);
      setConversationStep(conversationStep + 1);
      setDream('');

      handleSpeech(fullResponse);

    } catch (error) {
      console.error("on submit err: ", error);
      setCurrentSprite("jung_neutral_ext.png");
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

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US'; // Set language explicitly

      recognition.onstart = () => {
        console.log('Voice recognition started. Speak into the microphone.');
      };

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setDream(transcript);
      };

      recognition.onerror = (event) => {
        // Only log errors that aren't expected aborts
        if (event.error !== 'aborted') {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            // Handle permission denied
            alert('Please enable microphone access in your browser settings.');
          }
        }
      };

      recognition.onend = () => {
        // Only log if we're still in listening mode (unexpected end)
        if (isListening) {
          console.log('Voice recognition stopped unexpectedly.');
        }
      };

      if (isListening) {
        try {
          recognition.start();
        } catch (error) {
          console.error('Error starting speech recognition:', error);
          setIsListening(false);
          alert('Speech recognition is not available. Please check your microphone permissions.');
        }
      } else {
        recognition.stop();
      }

      return () => recognition.abort();
    } else {
      console.warn('Speech recognition not available');
      // Provide fallback for browsers without speech recognition
      alert('Speech recognition is not supported in your browser. Please use a modern browser like Chrome.');
    }
  }, [isListening]);

  const handleSpeech = async (data) => {
    console.log("Starting speech handling");
    setIsJungSpeaking(true);
    setCurrentMessage(data);

    try {
      // Check if audio context is initialized
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
      }

      // Resume audio context if it's suspended (required for mobile)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Fetch audio data
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: data }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      // Stream the audio data
      const reader = response.body.getReader();
      const chunks = [];
      let totalLength = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        totalLength += value.length;
      }

      // Concatenate chunks into a single Uint8Array
      const audioData = new Uint8Array(totalLength);
      let position = 0;
      for (const chunk of chunks) {
        audioData.set(chunk, position);
        position += chunk.length;
      }

      // Decode audio data in a separate task to prevent blocking
      const buffer = await audioContextRef.current.decodeAudioData(audioData.buffer);

      // Create and configure audio source
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = 0.75;
      source.connect(audioContextRef.current.destination);

      // Set playing state
      setIsAudioPlaying(true);
      console.log("Audio playing state set to true");

      // Start auto-scroll after a short delay
      setTimeout(() => {
        if (scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          const contentHeight = container.scrollHeight;
          const containerHeight = container.clientHeight;
          const scrollDistance = contentHeight - containerHeight;

          if (scrollDistance > 0) {
            const startTime = performance.now();
            const baseDuration = 20000;
            const additionalDuration = Math.floor(scrollDistance / 100) * 2000;
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

      // Handle audio completion
      source.onended = () => {
        console.log("Audio ended");
        if (animationRef.current) {
          clearInterval(animationRef.current);
          animationRef.current = null;
        }
        setCurrentSprite("jung_neutral_ext.png");
        setIsJungSpeaking(false);
        setIsAudioPlaying(false);
        setDream("");
        setAnalysis("");
        setConversationStep(0);
      };

      // Start the mouth animation and end transition just before starting the audio
      setIsTransitioning(false);
      animationRef.current = setInterval(() => {
        setCurrentSprite(prev => prev === "jung_neutral_ext.png" ? "jung_open_mouth_ext.png" : "jung_neutral_ext.png");
      }, 300);

      // Start playback
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
      setCurrentSprite("jung_neutral_ext.png");
      setIsTransitioning(false);
      // Provide user feedback for mobile-specific errors
      if (error.message.includes('AudioContext')) {
        alert('Audio playback is not supported. Please try a different browser or device.');
      }
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
        setCurrentSprite("jung_blink_ext.png");
        setTimeout(() => {
          setCurrentSprite("jung_neutral_ext.png");
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


      {/* JUNG SPEECH BUBBLE */}
      {isAudioPlaying && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "calc(100vw - 48px)",
          backgroundColor: "white",
          padding: "16px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          zIndex: 2,
          borderRadius: "8px",
          overflow: "hidden"
        }}>
          <div
            ref={scrollContainerRef}
            style={{
              maxHeight: "320px",
              overflowY: "scroll",
              paddingRight: "8px",
              scrollbarWidth: "none",
              scrollbarColor: "#4a4a4a #f0f0f0"
            }}
          >
            <p style={{
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

      {/* JUNG PORTRAIT */}
      <div style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <img
          src={isTransitioning ? "jung_inhale_ext.png" : currentSprite}
          alt="Carl Jung portrait"
          style={{
            width: "100%",
            maxHeight: "100vh"
          }}
        />
      </div>

      {/* JUNG SPEECH INTERACTION */}
      {!isJungSpeaking && (
        <div style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1,
          textAlign: "center",
          padding: "16px",
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
              <p style={{ marginBottom: "20px", color: "black" }}>Thank you for sharing your dream. I hope my analysis and book recommendation have been helpful.</p>
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
                    <div>
                      {speechInstruction && (
                        <h4 style={{ marginBottom: "24px" }}>
                          Tap the microphone and describe your dream
                        </h4>
                      )}
                      <button
                        onClick={() => {
                          setIsListening(true);
                          setSpeechInstruction(false);
                        }}
                        style={{
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
                    </div>
                  ) : (
                    <>
                      <p style={{
                        color: "black",
                        fontSize: "1.4em",
                        marginBottom: "20px",
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
                      height: "120px", // Reduced height
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
    </div>
  );
}