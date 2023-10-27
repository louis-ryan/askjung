import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, });
const openai = new OpenAIApi(configuration);

export default async function (req, res) {

  const movieOne = req.body.movieOne || '';
  const movieTwo = req.body.movieTwo || '';
  const movieThree = req.body.movieThree || '';
  const toBeExcluded = req.body.toBeExcluded || '';

  console.log("prompt: ", generatePrompt(movieOne, movieTwo, movieThree, toBeExcluded))

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(movieOne, movieTwo, movieThree, toBeExcluded),
      temperature: 0.6,
    });
    res.status(200).json({ result: completion.data.choices[0].text });
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

function generatePrompt(movieOne, movieTwo, movieThree, toBeExcluded) {

  var numberOfMovies

  if (movieOne !== '' && movieTwo === '' && movieThree === '') numberOfMovies = 1
  if (movieOne !== '' && movieTwo !== '' && movieThree === '') numberOfMovies = 2
  if (movieOne !== '' && movieTwo !== '' && movieThree !== '') numberOfMovies = 3

  switch (numberOfMovies) {
    case 1:
      return (
        `Suggest a movie that is just like this movie, 
        excluding movies directed by the director of this movie, 
        with a rotten tomatoes score above 40
    
        ${toBeExcluded.length === 0 ? '.' : 'and excluding the following:' + toBeExcluded + '.'}
    
        Other Movie 1: Blade Runner directed by Ridley Scott
        Suggestion: Ex Machina; 2014; Alex Garland
    
        Other Movie 1: Royal Tenenbaums directed by Wes Anderson
        Suggestion: The Squid and the Whale; 2005; Noah Baumbach
    
        Other Movie 1: Casino directed by Martin Scorsese
        Suggestion: Magnolia; 1999; Paul Thomas Anderson
    
        Other Movie 1: ${movieOne}
        Suggestion:`
      )
    case 2:
      return (
        `Suggest a movie that is a mix of two other movies, 
        excluding movies directed by the directors of those same movies, 
        with a rotten tomatoes score above 40
  
        ${toBeExcluded.length === 0 ? '.' : 'and excluding the following:' + toBeExcluded + '.'}
  
        Other Movie 1: Blade Runner directed by Ridley Scott
        Other Movie 2: Her directed by Spike Jonze
        Suggestion: Ex Machina; 2014; Alex Garland
    
        Other Movie 1: Royal Tenenbaums directed by Wes Anderson
        Other Movie 2: Blue Jasmine directed by Woody Allen
        Suggestion: The Squid and the Whale; 2005; Noah Baumbach
    
        Other Movie 1: Casino directed by Martin Scorsese
        Other Movie 2: Moonrise Kingdom directed by Wes Anderson
        Suggestion: Magnolia; 1999; Paul Thomas Anderson
    
        Other Movie 1: ${movieOne}
        Other Movie 2: ${movieTwo}
        Suggestion:`
      )
    case 3:
      return (
        `Suggest a movie that is a mix of three other movies, 
          excluding movies directed by the directors of those same movies, 
          with a rotten tomatoes score above 40
    
          ${toBeExcluded.length === 0 ? '.' : 'and excluding the following:' + toBeExcluded + '.'}
    
          Other Movie 1: Blade Runner directed by Ridley Scott
          Other Movie 2: Her directed by Spike Jonze
          Other Movie 3: Arrival directed by Denis Villeneuve
          Suggestion: Ex Machina; 2014; Alex Garland
      
          Other Movie 1: Royal Tenenbaums directed by Wes Anderson
          Other Movie 2: Blue Jasmine directed by Woody Allen
          Other Movie 3: Dazed and Confused directed by Richard Linklater
          Suggestion: The Squid and the Whale; 2005; Noah Baumbach
      
          Other Movie 1: Casino directed by Martin Scorsese
          Other Movie 2: Moonrise Kingdom directed by Wes Anderson
          Other Movie 3: Heat directed by Michael Mann
          Suggestion: Magnolia; 1999; Paul Thomas Anderson
      
          Other Movie 1: ${movieOne}
          Other Movie 2: ${movieTwo}
          Other Movie 3: ${movieThree}
          Suggestion:`
      )
  }
}
