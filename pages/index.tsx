import { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
import Head from "next/head";
import { booksList } from "../booksList";
import BookRecommendationModal from "../components/BookRecommendationModal";

interface ConversationEntry {
  dream: string;
  response: string;
}

type InputMethod = "SPEECH" | "TEXT";

export default function Home() {
  const [inputMethod, setInputMethod] = useState<InputMethod>("SPEECH");
  const [dream, setDream] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([]);
  const [conversationStep, setConversationStep] = useState<number>(0);
  const conversationStepRef = useRef(conversationStep);
  const [currentSprite, setCurrentSprite] = useState<string>("jung_neutral_ext.png");
  const [isJungSpeaking, setIsJungSpeaking] = useState<boolean>(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAudioInitialized, setIsAudioInitialized] = useState<boolean>(false);
  const [speechInstruction, setSpeechInstruction] = useState<boolean>(true);
  const [isBookModalOpen, setIsBookModalOpen] = useState<boolean>(false);
  const [recommendedBook, setRecommendedBook] = useState<null | typeof booksList[0]>(null);
  
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const blinkRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Welcome messages
  const welcomeMessages: string[] = [
    "Welcome, dear dreamer.",
    "Greetings, seeker of the unconscious.",
    "Hello, fellow explorer of the psyche.",
    "Welcome to our journey through the unconscious.",
    "Greetings, traveler of the dream realm.",
    "Hello, and welcome to our exploration of the unconscious mind."
  ];

  const getRandomWelcomeMessage = (): string => {
    const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
    return welcomeMessages[randomIndex];
  };

  const startConversation = (): void => {
    const welcomeMessage = getRandomWelcomeMessage();
    setCurrentMessage(welcomeMessage);
    setConversationStep(-1);
    handleSpeech(welcomeMessage);
  };

  const handleMicrophoneClick = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());

      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
          throw new Error('AudioContext not supported');
        }
        audioContextRef.current = new AudioContextClass();
        
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        
        setIsAudioInitialized(true);
        console.log('Audio context initialized:', audioContextRef.current.state);
      }

      setIsListening(true);
      setSpeechInstruction(false);
    } catch (error) {
      console.error('Error initializing audio:', error);
      alert('Please allow microphone access to interact with Jung.');
    }
  };

  useEffect(() => {
    if (conversationStep === -1) {
      handleSpeech(getRandomWelcomeMessage());
    }
  }, []);

  useEffect(() => {
    conversationStepRef.current = conversationStep;
  }, [conversationStep]);

  async function onSubmit(): Promise<void> {
    try {
      console.log('[STEP]', conversationStep, '| onSubmit called');
      if (!dream.trim()) {
        handleSpeech("Please share your dream with me. I cannot analyze what I cannot see.");
        return;
      }

      setIsLoading(true);
      setCurrentSprite("jung_inhale_ext.png");
      setIsTransitioning(true);
      setIsListening(false);

      let fullResponse = '';
      let apiBody = {
        dream: dream,
        conversationHistory: conversationHistory,
        booksList: booksList
      };
      const decoder = new TextDecoder();

      // User input steps: 0, 2, 4
      if ([0, 2, 4].includes(conversationStep)) {
        console.log(`[STEP] User input at step ${conversationStep}`);
        setConversationStep(conversationStep + 1);
        setDream('');
        // After state update, fetch Jung's response
        setTimeout(() => fetchJungResponse(apiBody, conversationStep + 1), 0);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error("on submit err: ", error);
      setCurrentSprite("jung_neutral_ext.png");
      setIsTransitioning(false);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchJungResponse(apiBody: any, step: number) {
    try {
      console.log('[STEP]', step, '| fetchJungResponse called');
      let promptType = '';
      let fetchBody = { ...apiBody, step };
      const decoder = new TextDecoder();
      if (step === 1 || step === 3) {
        promptType = 'regular analysis';
      } else if (step === 5) {
        promptType = 'book recommendation';
      } else if (step === 6) {
        promptType = 'audible encouragement';
      }
      console.log(`[STEP] Fetching Jung response for: ${promptType}`);
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fetchBody),
      });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body is null');
      let responseText = '';
      if (step === 5) {
        setCurrentMessage(""); // Clear any previous message before book recommendation
      }
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line: string) => line.trim() !== '');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                responseText += data.text;
                setCurrentMessage(responseText);
              }
            } catch (error) {}
          }
        }
      }
      console.log(`[STEP] Jung response at step ${step}:`, responseText);
      setAnalysis(responseText);
      setConversationHistory(prev => [...prev, { dream: apiBody.dream, response: responseText }]);
      handleSpeech(responseText);
      // Only auto-increment for steps before 5
      if (step < 5) {
        setConversationStep(step + 1);
      }
      // For step 5, stay on step 5 until user clicks Continue
      // For step 6, do not increment (end of flow)
    } catch (error) {
      console.error("fetchJungResponse err: ", error);
      setCurrentSprite("jung_neutral_ext.png");
      setIsTransitioning(false);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const SpeechRecognitionClass = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      const recognition = new SpeechRecognitionClass();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log('Voice recognition started. Speak into the microphone.');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setDream(transcript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error !== 'aborted') {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            alert('Please enable microphone access in your browser settings.');
          }
        }
      };

      recognition.onend = () => {
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
      alert('Speech recognition is not supported in your browser. Please use a modern browser like Chrome.');
    }
  }, [isListening]);

  const handleSpeech = async (data: string): Promise<void> => {
    console.log("Starting speech handling");
    setIsJungSpeaking(true);
    setCurrentMessage(data);

    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
          throw new Error('AudioContext not supported');
        }
        audioContextRef.current = new AudioContextClass();
        
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        
        setIsAudioInitialized(true);
        console.log('Audio context initialized:', audioContextRef.current.state);
      }

      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: data }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body is null');
      
      const chunks: Uint8Array[] = [];
      let totalLength = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        totalLength += value.length;
      }

      const audioData = new Uint8Array(totalLength);
      let position = 0;
      for (const chunk of chunks) {
        audioData.set(chunk, position);
        position += chunk.length;
      }

      const buffer = await audioContextRef.current.decodeAudioData(audioData.buffer);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = 0.75;
      source.connect(audioContextRef.current.destination);

      setIsAudioPlaying(true);
      console.log("Audio playing state set to true");

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

            const animateScroll = (currentTime: number) => {
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

        // Auto-advance from step 5 to 6 when audio ends, using ref for latest value
        if (conversationStepRef.current === 5) {
          const apiBody = {
            dream: dream,
            conversationHistory: conversationHistory,
            booksList: booksList
          };
          fetchJungResponse(apiBody, 6);
          setConversationStep(6);
        }
        // Do NOT close the modal after step 6; leave it open as the final screen
      };

      setIsTransitioning(false);
      animationRef.current = setInterval(() => {
        setCurrentSprite(prev => prev === "jung_neutral_ext.png" ? "jung_open_mouth_ext.png" : "jung_neutral_ext.png");
      }, 300);

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
      if (error instanceof Error && error.message.includes('AudioContext')) {
        alert('Audio playback is not supported. Please try a different browser or device.');
      }
    }
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    setDream(event.target.value);
  };

  const resetConversation = (): void => {
    setConversationHistory([]);
    setConversationStep(-2);
    setDream('');
    setAnalysis('');
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isJungSpeaking) {
      const blink = () => {
        setCurrentSprite("jung_blink_ext.png");
        setTimeout(() => {
          setCurrentSprite("jung_neutral_ext.png");
        }, 200);
      };

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

  // Helper to extract book from Jung's recommendation
  function extractBookFromResponse(response: string) {
    // Try to find a book title from booksList in the response
    for (const book of booksList) {
      // Case-insensitive match
      if (response.toLowerCase().includes(book.title.toLowerCase())) {
        return book;
      }
    }
    return null;
  }

  useEffect(() => {
    console.log('[STEP]', conversationStep, '| useEffect currentMessage:', currentMessage);
    if (conversationStep === 6) {
      // Use the book from the book recommendation step (step 5, which is conversationHistory[2])
      const lastBookRec = conversationHistory[2];
      if (lastBookRec) {
        const book = extractBookFromResponse(lastBookRec.response);
        if (book) {
          setRecommendedBook(book);
          setIsBookModalOpen(true);
          console.log('[STEP] Modal should open for audible encouragement');
        }
      }
    }
  }, [conversationStep, currentMessage]);

  return (
    <div>
      <Head>
        <title>Ask Jung</title>
      </Head>

      {isAudioPlaying && !isBookModalOpen && conversationStep !== 6 && (
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
            maxWidth: "100%",
            maxHeight: "100vh"
          }}
        />
      </div>

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
          ) : conversationStep === 7 ? (
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
                        onClick={handleMicrophoneClick}
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
                [0, 2, 4].includes(conversationStep) ? (
                  <form onSubmit={(e: FormEvent) => {
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
                        conversationStep === 0
                          ? "Describe your dream..."
                          : conversationStep === 2
                            ? "Answer the follow-up question..."
                            : conversationStep === 4
                              ? "Share your thoughts..."
                              : ""
                      }
                      style={{
                        width: "80%",
                        maxWidth: "400px",
                        height: "120px",
                        marginBottom: "20px",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "none"
                      }}
                      disabled={false}
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
                      }}>
                        {conversationStep === 0
                          ? "Analyze Dream"
                          : conversationStep === 2
                            ? "Continue Analysis"
                            : conversationStep === 4
                              ? "Get Book Recommendation"
                              : ""}
                      </button>
                    </div>
                  </form>
                ) : null
              )}
            </>
          )}
        </div>
      )}

      {/* Book Recommendation Modal */}
      {isBookModalOpen && recommendedBook && (
        <BookRecommendationModal
          open={isBookModalOpen}
          book={recommendedBook}
          onClose={() => setIsBookModalOpen(false)}
        />
      )}
    </div>
  );
} 