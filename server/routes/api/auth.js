const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../Models/User');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

//@route api/auth
//@desc get user details
//@access secured
router.get('/', auth, async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select('email name ');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//@route api/auth
//@desc authenication or user login
//@access public
router.post(
  '/',
  check('email', 'email is Required').isEmail(),
  check('password', 'password is required').exists(),
  async (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    let { email, password } = req.body;
    try {
      //user exist or not
      let user = await User.findOne({ email: email });
      if (!user) {
        return res.status(400).json({ errors: [{ message: 'Invalid User' }] });
      }

      let isUserMatched = await bcrypt.compare(password, user.password);
      if (!isUserMatched) {
        return res.status(400).json({ errors: [{ message: 'Invalid User' }] });
      }

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
          res.status(200).json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
