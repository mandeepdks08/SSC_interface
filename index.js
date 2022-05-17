require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const cookieParser = require("cookie-parser");

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

const userRouter = require("./routes/user");
const cartRouter = require("./routes/cart");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serving on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.redirect("/login");
})

app.use("/", userRouter);
app.use("/cart", cartRouter);

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { status = 500 } = err;
  if (!err.message) err.message = "Something Went Wrong!";
  res.status(status).render("errors", { err });
});