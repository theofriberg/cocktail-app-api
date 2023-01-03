const express = require('express')
const router = express.Router()
const verifyJWT = require('../middleware/verifyJWT')
const {
    getCocktails,
    createNewCocktail,
    updateCocktail,
    deleteCocktail,
    getCocktailById
} = require('../controllers/cocktailController')

router.route('/:id')
    .get(verifyJWT, getCocktailById)

router.route('/')
    .get(getCocktails)
    .post(verifyJWT, createNewCocktail)
    .patch(verifyJWT, updateCocktail)
    .delete(verifyJWT, deleteCocktail)

module.exports = router