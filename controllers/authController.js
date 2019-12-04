const bcrypt = require("bcryptjs");
const validate = require("../validation/register");
const db = require("../models");
const jwt = require('jsonwebtoken');


// POST Register Route
const register = (req, res) => {
  const { errors, notValid } = validate(req.body);

  // Validate Form Data
  if (notValid) {
    return res.status(400).json({ status: 400, errors });
  }

  // Verify Account Does Not Already Exist
  db.User.findOne({ email: req.body.email }, (err, foundUser) => {
    if (err)
      return res.status(500).json({
        status: 500,
        message: "Something went wrong. Please try again"
      });

    if (foundUser)
      return res.status(400).json({
        status: 400,
        message: "Email address has already been registered. Please try again"
      });

    // Generate Salt (Asynchronous callback version)
    bcrypt.genSalt(10, (err, salt) => {
      if (err)
        return res.status(500).json({
          status: 500,
          message: "Something went wrong. Please try again"
        });
      // if (err) throw err;

      // Hash User Password
      bcrypt.hash(req.body.password, salt, (err, hash) => {
        if (err)
          return res.status(500).json({
            status: 500,
            message: "Something went wrong. Please try again"
          });

        const newUser = {
          username: req.body.username,
          email: req.body.email,
          password: hash
        };

        db.User.create(newUser, (err, savedUser) => {
          if (err) return res.status(500).json({ status: 500, message: err });
          res.status(201).json({ status: 201, message: "success" });
        });
      });
    });
  });
};

// POST Login Route
const login = (req, res) => {
  // Validate email and password exist
  if (!req.body.email || !req.body.password) {
    return res
      .status(400)
      .json({ status: 400, message: "Please enter your email and password" });
  }
  // Find the user account
  db.User.findOne({ email: req.body.email })
    .select("+password")
    .exec((err, foundUser) => {
      if (err)
        return res.status(500).json({
          status: 500,
          message: "Something went wrong. Please try again"
        });

      if (!foundUser) {
        return res
          .status(400)
          .json({ status: 400, message: "Username or password is incorrect" });
      }

      bcrypt.compare(req.body.password, foundUser.password, (err, isMatch) => {
        if (err)
          return res.status(500).json({
            status: 500,
            message: "Something went wrong. Please try again",
            err: err
          });
        // check if the passwords match
        if (isMatch) {
          // create a json web token
          const payload = {
            _id: foundUser._id
          };

          jwt.sign(payload, 'super_secret_password', {expiresIn: '1h'}, (err, signedJwt) => {
            return res.status(200).json({
              status: 200,
              message: 'Success',
              signedJwt
            })
          })
          // the password provided does not match the password on file.
        } else {
          return res.status(400).json({
            status: 400,
            message: "Username or password is incorrect"
          });
        }
      });
    });
};

// POST Logout Route
const logout = (req, res) => {
  // logout functionality only needed on react side
};

module.exports = {
  register,
  login,
  logout
};
