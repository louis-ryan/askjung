import axios from 'axios';

export default async function handler(req, res) {
  const { text } = req.body;

  console.log("text: ", text);

  if (req.method !== 'POST' || !text) {
    return res.status(400).json({ error: 'Bad request' });
  }

  try {
    // Set up streaming response
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Make request to OpenAI with streaming
    const response = await axios({
      method: 'POST',
      url: 'https://api.openai.com/v1/audio/speech',
      data: {
        model: "tts-1",
        voice: "fable",
        input: text,
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      },
      responseType: 'stream',
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    // Stream the response
    response.data.pipe(res);

    // Handle errors
    response.data.on('error', (error) => {
      console.error('Stream error:', error);
      res.end();
    });

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
}