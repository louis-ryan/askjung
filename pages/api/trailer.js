const axios = require('axios');

export default async function (req, res) {
    const query = req.query.query
    const apiKey = process.env.YOUTUBE_API_KEY;
    const endpoint = 'https://www.googleapis.com/youtube/v3/search';
    const params = {
        part: 'snippet',
        type: 'video',
        key: apiKey,
        q: query,
        maxResults: 1
    };

    const response = await axios.get(endpoint, { params });
    res.send(response.data);
}
