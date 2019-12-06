var express = require('express');
const passport = require('passport');
var router = express.Router();
const modelGenerator = require('../utils/model-generator');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'UberForTutor' });
});

/* GET user profile. */
router.get('/me', passport.authenticate('jwt', {session: false}), function(req, res, next) {
  const data = modelGenerator.toUserObject(req.authInfo);
  res.json(data);
});

module.exports = router;
