const express = require('express')
const router = express.Router()
const verifyJWT = require('../middleware/verifyJWT')
const {
    getComments,
    createNewComment,
    updateComment,
    deleteComment
} = require('../controllers/commentController')

router.use(verifyJWT)

router.route('/')
    .get(getComments)
    .post(createNewComment)
    .patch(updateComment)
    .delete(deleteComment)

module.exports = router