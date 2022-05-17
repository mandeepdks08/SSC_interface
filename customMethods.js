const { db, realDB } = require("./config/firebase");
const ExpressError = require("./utils/ExpressError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports.loginUserAndGetIdToken = async (email, password) => {
  const msg = "Invalid email or password";
  const doc = await db.collection("users").doc(email).get();
  if (!doc.exists) throw new ExpressError(msg, 402);

  const user = doc.data();
  const result = await bcrypt.compare(password, user.password);
  if (!result) throw new ExpressError(msg, 402);

  const token = jwt.sign(email, process.env.JWT_SECRET);
  const newTokenRef = await realDB.ref("/").child("validTokens").push();
  await newTokenRef.set(token);
  return token;
};

module.exports.registerUser = async (user) => {
  const doc = await db.collection("users").doc(user.email).get();
  if (doc.exists && doc.data().email == user.email)
    throw new ExpressError("User with that email id already exists", 400);

  try {
    user.password = await bcrypt.hash(user.password, 10);
    user.paymentPin = await bcrypt.hash(user.paymentPin, 10);
    await db.collection("users").doc(user.email).set({
      displayName: user.displayName,
      phone: user.phone,
      password: user.password,
      paymentPin: user.paymentPin,
      email: user.email,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.removeTokenFromDatabase = async (token) => {
  try {
    realDB.ref(`/validTokens`).once("value", (data) => {
      if (!data.exists()) return;
      const tokens = data.val();
      for (let key of Object.keys(tokens)) {
        if (tokens[key] == token) {
          realDB.ref(`/validTokens/${key}`).remove();
          break;
        }
      }
    });
  } catch (err) {}
};

module.exports.clearUserDataFromRealDB = async (user) => {
  try {
    await realDB
      .ref(`/currentUsers/${user.email.slice(0, user.email.indexOf("@"))}`)
      .once("value", (data) => {
        if (!data.exists()) return;
        const cartid = data.val();
        realDB
          .ref(`/currentUsers/${user.email.slice(0, user.email.indexOf("@"))}`)
          .remove();
        realDB.ref(`/carts/${cartid}/connectedWith`).set("null");
      });
  } catch (err) {
    console.log(err);
  }
};

module.exports.getUserWithEmailId = async (email) => {
  const doc = await db.collection("users").doc(email).get();
  if (!doc.exists) throw new ExpressError("User does not exist", 400);
  return doc.data();
};

module.exports.connectCartWithCartId = async (cartid, email) => {
  try {
    await realDB.ref(`/carts/${cartid}`).once("value", async (data) => {
      if (!data.exists()) return;
      const { connectedWith = null } = data.val();
      if (connectedWith.toString() != "null")
        throw new ExpressError("Could not connect the cart", 500);
      try {
        await realDB.ref(`/carts/${cartid}/connectedWith`).set(email);
        await realDB
          .ref(`/currentUsers/${email.slice(0, email.indexOf("@"))}`)
          .set(cartid);
      } catch (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.isPaired = async (user) => {
  const {email} = user;
  let cartID = -1;
  await realDB.ref(`/currentUsers/${email.slice(0,email.indexOf('@'))}`).once("value", (data) => {
    if(!data.exists()) return;
    cartID = data.val();
  })
  if(cartID == -1)
    return false;
  
  let paired = false;
  await realDB.ref(`/carts/${cartID}/pairedWith`).once("value", data => {
    if(!data.exists()) return;
    if(data.val().toString() != "null")
      paired = true;
  })
  return paired;
}

module.exports.pairCartUsingPairingCode = async (pairingCode, user) => {
  let userCartID = -1;
  let pairCartID = -1;
  const email = user.email;
  await realDB.ref(`/currentUsers/${email.slice(0,email.indexOf('@'))}`).once("value", (data) => {
    if(!data.exists()) return;
    userCartID = data.val();
  })
  if(userCartID == -1) throw new ExpressError(`${email} is not in current users list`, 400);
  await realDB.ref(`/pairingCodes/${pairingCode}`).once("value", data => {
    if(!data.exists()) return;
    pairCartID = data.val();
  })
  if(pairCartID == -1) throw new ExpressError(`Invalid pairing code`, 400);
  await realDB.ref(`/carts/${userCartID}/pairedWith`).set(pairCartID);
  await realDB.ref(`/carts/${pairCartID}/pairedWith`).set(userCartID);
  realDB.ref(`/pairingCodes/${pairingCode}`).remove();
}