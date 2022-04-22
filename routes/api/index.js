const router = require('express').Router();
const thoughts = require('./thoughts');
const users = require('./users');

router.use('/thoughts', thoughts);
router.use('/users', users);

module.exports = router;