const express = require('express')
const router = express.Router()
const Cocktail = require('../models/Cocktail')
const asyncHandler = require('express-async-handler')
const { upload, removeCocktailImage } = require('../config/multerOptions')

/**
 * @desc Get all cocktails
 * @route GET /cocktails
 */
const getAllCocktails = asyncHandler(async (req, res) => {
    const cocktails = await Cocktail.find().lean()
    if (!cocktails?.length) {
        return res.status(400).json({ message: 'No cocktails found' })        
    }
    res.json(cocktails)
})

/**
 * @desc Create new cocktail
 * @route POST /cocktails
 */
const createNewCocktail = asyncHandler(async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    const { name, alcoholbase, description } = req.body
    if (!name || !alcoholbase || !description || !fileName) {
        removeCocktailImage(fileName)
        return res.status(400).json({ message: 'All fields are required' })
    }
    const cocktailObject = { name, alcoholbase, description, imageName: fileName }
    const cocktail = await Cocktail.create(cocktailObject)
    if (cocktail) {
        res.status(201).json(cocktail)
    } else {
        removeCocktailImage(fileName)
        res.status(500).json({ message: 'Failed to save cocktail'})
    }
})

/**
 * @desc Update existing cocktail
 * @route PATCH /cocktails
 */
const updateCocktail = asyncHandler(async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    const { id, name, alcoholbase, description } = req.body
    if (!id || !name || !alcoholbase || !description) {
        if (fileName) {
            removeCocktailImage(fileName)
        }
        return res.status(400).json({ message: 'All fields except image are required' })
    }
    const cocktail = await Cocktail.findById(id).exec()
    if (!cocktail) {
        if (fileName) {
            removeCocktailImage(fileName)
        }
        return res.status(400).json({ message: 'No cocktail found' })
    }
    if (fileName) {
        removeCocktailImage(cocktail.imageName)
        cocktail.imageName = fileName
    }
    cocktail.name = name
    cocktail.alcoholbase = alcoholbase
    cocktail.description = description
    const updatedCocktail = await cocktail.save()
    res.status(200).json(updatedCocktail)
})

/**
 * @desc Delete cocktail
 * @route DELETE /cocktails
 */
const deleteCocktail = asyncHandler(async (req, res) => {
    const { id } = req.body
    const cocktail = await Cocktail.findById(id).exec()
    if (!cocktail) {
        return res.status(400).json({ message: 'No cocktail found' })
    }
    const result = await cocktail.deleteOne()
    removeCocktailImage(result.imageName)
    const reply = `Cocktail ${result.name} deleted`
    res.json(reply)
})

router.route('/')
    .get(getAllCocktails)
    .post(upload.single('cocktailImage'), createNewCocktail)
    .patch(upload.single('cocktailImage'), updateCocktail)
    .delete(deleteCocktail)

module.exports = router