const Comments = require('../models/Comment');
const express = require('express');
const router = express.Router();

router.post('/', async(req, res)=>{
    try{
        const {text} = req.body;
        if(!text) return res.status(400).json({message: 'Text is required'});
        const comment = await Comments.create({text: text, post: req.postId, author: req.userId});
        res.status(201).json({comment});

    }
    catch(e){
        res.status(500).json({message: 'Invalid Id format'});

    }
});

router.get('/', async(req, res)=>{
    try{
        const comments = await Comments.find({post: req.postId}).populate('author', 'username');
        if(comments.length === 0) return res.status(404).json({message: 'No comment found'});
        res.status(200).json({comments});

    }
    catch(e){
        res.status(500).json({message: 'Invalid Id format'});
    }
});

router.delete('/:cid', async(req, res)=>{
    try{
        const comment = await Comments.findById(req.params.cid);
        if(!comment) return res.status(404).json({message: 'Comment not found!'});
        if(comment.author.toString()!== req.userId) return res.status(403).json({message: 'Not your comment!!'});
        await Comments.findByIdAndDelete(req.params.cid);
        res.status(200).json({'Deleted comment': comment});

    }
    catch(e){
        res.status(500).json({message: 'Invalid Id format'});
    }
});

module.exports = router;