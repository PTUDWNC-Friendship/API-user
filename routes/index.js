var express = require('express');
const passport = require('passport');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET user profile. */
router.get('/me', function(req, res, next) {
  passport.authenticate('jwt', {session: false}, (err, isSuccess, user) => {
      if(isSuccess) {
        console.log(user);
                  return res.json(user);
      } else {
          return null;
      }
  })
  (req, res);
});

module.exports = router;
