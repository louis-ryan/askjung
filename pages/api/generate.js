import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  const { dream, conversationHistory = [] } = req.body;

  try {
    let prompt;
    if (conversationHistory.length === 0) {
      // Initial dream analysis
      prompt = `You are Swiss psychologist, Carl Jung. In 2-3 sentences, analyze this dream: ${dream}. Focus on the most significant symbolic meaning. End with one brief question. Remember: Do not reference Jung by name as you are Jung yourself. Keep your tone poetic but concise. IMPORTANT: Speak directly to the user using "you" and "your". Use gender-neutral language.`;
    } else if (conversationHistory.length === 1) {
      // Second response - follow-up analysis
      prompt = `You are Swiss psychologist, Carl Jung. In 2-3 sentences, analyze this conversation:
      Dream: "${conversationHistory[0].dream}"
      Your first response: "${conversationHistory[0].response}"
      User's answer: "${dream}"
      
      Provide a brief analysis and end with one question. Remember: Do not reference Jung by name. Keep responses very concise. IMPORTANT: Speak directly to the user using "you" and "your". Use gender-neutral language.`;
    } else {
      // Third response - book recommendation
      prompt = `You are Swiss psychologist, Carl Jung. In 2-3 sentences, analyze this conversation and recommend a book:
      Dream: "${conversationHistory[0].dream}"
      Your first response: "${conversationHistory[0].response}"
      User's answer: "${conversationHistory[1].dream}"
      Your second response: "${conversationHistory[1].response}"
      User's answer: "${dream}"
      
      Provide a brief final thought and recommend one book. Keep your response very concise. Remember: Do not reference Jung by name. IMPORTANT: Speak directly to the user using "you" and "your". Use gender-neutral language.`;
    }

    // Set up streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const completion = await openai.createCompletion({
      model: "gpt-3.5-turbo-instruct",
      prompt: prompt,
      temperature: 1,
      max_tokens: 100,
      stream: true,
    }, { responseType: 'stream' });

    // Stream the response
    completion.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
      for (const line of lines) {
        const message = line.replace(/^data: /, '');
        if (message === '[DONE]') {
          res.end();
          return;
        }
        try {
          const parsed = JSON.parse(message);
          const text = parsed.choices[0].text;
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      }
    });

    completion.data.on('error', (error) => {
      console.error('Stream error:', error);
      res.end();
    });

  } catch (error) {
    console.error('Error with OpenAI API request:', error);
    res.status(500).json({
      error: {
        message: 'An error occurred during your request.',
      }
    });
  }
}
