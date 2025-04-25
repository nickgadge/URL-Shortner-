const mongoose = require('mongoose');

// Define a schema for the AI response
const responseSchema = new mongoose.Schema({
  parts: [{
    text: String // Assuming 'text' is a key in each part of the response
  }],
  role: String // Assuming 'role' is a part of the AI response
});

// Define your URL schema
const urlSchema = new mongoose.Schema({
  originalUrl: {type: String, required: true},
  shortUrl: {type: String, required: true},
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  keyword1: String,
  keyword2: String,
  keyword3: String,
  aiResponse1: responseSchema,  
  aiResponse2: responseSchema,  
  aiResponse3: responseSchema,  
  clicks: { type: Number, default: 0 },
  category: {type: String, enum: ['entertainment', 'educational', 'other']  // Restrict category to three types
     // Set default category if none is provided
},
  createdAt: { type: Date, default: Date.now }
});



module.exports = mongoose.model('Url', urlSchema);
