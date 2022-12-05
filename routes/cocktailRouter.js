const express = require('express')
const router = express.Router()
const Cocktail = require('../models/Cocktail')
const asyncHandler = require('express-async-handler')

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
    const { name, alcoholbase, description } = req.body
    if (!name || !alcoholbase || !description) {
        return res.status(400).json({ message: 'All fields are required' })
    }
    const cocktailObject = { name, alcoholbase, description }
    const cocktail = await Cocktail.create(cocktailObject)
    if (cocktail) {
        res.status(201).json({ message: `New cocktail ${cocktail.name} created`})
    } else {
        res.status(500).json({ message: 'Failed to save cocktail'})
    }
})

/**
 * @desc Update existing cocktail
 * @route PATCH /cocktails
 */
const updateCocktail = asyncHandler(async (req, res) => {
    const { id, name, alcoholbase, description } = req.body
    if (!id || !name || !alcoholbase || !description) {
        return res.status(400).json({ message: 'All fields are required' })
    }
    const cocktail = await Cocktail.findById(id).exec()
    if (!cocktail) {
        return res.status(400).json({ message: 'No cocktail found' })
    }
    cocktail.name = name
    cocktail.alcoholbase = alcoholbase
    cocktail.description = description
    const updatedCocktail = await cocktail.save()
    res.status(200).json({ message: `${updatedCocktail.name} updated` })
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
    const reply = `Cocktail ${result.name} deleted`
    res.json(reply)
})

router.route('/')
    .get(getAllCocktails)
    .post(createNewCocktail)
    .patch(updateCocktail)
    .delete(deleteCocktail)

module.exports = router