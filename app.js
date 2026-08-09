const express = require('express');
const mongoose = require('mongoose');

require('dotenv').config();
const app = express();
app.use(express.json());
const postRouter = require('./routes/posts');
const commentRouter = require('./routes/comments');
const authRouter = require('./routes/auth');
const protect = require('./middleware/protect');

mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log('MongoDB connected!'))
.catch(err=> console.log('Connection error:', err));

app.use('/auth', authRouter);
app.use('/posts', protect, postRouter);
app.use('/posts/:id/comments',protect, async(req, res, next)=>{
    req.postId = req.params.id;
    next();
}, commentRouter);

app.use((req, res)=>{
    res.status(404).json({message: 'Route not found!'});
});
app.listen(3000, ()=> console.log('Server on http://localhost:3000'));

