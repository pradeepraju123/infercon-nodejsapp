const express = require('express');
const mongoose = require('mongoose');
const app = express();
const templateRoutes = require('./routes/message_template.routes');

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/message_templates_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use('/uploads', express.static('uploads')); // For serving uploaded images

// Routes
app.use('/api/templates', templateRoutes);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));