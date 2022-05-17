const {
  loginUserAndGetIdToken,
  registerUser,
  removeTokenFromDatabase,
  clearUserDataFromRealDB,
} = require("../customMethods");

module.exports.renderLoginForm = (req, res) => {
  res.render("user/login", { error: "" });
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await loginUserAndGetIdToken(email, password);
    res.cookie("token", token);
    res.redirect("/cart/connect");
  } catch (err) {
    res.locals.msg = err.msg;
    res.redirect("/login");
  }
};

module.exports.renderRegisterForm = (req, res) => {
  res.render("user/register");
};

module.exports.register = async (req, res) => {
  const { user } = req.body;
  const { email, password } = user;
  try {
    await registerUser(user);
    const token = await loginUserAndGetIdToken(email, password);
    console.log("User registered");
    console.log(token);
    res.cookie("token", token);
    res.redirect("/cart/connect");
  } catch (err) {
    res.locals.msg = err.msg;
    console.log(err);
    return res.redirect("/register");
  }
};

module.exports.logout = async (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.redirect("/login");
  await removeTokenFromDatabase(token);
  await clearUserDataFromRealDB(req.user);
  res.clearCookie("token").redirect("/login");
};
