var express = require('express');
const passport = require('passport');
var router = express.Router();
const jwt = require('jsonwebtoken');
const modelGenerator = require('../utils/model-generator');
const constant = require('../utils/constant');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'UberForTutor' });
});

/* GET user profile. */
router.get('/me', passport.authenticate('jwt', {session: false}), function(req, res, next) {
  const authInfo = req.authInfo;
  if(authInfo) {
    var data = modelGenerator.toUserObject(req.authInfo);
    data = { ...data, token: jwt.sign(JSON.stringify(data), constant.JWT_SECRET)}
    res.json(data);
  }
  else {
    res.json(null);
  }
});

module.exports = router;
