const express = require('express');
const router = express.Router();
const Posts = require('../models/Post');

router.post('/', async(req, res)=>{
    try{
            const {title, body} = req.body;
            if(!title|| !body) return res.status(400).json({message: 'required title and body of post'});
            const post = await Posts.create({title: title, body: body, author: req.userId} );
            res.status(201).json({post});

        }
    catch(e){
                res.status(500).json({message: 'Invalid id format'});
             }

});

router.get('/', async(req, res)=>{

    try{
            const posts = await Posts.find({author: req.userId}).populate('author', 'username');
            res.status(200).json({posts});
    }
    catch(e){
        res.status(500).json({message: 'Invalid Id format'});
    }
});

router.get('/:id', async(req,res)=>{
    try{
            const post = await Posts.findById(req.params.id).populate('author', 'username');
            if(!post) return res.status(404).json({message: 'post not found!!'});
            res.status(200).json({post});
    }
    catch(e){
        res.status(500).json({message: 'Invalid Id format'});
    }
});
router.put('/:id', async(req, res)=>{
try{
    const {title, body} = req.body;
    const post = await Posts.findById(req.params.id);
    if(!post) return res.status(404).json({message: 'Post not Found!'});
    if(post.author.toString()!== req.userId) return res.status(403).json({message: 'Not your post!'});
    const updated_post = await Posts.findByIdAndUpdate(req.params.id,
        {
            title: title || post.title,
            body: body || post.body 
        },
        {new: true});
        res.status(200).json({updated_post});
}
catch(e){
        res.status(500).json({message: 'Invalid Id format'});
}   
});

router.delete('/:id', async(req, res)=>{
    try{
        const post = await Posts.findById(req.params.id);
        if(!post) return res.status(404).json({message: "Post not found!!"});
        if(post.author.toString()!== req.userId) return res.status(403).json({message: 'forbidden: Not your post !'});
        await Posts.findByIdAndDelete(req.params.id);
        res.status(200).json({'Deleted Post': post});
        }
    catch(e){
        res.status(500).json({message: 'Invalid Id format'});
    }
});
module.exports = router; 

