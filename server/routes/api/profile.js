const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../Models/User');
const Profile = require('../../Models/Profile');
const { check, validationResult } = require('express-validator');
const config = require('config');
const request = require('request');

//@route api/profile/me
//@desc get current profile
//@access private
router.get('/me', auth, async (req, res) => {
  try {
    let currentUser = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);
    //console.log(currentUser);
    if (currentUser) {
      return res.json(currentUser);
    } else {
      return res
        .status(400)
        .json({ message: 'There is no profile for this user.' });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

///

router.post(
  '/',
  [
    auth,
    check('skill', 'Skill is required').not().isEmpty(),
    check('status', 'Status is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let { location, skill, status, date } = req.body;

    let profileFields = {};
    profileFields.user = req.user.id;
    if (skill) profileFields.skill = skill.split(',').map((s) => s.trim());
    if (status) profileFields.status = status;
    if (date) profileFields.date = date;

    try {
      let profile = await Profile.findOne({
        user: req.user.id,
      });

      //find and update
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.status(200).json({ profile });
      }

      //create
      profile = new Profile(profileFields);
      //save
      await profile.save();

      res.status(200).json({ profile });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//@route api/profile/
//@desc get all profiles
//@access public

router.get('/', async (req, res) => {
  try {
    let profiles = await Profile.find().populate('user', ['avatar', 'name']);

    return res.status(200).json(profiles);
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

//@route api/profile/user/:user_id
//@desc get  profile by user id
//@access public

router.get('/user/:user_id', async (req, res) => {
  try {
    console.log(req.params.user_id);
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['avatar', 'name']);

    if (!profile)
      return res.status(400).json({ message: 'No profile by this user id' });

    return res.status(200).json(profile);
  } catch (error) {
    if ((error.kind = 'ObjectId')) {
      return res.status(400).json({ message: 'No profile by this user id' });
    }
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

//@route Delete api/profile
//@desc delete profile, userid
//@access public

router.delete('/', auth, async (req, res) => {
  try {
    //delete profile
    await Profile.findOneAndDelete({
      user: req.user.id,
    });

    //delete user
    await User.findOneAndDelete({
      _id: req.user.id,
    });

    return res.status(200).json({ message: 'Profile and user deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

//@route Put api/profile/experience
//@desc add profile experience
//@access private

router.put(
  '/experience',
  [auth, [check('company', 'company is required')]],
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let profile = await Profile.findOne({ user: req.user.id });
      const { company } = req.body;
      let newExperience = { company };
      if (profile) {
        profile.experience = profile.experience || [];

        profile.experience.unshift(newExperience);
      }
      await profile.save();
      return res.json(profile);
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
);

//@route Delete api/profile/experience/:experience_id
//@desc delete a  experience from profile
//@access private

router.delete('/experience/:experience_id', auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });
    console.log(profile.experience);
    if (profile) {
      let indexOfExperience = profile.experience
        .map((item) => item.id)
        .indexOf(req.params.experience_id);
      console.log(indexOfExperience);
      indexOfExperience > 0 && profile.experience.splice(indexOfExperience, 1);
    }
    await profile.save();
    return res.json(profile);
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

//@route Get api/profile/github/:user_name
//@desc Get github repos for the given username
//@access public
router.get('/github/:user_name', async (req, res) => {
  const github_client_id = config.get('github_client_id');
  const github_client_secret = config.get('github_client_secret');

  try {
    const options = {
      uri: `https://api.github.com/users/${req.params.user_name}/repos?sort=created:desc&per_page=2`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' },
    };

    request(options, (error, response, body) => {
      if (error) console.log(error);
      console.log(options.uri);
      if (response.statusCode !== 200)
        return res.status(404).json({ message: 'No user name found' });

      return res.status(200).json(JSON.parse(body));
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
