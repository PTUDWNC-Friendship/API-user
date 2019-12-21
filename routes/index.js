var express = require('express');
const passport = require('passport');
var router = express.Router();
const jwt = require('jsonwebtoken');
const modelGenerator = require('../utils/model-generator');
const constant = require('../utils/constant');
const UserModel = require('../models/user');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'UberForTutor' });
});

/* GET user profile. */
router.get('/me', passport.authenticate('jwt', {session: false}), function(req, res, next) {
  const authInfo = req.authInfo;
  if(authInfo) {
    var data = modelGenerator.toUserObject(req.authInfo);
    data = { ...data, token: jwt.sign(JSON.stringify(data), constant.JWT_SECRET)};
    res.json(data);
  }
  else {
    res.json(null);
  }
});

router.get("/verification/:token", async (req, res) => {
  const { token } = req.params;
  const decoded = jwt.verify(token, constant.EMAIL_SECRET);
  console.log(decoded);
  if (decoded._id) {
    let user = await UserModel.findById(decoded._id);
    if (user) {
      user.status = 'active';
      user.save().catch(err => console.log(err));
      res.redirect(`${constant.URL_CLIENT}/logout`);
    }
  }
  res.json(decoded);
});

module.exports = router;