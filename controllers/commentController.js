const asyncHandler = require('express-async-handler');
const Comment = require('../models/Comment')
const Cocktail = require('../models/Cocktail')
const User = require('../models/User')

/**
 * @desc Get comments
 * @route GET /comments
 * @access private
 */
const getComments = asyncHandler(async (req, res) => {
    const cocktailId = req.query.cocktailId
    if (!cocktailId) return res.status(400).json({ message: 'CocktailId required in the query string' })

    const comments = await Comment.find({ cocktail: { $eq: cocktailId }})
        .sort('-createdAt')
        .exec()

    res.json(comments)
})

/**
 * @desc Create new comments
 * @route POST /comments
 * @access private
 */
const createNewComment = asyncHandler(async (req, res) => {
    const { body, cocktailId, userId } = req.body
    if (!body || !cocktailId || !userId) return res.status(400).json({ message: 'All fields are required' })
    
    const cocktail = await Cocktail.findById(cocktailId).exec()
    if (!cocktail) return res.status(404).json({ message: 'No cocktail found' })

    const user = await User.findById(userId).exec()
    if (!user) return res.status(404).json({ message: 'No user found' })

    const commentObj = { body, cocktail: cocktailId, user: userId }
    const comment = await Comment.create(commentObj)
    if (!comment) return res.status(500).json({ message: 'Failed to save comment '})

    res.status(201).json(comment)
})

/**
 * @desc Update a comments
 * @route PATCH /comments
 * @access private
 */
const updateComment = asyncHandler(async (req, res) => {
    const { id, body } = req.body
    if (!id || !body) return res.status(400).json({ message: 'ID and Comment body is required' })

    const comment = await Comment.findById(id).exec()
    if (!comment) return res.status(404).json({ message: 'No comment found' })

    comment.body = body
    const updatedComment = await comment.save()
    res.json(updatedComment)
})

/**
 * @desc Delete a comment
 * @route DELETE /comments/:id
 * @access private
 */
const deleteComment = asyncHandler(async (req, res) => {
    const { id, userId, roles } = req.body
    if (!id || !userId || !roles) return res.status(400).json({ message: 'All fields are required' })

    const comment = await Comment.findById(id).exec()
    if (comment.user.toString() === userId || roles.includes(2) ) {
        await comment.deleteOne()
        return res.json({ message: 'Comment deleted' })
    }
    
    res.status(403).json({ message: 'Forbidden' })
})

module.exports = {
    getComments,
    createNewComment,
    updateComment,
    deleteComment
}