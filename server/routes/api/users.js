const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../../Models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

//@route api/users
//@desc
//@access public
router.post(
  '/',
  [
    check('name', 'Name is Required').not().isEmpty(),

    check('email', 'email is Required').isEmail(),
    check('password', 'password length greater 6 or than 6').isLength({
      min: 6,
    }),
  ],

  async (req, res) => {
    const errors = validationResult(req);
    // console.log(req.body);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let { name, email, password } = req.body;
    try {
      //user exist or not
      let user = await User.findOne({ email: email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ message: 'User Already Exists' }] });
      }

      //avatar
      let avatar = gravatar.url(email, {
        s: 200,
        r: 'pg',
        d: 'mm',
      });

      user = new User({
        name,
        email,
        password,
        avatar,
      });

      //password encrypt
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      //save
      await user.save();

      const payload = {
        user: { id: user.id },
      };

      const jwtSecretKey = config.get('jwtSecret');

      jwt.sign(
        payload,
        jwtSecretKey,
        {
          expiresIn: 36000000,
        },
        (err, token) => {
          return res.status(200).json({ token });
        }
      );
    } catch (err) {
      // console.error(err.message);
      return res.status(500).send('Server Error');
    }
  }
);

/*
//@route api/users
//@desc test
//@access public
router.get('/', (req, res) => {
  res.send('user test route');
});
*/

module.exports = router;
