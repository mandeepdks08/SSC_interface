//**********Express Configuration************//
const express = require("express");
const app = express();
const path = require("path");
app.listen(3000, () => {
  console.log("ON PORT 3000");
});
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
//****************************************** */

//**********WebSocket Config******************//
const { WebSocketServer } = require("ws");
const wss = new WebSocketServer({ port: 8080 });
//******************************************* */

const { db, auth, firebase, ref } = require("./config/firebase.js");
wss.on("connection", (ws) => {
  firebase.onValue(ref(db, "/carts/cart_101"), async (snapshot) => {
    let products = {};
    snapshot = snapshot.val();
    let items = snapshot["items"];
    const deletedItems = snapshot["deleted_tems"];
    const key = deletedItems == null ? null : Object.keys(deletedItems)[0];
    if (key) {
      for (let item in items) {
        if (items[item] == deletedItems[key]) {
          delete items[item];
          delete deletedItems[key];
          break;
        }
      }
      if (items) {
        firebase.set(ref(db, "/carts/cart_101/items"), items);
      }
      firebase.set(ref(db, "/carts/cart_101/deleted_tems"), {});
    }
    for (let item in items) {
      await firebase
        .get(ref(db, `/productData/${items[item]}`))
        .then((snapshot) => {
          products[item] = snapshot.val();
        })
        .catch((err) => {
          console.log(err);
        });
    }
    ws.send(JSON.stringify(products));
  });
});

app.get("/", async (req, res) => {
  res.render("index", { error: "" });
});

app.post("/", async (req, res) => {
  const { email, password } = req.body;
  await firebase
    .signInWithEmailAndPassword(auth, email, password)
    .then(async () => {
      let user = {};
      await firebase
        .get(ref(db, `/users/${email.slice(0, email.indexOf("@"))}`))
        .then((snapshot) => {
          user = snapshot.val();
        })
        .catch((err) => {
          console.log(err);
        });
      res.render("connectCart", { user: user, error: "" });
    })
    .catch((error) => {
      console.log(error);
      res.render("index", { error: "Invalid Email ID or Password!" });
    });
});

app.get("/signUp", (req, res) => {
  res.render("signUp");
});

app.post("/signUp", async (req, res) => {
  const { email, password, name, phone, pin } = req.body;
  await firebase
    .createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      firebase.set(ref(db, `/users/${email.slice(0, email.indexOf("@"))}/`), {
        name: name,
        phone: phone,
        pin: pin,
      });
      res.render("connectCart", {
        user: { name: name },
        error: "",
      });
    })
    .catch((error) => {
      console.log(error);
      res.send("<h1>OOPS! Some error occurred!</h1>");
    });
});

app.post("/connectCart", async (req, res) => {
  const { cartid } = req.body;
  await firebase
    .get(ref(db, `/carts/cart_${cartid}`))
    .then(async (snapshot) => {
      snapshot = snapshot.val();
      if (snapshot.isAvailable) {
        await firebase
          .set(ref(db, `/carts/cart_${cartid}/isAvailable`), false)
          .then(() => {
            res.render("cartInterface");
          })
          .catch((err) => {
            res.send("Something went wrong!");
            console.log(err);
          });
      } else {
        res.render("connectCart", {
          user: { name: "Elon Musk" },
          error:
            "Cart already in use! (manually set isAvailable: true on firebase)",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.render("connectCart", {
        user: { name: "Elon Musk" },
        error: "Invalid cart ID!",
      });
    });
});

app.get("/checkout", async (req, res) => {
  let balance = 0;
  await firebase
    .get(ref(db, "/users/muskmelon/eCash"))
    .then((snapshot) => {
      balance = snapshot.val();
    })
    .catch((err) => {
      console.log(err);
      res.send("<h1>OOPS! Some error occured!");
    });
  res.render("checkout", { error: "", balance: balance });
});

app.post("/checkout", async (req, res) => {
  const { pin } = req.body;
  const { billAmount } = req.body;
  let balance = 0;
  let pinMatch = false;
  await firebase
    .get(ref(db, "/users/muskmelon"))
    .then((snapshot) => {
      snapshot = snapshot.val();
      balance = snapshot.eCash;
      if (snapshot.pin == pin) {
        pinMatch = true;
      }
    })
    .catch((err) => {
      console.log(err);
      res.send("<h1>Some error occured!</h1>");
    });
  if (pinMatch) {
    firebase.set(ref(db, "/users/muskmelon/eCash"), balance - billAmount);
    res.render("paymentSuccessful");
  } else {
    res.render("checkout", { error: "Wrong Pin!", balance: balance });
  }
});

app.post("/logout", async (req, res) => {
  firebase
    .signOut(auth)
    .then(async () => {
      await firebase.set(ref(db, "/carts/cart_101/isAvailable"), true);
      await firebase
        .set(ref(db, "/carts/cart_101/items"), {})
        .then(() => {
          res.redirect("/");
        })
        .catch((err) => {
          console.log(err);
          res.send("<h1>SOMETHING WENT WRONG!</h1>");
        });
    })
    .catch((err) => {
      console.log(err);
      res.send("<h1>SOMETHING WENT WRONG!</h1>");
    });
});
