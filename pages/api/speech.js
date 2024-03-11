import axios from 'axios';

export default async function handler(req, res) {
  const { text } = req.body;

  console.log("text: ", text);

  if (req.method !== 'POST' || !text) {
    return res.status(400).json({ error: 'Bad request' });
  }

  try {
    // Axios request to OpenAI
    const response = await axios.post('https://api.openai.com/v1/audio/speech', {
      model: "tts-1",
      voice: "fable",
      input: text,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      },
      responseType: 'stream', // This tells Axios to get the response as a stream
    });

    // Set headers for the response
    res.setHeader('Content-Type', 'audio/mpeg');

    // Stream the audio data back to the client
    response.data.pipe(res);
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
}