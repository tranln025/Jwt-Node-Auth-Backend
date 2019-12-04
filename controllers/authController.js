const bcrypt = require('bcryptjs');
const validate = require('../validation/register');
const db = require('../models');
const jwt = require('jsonwebtoken');

// POST Register Route
const register = async (req, res) => {
  try {
    const { errors, notValid } = validate(req.body);
    // Validate Form Data
    if (notValid) {
      return res.status(400).json({ status: 400, errors });
    }
    // Verify Account Does Not Already Exist
    const foundUser = await db.User.findOne({ email: req.body.email });

    if (foundUser)
      return res.status(400).json({
        status: 400,
        message: 'Email address has already been registered. Please try again'
      });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);
    const createdUser = await db.User.create({ ...req.body, password: hash });
    return res
      .status(201)
      .json({ status: 201, message: 'success', createdUser });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: 'Something went wrong. Please try again'
    });
  }
};

// POST Login Route
const login = async (req, res) => {
  try {
    // Validate email and password exist
    if (!req.body.email || !req.body.password) {
      return res
        .status(400)
        .json({ status: 400, message: 'Please enter your email and password' });
    }
    // Find the user account
    const foundUser = await db.User.findOne({ email: req.body.email }).select(
      '+password'
    );
    if (!foundUser) {
      return res
        .status(400)
        .json({ status: 400, message: 'Username or password is incorrect' });
    }

    const isMatch = await bcrypt.compare(req.body.password, foundUser.password);
    // check if the passwords match
    if (isMatch) {
      // create a json web token
      const signedJwt = await jwt.sign(
        {
          _id: foundUser._id
        },
        'super_secret_key',
        {
          // its good practice to have an expiration amount for jwt tokens.
          expiresIn: '1h'
        }
      );
      return res.status(200).json({
        status: 200,
        message: 'Success',
        id: foundUser._id,
        signedJwt
      });
      // the password provided does not match the password on file.
    } else {
      return res.status(400).json({
        status: 400,
        message: 'Username or password is incorrect'
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Something went wrong. Please try again'
    });
  }
};

// POST Logout Route
const logout = (req, res) => {
  // logout functionality not needed. We just remove the JWT on the front end.
};

module.exports = {
  register,
  login,
  logout
};
