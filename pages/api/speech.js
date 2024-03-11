export default async function handler(req, res) {
    const { text } = req.body;

    console.log("text: ", text)
  
    if (req.method !== 'POST' || !text) {
      return res.status(400).json({ error: 'Bad request' });
    }
  
    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: "tts-1",
            voice: "fable",
            input: text,
        }),
      });
  
      const data = await response.blob(); // Get the audio data as a blob
  
      res.setHeader('Content-Type', 'audio/mpeg');
      data.stream().pipe(res); // Stream the audio data back to the client
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      res.status(500).json({ error: 'Failed to generate speech' });
    }
  }
  