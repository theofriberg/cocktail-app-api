const bcrypt = require('bcrypt')
const asyncHandler = require('express-async-handler')
const User = require('../models/User')
const Cocktail = require('../models/Cocktail')

/**
 * @desc Get users
 * @route GET /users
 * @access private
 */
const getUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) - 1 || 0
    const limit = parseInt(req.query.limit) || 20
    const search = req.query.search || ''

    const users = await User.find({ username: { $regex: search, $options: 'i' }})
        .sort('username')
        .skip(limit * page)
        .limit(limit)
        .select('-password')
        .lean()
        .exec()

    if (page === 0) {
        const nmbrOfUsers = await User.find({ username: { $regex: search, $options: 'i' }})
            .countDocuments()
            .exec()
        const nmbrOfPages = Math.ceil(nmbrOfUsers / limit)

        return res.json({ nmbrOfPages, users })
    }

    return res.json(users)
})

/**
 * @desc Create new user
 * @route POST /users
 * @access public
 */
const createNewUser = asyncHandler(async (req, res) => {
    const { username, password, roles } = req.body
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' })
    }
    const duplicate = await User.findOne({ username: username }).exec()
    if (duplicate) return res.status(409) //conflict

    const hashedPwd = await bcrypt.hash(password, 10) //10 salt rounds
    const userObject = (Array.isArray(roles) && roles.length)
        ? { username, password: hashedPwd, roles }
        : { username, password: hashedPwd }
    const user = await User.create(userObject)
    if (user) {
        res.status(201).json({ message: 'User created' })
    } else {
        res.status(500).json({ message: 'Failed to save user' })
    }
})

/**
 * @desc Update user
 * @route PATCH /users
 * @access private
 */
const updateUser = asyncHandler(async (req, res) => {
    const { aboutMe, favDrink, leastFavDrink, userId } = req.body
    if (!userId) return res.status(400).json({ message: 'User ID is required' })

    if (!aboutMe && !favDrink && !leastFavDrink) {
        return res.status(400).json({ message: 'At least one field to update is required' })
    }

    const user = await User.findById(userId).exec()
    if (!user) return res.status(404).json({ message: 'No user found' })

    if (aboutMe) user.aboutMe = aboutMe
    if (favDrink) user.favDrink = favDrink
    if (leastFavDrink) user.leastFavDrink = leastFavDrink

    const updatedUser = await user.save()
    res.json(updatedUser)
})

/**
 * @desc Delete a user
 * @route DELETE /users
 * @access private
 */
const deleteUser = asyncHandler(async (req, res) => {
    const { id, roles } = req.body
    if (!roles || !roles.includes(2)) return res.status(403).json({ message: 'Forbidden' })

    if (!id) return res.status(400).json({ message: 'User ID required' })

    const user = await User.findById(id).exec()
    if (!user) return res.status(400).json({ message: 'No user found' })

    const result = await user.deleteOne()
    const reply = `User ${result.username} deleted`
    res.json(reply)
})

/**
 * @desc Get a user and users cocktails
 * @route GET /users/:id
 * @access private
 */
const getUserAndCocktails = asyncHandler(async (req, res) => {
    const { id } = req.params
    const page = parseInt(req.query.page) - 1 || 0
    const limit = parseInt(req.query.limit) || 20
    const wantsCocktails = req.query.wantsCocktails || false

    const user = await User.findById(id).select('-password').lean().exec()
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (wantsCocktails) {
        const cocktails = await Cocktail.find({ user: id })
            .sort('-createdAt')
            .skip(limit * page)
            .limit(limit)
            .exec()
    
        if (page === 0) {
            const nmbrOfCocktails = await Cocktail.find({ user: id }).countDocuments().exec()
            const nmbrOfPages = Math.ceil(nmbrOfCocktails / limit)
            return res.json({ user, cocktails, nmbrOfPages })
        }
        
        return res.json({ user, cocktails })
    }

    return res.json(user)
})

module.exports = {
    getUsers,
    createNewUser,
    deleteUser,
    updateUser,
    getUserAndCocktails
}