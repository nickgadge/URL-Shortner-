const axios = require('axios');

async function generateAdText(keyword) {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDW4SSFBKGqxt-_exAufjOvRlHnN9buOTU';
    
    const data = {
        contents: [
            {
                parts: [
                    {
                        text: keyword // Use the keyword parameter here
                    }
                ]
            }
        ]
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
        
        // Extracting the generated content from the response
        const candidates = response.data.candidates;
        if (candidates && candidates.length > 0) {
            const generatedContent = candidates[0].content; // Accessing the content of the first candidate
            return generatedContent; // Return the generated content
        } else {
            throw new Error("No content generated.");
        }
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw error; // Rethrow the error to be handled in the route
    }
}

module.exports = { generateAdText };
