const express = require('express');
const router = express.Router();
const Url = require('../models/url');
const authenticateToken = require('../middleware/auth');
const axios = require('axios');
const geminiService = require('./gemini');
const { marked } = require('marked');



router.get('/login', (req, res) => res.render('login'));
router.get('/register', (req, res) => res.render('register')); 


// Utility function to generate short URL
function generateShortUrl() {
    return Math.random().toString(36).substring(2, 8);
}

// Home page route (public)
router.get('/', (req, res) => {
    res.render('index');
});


router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        const urls = await Url.find({ user: req.user.id }).sort({ createdAt: -1 });
        // console.log('Fetched URLs for user:', req.user.id, urls); // Log fetched URLs
        res.render('dashboard', { urls });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error in dashboard route');
    }
});


  

// Handle URL shortening
router.post('/shorten', authenticateToken, async (req, res) => {
    const { originalUrl, keyword1, keyword2, keyword3, category } = req.body; 
    const shortUrl = generateShortUrl();

    // Ensure uniqueness
    const existingUrl = await Url.findOne({ shortUrl });
    if (existingUrl) {
        return res.send('Short URL collision occurred. Please try again.');
    }

    try {
        const aiResponse1 = await geminiService.generateAdText(keyword1);
        const aiResponse2 = await geminiService.generateAdText(keyword2);
        const aiResponse3 = await geminiService.generateAdText(keyword3);
    
        const newUrl = new Url({
            originalUrl,
            shortUrl,
            category,
            user: req.user.id, // Associate URL with the logged-in user
            keyword1,
            keyword2,
            keyword3,
            aiResponse1,
            aiResponse2,
            aiResponse3,
        });
        console.log('Authenticated user:', req.user); // Add this line
        await newUrl.save();
        // console.log('New shortened URL created:', newUrl.shortUrl, 'for user:', newUrl.user); // Log the user ID

        await newUrl.save();
        // console.log('New shortened URL created:', newUrl.shortUrl);
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error generating shortened URL or AI content');
    }
    
});



// Mock data: You would replace this with your actual ad database or collection
const ads = {
    entertainment: [
        'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgmBphHRAfYcMhyyOrQs75Rc9vLRYcRFyClxhWtSl3m7QQI56JujN_DC-12XemVnfqtmg-XV7oBgjk3PBDWA_kL7ZSjn7DZ-RVEokPMKctbrJoirMJF4ZwzfqX2XeX-3asHRISB-ZSuIM9v-x0f1Qp0IBOnN0rdJH-m_9qQ90G91EmxVSznMpmj6GwSipo/w422-h237/Slide4.JPG',
        'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgys4aHoYrWlqdgLS2V-oON1T_c3CKWQ2LzkGPixWNsP5kxFV4jED0kLbhO3qxGGCAA1KzZY1hh2U6sw3alwgRuGIHfcY05Typ5ZhEFDCDuMxeo4ETP56jVCsmLPg14zfPI9VMmuazSFSfHmh6HDfl0Fv9HJXowOVZm4mrGa-GEAFZXu0TihNQo6fI8I7U/w413-h233/Slide3.JPG',
        'https://colorwhistle.com/wp-content/uploads/2020/03/education-website-banner-ads-design-ideas-trends-and-inspirations-12.jpg'
    ],
    educational: [
        'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjv4vWtWFf5ZwTQYevkhV4uiuCd_FGD5wjrAmmCI6CT1qoZVCZEx_9y3nt0fW2vZJ62eKl8IoM-PyREVpNDvK9Yoyoooo2jUCBcQqrmvlRq2oi7JFAvv8N7oNX1xIZLsLmD0K7tCoIzAXXH9OLPeFp1OOCr42GhOj3PyvLaMUUr7D1S3dLFNgTMUUWuxLI/w420-h236/edu1.jpg',
        'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiOn_e7IBf2PQKsz1GMoZ7jH9O_AUWxZE9UkwhIa3SwmZRpsXrbN2nTSGT_n7w0-dkItAJmAsQ72gHss_ZIkpj__8AxRbA30RBZxj3YFghTsQ8U838LEzT09IPwcDwwK-EsatZxKezW1Z6-On4wxXJHTkZDdSsYIhL4Wfu-cavDg_-Mb2PbJDzgivSydes/w464-h261/edu2.jpg'
    ],
    other: [
        'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjRkAtIvMFKH3MhBqKV1xJppWIrhLHq_w65AM2dyS132oDE5L6WGVnpaG6FuZi4Vbi0fWoQoaQ-m02BAOUOtHDZYWyyBO91N3YOsXDRJAg8cxLCBx2641Eul-Y4W0BBVM7QhHZeYd63LTEmxmS3KP0oX7tpK8cZvVRj5OnyERicwhpDwvDJV-aAxLDo8-M/w422-h237/Slide5.JPG',
        'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiPfTqNAx8JKnBgkH9VSG-tkGg3FrqP8SaReGzUgkbnWmnlsvE6dLVC8ezPtHAfU3j-Xo_tsva06IMu3rxrg1jF4V1TPOr2fk7yyefvxFQP0f2QHaVMfidTLR68j6JaigbAIDogOkiIikOvCZbxV0d5HQnOBS8sWEnmLRNvxec3I9wysXt-8GCv7Bd7UnA/w398-h224/Slide6.JPG'
    ]
};




