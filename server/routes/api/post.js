const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const User = require('../../Models/User');
const Post = require('../../Models/Post');

//@route api/post
//@desc get all posts
//@access public
router.get('/', async (req, res) => {
  try {
    let posts = await Post.find().sort({ date: -1 });

    return res.json(posts);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

//@route api/post/:post_id
//@desc get by post id
//@access public
router.get('/:post_id', async (req, res) => {
  try {
    let post = await Post.findById(req.params.post_id);

    return res.json(post);
  } catch (error) {
    if (error.kind == 'ObjectId') {
      return res.status(400).json({ message: 'no Post found' });
    }
    console.log(error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

//@route api/post/:post_id
//@desc delete post by post id
//@access public
router.delete('/:post_id', auth, async (req, res) => {
  try {
    let post = await Post.findById(req.params.post_id);

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorised to delete' });
    }
    await post.remove();
    return res.status(200).json({ message: 'Post removed' });
  } catch (error) {
    if (error.kind == 'ObjectId') {
      return res.status(400).json({ message: 'no Post found' });
    }
    console.log(error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

//@route api/post/like/:post_id
//@desc put -like a  post by post id
//@access public
router.put('/like/:post_id', auth, async (req, res) => {
  try {
    let post = await Post.findById(req.params.post_id);

    if (post) {
      if (post.likes.filter((like) => like.user == req.user.id).length > 0)
        return res.status(200).json({ message: 'Post already liked' });

      post.likes.unshift({ user: req.user.id });
      await post.save();
      return res.status(200).json(post.likes);
    }
    return res.status(400).json({ message: 'no Post found' });
  } catch (error) {
    if (error.kind == 'ObjectId') {
      return res.status(400).json({ message: 'no Post found....' });
    }
    console.log(error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

//@route api/post/unlike/:post_id
//@desc put -unlike a  post by post id
//@access public
router.put('/unlike/:post_id', auth, async (req, res) => {
  try {
    let post = await Post.findById(req.params.post_id);

    if (post) {
      if (post.likes.filter((like) => like.user == req.user.id).length == 0)
        return res.status(200).json({ message: 'Post is not liked' });
      let postLiked = post.likes.filter(
        (like) => like.user.toString() !== req.user.id
      );
      post.likes = [...postLiked];
      await post.save();
      return res.status(200).json(post.likes);
    }
    return res.status(400).json({ message: 'no Post found' });
  } catch (error) {
    if (error.kind == 'ObjectId') {
      return res.status(400).json({ message: 'no Post found....' });
    }
    console.log(error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

//@route api/post
//@desc creating a post
//@access private
router.post(
  '/',
  [auth, [check('text', 'post text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let user = await User.findById(req.user.id).select('name');

      let newPost = {
        user: user.id,
        text: req.body.text,
        name: user.name,
        likes: [],
        comments: [],
      };

      let post = new Post(newPost);

      post = await post.save();
      return res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//@route api/post/comment/:post_id
//@desc add comment to a post
//@access private
router.put(
  '/comment/:post_id',
  [auth, [check('text', 'post text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let post = await Post.findById(req.params.post_id);

      let newComment = {
        user: req.user.id,
        text: req.body.text,
      };
      if (post) {
        post.comments.unshift(newComment);
        await post.save();
        return res.status(200).json(post.comments);
      }
      return res.status(400).json({ message: 'no Post found' });
    } catch (error) {
      if (error.kind == 'ObjectId') {
        return res.status(400).json({ message: 'no Post found....' });
      }
      console.log(error.message);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
);

//@route api/post/comment/:post_id/:comment_id
//@desc delete a comment using commentid & post id
//@access private
router.delete('/comment/:post_id/:comment_id', auth, async (req, res) => {
  try {
    let post = await Post.findById(req.params.post_id);
    let comment = post.comments.find(
      (c) => c.id.toString() == req.params.comment_id
    );
    if (!comment) {
      return res.status(401).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: 'Not authorised to delete the comment' });
    }

    let remainingComments = post.comments.filter(
      (c) => c.id.toString() !== req.params.comment_id
    );
    post.comments = [...remainingComments];
    post.save();
    return res.status(200).json({ message: 'Comment removed' });
  } catch (error) {
    if (error.kind == 'ObjectId') {
      return res.status(400).json({ message: 'no Post/comment found' });
    }
    console.log(error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
