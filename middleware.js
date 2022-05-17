const jwt = require("jsonwebtoken");
const { realDB } = require("./config/firebase");
const ExpressError = require("./utils/ExpressError");
const { getUserWithEmailId } = require("./customMethods");

module.exports.authenticate = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) return res.redirect("/login");
  try {
    let tokenValid = false;
    await realDB.ref("/validTokens").once("value", (data) => {
      if (!data.exists()) return;
      const tokens = data.val();
      const keys = Object.keys(tokens);
      for (let key of keys) {
        if (tokens[key] == token) {
          tokenValid = true;
          break;
        }
      }
    });
    if (!tokenValid) throw new ExpressError("Invalid token", 400);
    let decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await getUserWithEmailId(decoded);
    res.locals.user = req.user;
    next();
  } catch (err) {
    console.log(err);
    return res.redirect("/login");
  }
};

module.exports.checkConnected = async (req, res, next) => {
  const {email} = req.user;
  try {
    await realDB.ref(`/currentUsers/${email.slice(0,email.indexOf('@'))}`).once("value", data => {
      if(!data.exists()) return next();
      const cartid = data.val();
      console.log(cartid);
      return res.redirect("/cart/interface");
    })
  } catch(err) {
    console.log(err);
    next();
  }
  
}