const generateAdContent = async (keyword) => {
    try {
      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: keyword }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.1,
        },
      });
      
      // Make sure to check the response
      const aiResponse = result.response.text();
  
      return aiResponse;
    } catch (error) {
      console.error('Error generating content:', error);
      throw error; // Propagate the error
    }
  };
  

  router.get('/s/:shortUrl/:adStep?', async (req, res) => {
    const { shortUrl, adStep } = req.params;
    const url = await Url.findOne({ shortUrl });

    if (!url) {
        return res.status(404).send('URL not found');
    }

    const adCategory = url.category; // Fetch the ad category from the URL
    const selectedAds = ads[adCategory] || []; // Select ads based on the category

    let currentStep = parseInt(adStep) || 1;

    // Check if AI response data exists
    if (!url.aiResponse1 || !url.aiResponse2 || !url.aiResponse3) {
        console.error('AI responses not found for URL:', shortUrl);
        return res.status(500).send('AI responses not found');
    }

    // Convert AI response from markdown to HTML
    if (url.aiResponse1 && url.aiResponse1.parts) {
        url.aiResponse1.parts.forEach(part => {
            part.html = marked(part.text); // Convert markdown text to HTML
        });
    }
    if (url.aiResponse2 && url.aiResponse2.parts) {
        url.aiResponse2.parts.forEach(part => {
            part.html = marked(part.text); // Convert markdown text to HTML
        });
    }
    if (url.aiResponse3 && url.aiResponse3.parts) {
        url.aiResponse3.parts.forEach(part => {
            part.html = marked(part.text); // Convert markdown text to HTML
        });
    }

    // Pass the correct AI response based on the current step
    if (currentStep === 1) {
        const adImageUrl = selectedAds[Math.floor(Math.random() * selectedAds.length)];
        res.render('ad-page1', { shortUrl, currentStep, aiResponse: url.aiResponse1, adImageUrl });
    } else if (currentStep === 2) {
        const adImageUrl = selectedAds[Math.floor(Math.random() * selectedAds.length)];
        res.render('ad-page2', { shortUrl, currentStep, aiResponse: url.aiResponse2, adImageUrl });
    } else if (currentStep === 3) {
        const adImageUrl = selectedAds[Math.floor(Math.random() * selectedAds.length)];
        res.render('ad-page3', { shortUrl, currentStep, aiResponse: url.aiResponse3, adImageUrl });
    } else {
        url.clicks += 1;
        await url.save();
        res.redirect(url.originalUrl);
    }
});








// Route to handle final redirection to the original URL
router.get('/final/:shortUrl', async (req, res) => {
    const { shortUrl } = req.params;
    const url = await Url.findOne({ shortUrl });

    if (!url) {
        return res.status(404).send('URL not found');
    }

    // Increment the click count for analytics
    url.clicks += 1;
    await url.save();

    // Redirect to the original URL
    res.redirect(url.originalUrl);
});


module.exports = router;