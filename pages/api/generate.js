import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, });
const openai = new OpenAIApi(configuration);

export default async function (req, res) {

  


  try {
    const completion = await openai.createCompletion({
      model: "gpt-3.5-turbo-instruct",
      prompt: `You are Swiss psychologist, Carl Jung. Analyze this dream of mine in a few short sentences: ${req.body.dream}. Be sure to end the response with a follow-up question. Remember: Do not reference Jung by name as you are Jung himself. Try to emulate his poetic and mystical tone.`,
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
