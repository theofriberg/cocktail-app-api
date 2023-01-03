const express = require('express')
const router = express.Router()
const verifyJWT = require('../middleware/verifyJWT')
const {
    getUsers,
    createNewUser,
    deleteUser,
    updateUser,
    getUserAndCocktails
} = require('../controllers/userController')

router.route('/')
    .get(verifyJWT, getUsers)
    .post(createNewUser)
    .patch(verifyJWT, updateUser)
    .delete(verifyJWT, deleteUser)

router.route('/:id')
    .get(verifyJWT, getUserAndCocktails)

module.exports = router
