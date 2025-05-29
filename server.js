require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chillguard', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Email Schema
const subscriberSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

// Routes
app.post('/api/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Check if email already exists
        const existingSubscriber = await Subscriber.findOne({ email });
        if (existingSubscriber) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Save subscriber
        const subscriber = new Subscriber({ email });
        await subscriber.save();

        res.status(201).json({ message: 'Thank you for subscribing!' });
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({ message: 'An error occurred' });
    }
});

// Admin route to view all subscribers
app.get('/api/admin/subscribers', async (req, res) => {
    try {
        const subscribers = await Subscriber.find();
        res.json(subscribers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subscribers' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 