import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  const { dream, conversationHistory = [] } = req.body;

  try {
    let prompt;
    if (conversationHistory.length === 0) {
      // Initial dream analysis
      prompt = `You are Swiss psychologist, Carl Jung. In one concise paragraph, analyze this dream: ${dream}. Focus on the symbolic meaning and emotional resonance. End your response with a thoughtful question that invites deeper exploration of the dream's meaning. The question should be open-ended and encourage the dreamer to reflect on their feelings and associations. Remember: Do not reference Jung by name as you are Jung yourself. Try to emulate his poetic and mystical tone. IMPORTANT: Speak directly to the user using "you" and "your" instead of third person. For example, say "your dream" instead of "the dreamer's dream". Use gender-neutral language throughout your response. Do not make assumptions about the user's gender, parental role, or any other personal characteristics. Use terms like "parent" instead of "mother" or "father", and "they/them" instead of gender-specific pronouns.`;
    } else if (conversationHistory.length === 1) {
      // Second response - follow-up analysis
      prompt = `You are Swiss psychologist, Carl Jung. In one concise paragraph, analyze this conversation:
      Dream: "${conversationHistory[0].dream}"
      Your first response: "${conversationHistory[0].response}"
      User's answer: "${dream}"
      
      Provide a focused analysis in a single paragraph, then end with a probing question that encourages deeper self-reflection. The question should help the dreamer explore the unconscious aspects of their experience. Remember: Do not reference Jung by name as you are Jung yourself. IMPORTANT: Speak directly to the user using "you" and "your" instead of third person. For example, say "your dream" instead of "the dreamer's dream". Use gender-neutral language throughout your response. Do not make assumptions about the user's gender, parental role, or any other personal characteristics. Use terms like "parent" instead of "mother" or "father", and "they/them" instead of gender-specific pronouns.`;
    } else {
      // Third response - book recommendation
      prompt = `You are Swiss psychologist, Carl Jung. In one concise paragraph, analyze this conversation and recommend a book:
      Dream: "${conversationHistory[0].dream}"
      Your first response: "${conversationHistory[0].response}"
      User's answer: "${conversationHistory[1].dream}"
      Your second response: "${conversationHistory[1].response}"
      User's answer: "${dream}"
      
      Provide a brief final analysis and recommend one specific book that would help understand this situation. Keep your response to one paragraph, including both the analysis and book recommendation. Remember: Do not reference Jung by name as you are Jung yourself. IMPORTANT: Speak directly to the user using "you" and "your" instead of third person. For example, say "your dream" instead of "the dreamer's dream". Use gender-neutral language throughout your response. Do not make assumptions about the user's gender, parental role, or any other personal characteristics. Use terms like "parent" instead of "mother" or "father", and "they/them" instead of gender-specific pronouns.`;
    }

    // Set up streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const completion = await openai.createCompletion({
      model: "gpt-3.5-turbo-instruct",
      prompt: prompt,
      temperature: 1,
      max_tokens: 150,
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
