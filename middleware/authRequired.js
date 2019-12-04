const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => { // takes req, res, and the function you want to execute next
 // token validation
  const bearerHeader = req.headers["authorization"]
  // console.log(bearerHeader);
  // next(); // literally telling the function to pass req and res into the next function in line, which we put in users.js as ctrl.users.show
             // still doesn't 

  if (typeof bearerHeader !== "undefined") {
    const token = bearerHeader.split(' ')[1];
    let verified = jwt.verify(token, "super_secret_password")
    console.log('payload', verified);
    req.userId = verified._id; // manipulate the request object, adding the id you just got
    next();
  } else {
    res.sendStatus(403);
  }
};
