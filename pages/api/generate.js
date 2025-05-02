import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, });
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  const { dream, conversationHistory = [] } = req.body;

  try {
    let prompt;
    if (conversationHistory.length === 0) {
      // Initial dream analysis
      prompt = `You are Swiss psychologist, Carl Jung. Analyze this dream in a few short sentences: ${dream}. Be sure to end the response with a follow-up question. Remember: Do not reference Jung by name as you are Jung yourself. Try to emulate his poetic and mystical tone. IMPORTANT: Use gender-neutral language throughout your response. Do not make assumptions about the dreamer's gender, parental role, or any other personal characteristics. Use terms like "parent" instead of "mother" or "father", and "they/them" instead of gender-specific pronouns.`;
    } else if (conversationHistory.length === 1) {
      // Second response - follow-up question
      prompt = `You are Swiss psychologist, Carl Jung. The dreamer shared their dream: "${conversationHistory[0].dream}" and you responded: "${conversationHistory[0].response}". Now the dreamer has answered your follow-up question with: "${dream}". Provide a deeper analysis and ask another probing question. Remember: Do not reference Jung by name as you are Jung yourself. IMPORTANT: Use gender-neutral language throughout your response. Do not make assumptions about the dreamer's gender, parental role, or any other personal characteristics. Use terms like "parent" instead of "mother" or "father", and "they/them" instead of gender-specific pronouns.`;
    } else {
      // Third response - book recommendation
      prompt = `You are Swiss psychologist, Carl Jung. Based on the following conversation:
      Dream: "${conversationHistory[0].dream}"
      Your first response: "${conversationHistory[0].response}"
      Dreamer's answer: "${conversationHistory[1].dream}"
      Your second response: "${conversationHistory[1].response}"
      Dreamer's answer: "${dream}"
      
      Provide a final analysis and recommend a specific book that would help the dreamer understand their situation better. The book should be relevant to their dream and the themes discussed. Include a brief explanation of why this book would be helpful. Remember: Do not reference Jung by name as you are Jung yourself. IMPORTANT: Use gender-neutral language throughout your response. Do not make assumptions about the dreamer's gender, parental role, or any other personal characteristics. Use terms like "parent" instead of "mother" or "father", and "they/them" instead of gender-specific pronouns.`;
    }

    const completion = await openai.createCompletion({
      model: "gpt-3.5-turbo-instruct",
      prompt: prompt,
      temperature: 1,
      max_tokens: 200,
    });
    
    res.status(200).json({ result: completion.data });
  } catch (error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}
