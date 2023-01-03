const asyncHandler = require('express-async-handler')
const cloudinary = require('../config/cloudinaryOptions')
const Cocktail = require('../models/Cocktail')
const User = require('../models/User')

/**
 * @desc Get cocktails
 * @route GET /cocktails
 * @access public
 */
const getCocktails = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) - 1 || 0
    const limit = parseInt(req.query.limit) || 20
    const search = req.query.search || ''
    const alcoholbase = req.query?.alcoholbase === 'All'
        ? ''
        : req.query?.alcoholbase != null
            ? req.query.alcoholbase
            : ''

    const cocktails = await Cocktail.find({ name: { $regex: search, $options: 'i' },
         alcoholbase: { $regex: alcoholbase, $options: 'i' }})
        .sort('-createdAt')
        .skip(page * limit)
        .limit(limit)
        .exec()

    const alcoholBaseList = await Cocktail.getAlcoholBaseList()

    if (page === 0) {
        const nmbrOfCocktails = await Cocktail.find({ name: { $regex: search, $options: 'i' },
            alcoholbase: { $regex: alcoholbase, $options: 'i'}}).countDocuments().exec()
        const nmbrOfPages = Math.ceil(nmbrOfCocktails / limit)
        return res.json({
            nmbrOfPages,
            alcoholBaseList,
            cocktails
        })
    }
    
    return res.json({
        cocktails
    })
})

/**
 * @desc Create new cocktail
 * @route POST /cocktails
 * @access private
 */
const createNewCocktail = asyncHandler(async (req, res) => {
    const { name, alcoholbase, description, userId, image } = req.body
    if (!name || !alcoholbase || !description || !image || !userId) {
        if (image) deleteFromCloudinary(image.public_id)
        return res.status(400).json({ message: 'All fields are required' })
    }
    const user = await User.findById(userId).exec()
    if (!user) {
        deleteFromCloudinary(image.public_id)
        return res.status(400).json({ message: 'User not found' })
    }

    if (!validateImgSignature(image)) {
        deleteFromCloudinary(image.public_id)
        return res.status(400).json({ message: 'Invalid signature' })
    }

    const cocktailObject = { name, alcoholbase: formatAlcoholBase(alcoholbase),
        description, user, imageName: image.public_id }
    const cocktail = await Cocktail.create(cocktailObject)
    if (cocktail) {
        res.status(201).json(cocktail)
    } else {
        deleteFromCloudinary(image.public_id)
        res.status(500).json({ message: 'Failed to save cocktail' })
    }
})

/**
 * @desc Update existing cocktail
 * @route PATCH /cocktails
 * @access private
 */
const updateCocktail = asyncHandler(async (req, res) => {
    const { name, alcoholbase, description, id, image } = req.body
    if (!name || !alcoholbase || !description || !id) {
        if (image) deleteFromCloudinary(image.public_id)
        return res.status(400).json({ message: 'All fields are required' })
    }

    const cocktail = await Cocktail.findById(id).exec()
    if (!cocktail) return res.status(404).json({ message: 'No cocktail found' })

    if (image) {
        if (!validateImgSignature(image)) {
            deleteFromCloudinary(image.public_id)
            return res.status(400).json({ message: 'Invalid signature' })
        }
        cocktail.imageName = image.public_id
    }
    cocktail.name = name
    cocktail.alcoholbase = formatAlcoholBase(alcoholbase)
    cocktail.description = description
    const updatedCocktail = await cocktail.save()
    res.status(200).json(updatedCocktail)
})

/**
 * @desc Delete cocktail
 * @route DELETE /cocktails
 * @access private
 */
const deleteCocktail = asyncHandler(async (req, res) => {
    const { id } = req.body
    if (!id) return res.status(400).json({ message: 'Cocktail ID required' })

    const cocktail = await Cocktail.findById(id).exec()
    if (!cocktail) {
        return res.status(400).json({ message: 'No cocktail found' })
    }
    const result = await cocktail.deleteOne()
    deleteFromCloudinary(result.imageName)
    const reply = `Cocktail ${result.name} deleted`
    res.json(reply)
})

/**
 * @desc Get cocktail by id
 * @route GET /cocktails/:id
 * @access private
 */
const getCocktailById = asyncHandler(async (req, res) => {
    const { id } = req.params

    const cocktail = await Cocktail.findById(id).exec()
    if (!cocktail) return res.status(404).json({ message: 'No cocktail found' })

    res.json(cocktail)
})


//Utility functions

/**
 * @param {string} //cloudinary public id of img
 */
const deleteFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId)
    } catch (err) {
        console.log(err)
    }
}

/**
 * @param {object} //cloudinary img object with public_id, version and signature
 * @returns {boolean}
 */
const validateImgSignature = (imgObj) => {
    const expectedSignature = cloudinary.utils.api_sign_request({
        public_id: imgObj.public_id,
        version: imgObj.version
    }, process.env.CLOUDINARY_SECRET)

    return expectedSignature === imgObj.signature
}

//Formats alcoholbase first letter capital and rest lower to avoid duplicates when sending to frontend
const formatAlcoholBase = (str) => {
    return (str.charAt(0)).toUpperCase() + (str.slice(1)).toLowerCase()
}

module.exports = {
    getCocktails,
    createNewCocktail,
    updateCocktail,
    deleteCocktail,
    getCocktailById
}