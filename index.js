//**********Express Configuration************//
const express = require("express");
const app = express();
app.listen(3000, () => {
  console.log("ON PORT 3000");
});
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//****************************************** */

//**********Firebase Configuration************//
const { initializeApp } = require("firebase/app");
const {
  getDatabase,
  ref,
  set,
  get,
  child,
  onValue,
} = require("firebase/database");
const {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} = require("firebase/auth");
const firebaseConfig = {
  apiKey: "AIzaSyDsJVrQpZA8OcCmWk3X19-A2l8ZMy5aVm0",
  authDomain: "smartcart-eb460.firebaseapp.com",
  databaseURL:
    "https://smartcart-eb460-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smartcart-eb460",
  storageBucket: "smartcart-eb460.appspot.com",
  messagingSenderId: "831156107896",
  appId: "1:831156107896:web:6a669855c81227398c4b8d",
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase();
const auth = getAuth();
//********************************************* */

//**********WebSocket Config******************//
const { WebSocketServer } = require("ws");
const wss = new WebSocketServer({ port: 8080 });
wss.on("connection", (ws) => {
  onValue(ref(db, "/carts/cart_101"), async (snapshot) => {
    let products = {};
    snapshot = snapshot.val();
    let items = snapshot["items"];
    const deletedItems = snapshot["deleted_tems"];
    const key = (deletedItems == null) ? null : Object.keys(deletedItems)[0];
    if (key) {
      for (let item in items) {
        if (items[item] == deletedItems[key]) {
          delete items[item];
          delete deletedItems[key];
          break;
        }
      }
      if (items) {
        set(ref(db, "/carts/cart_101/items"), items);
      }
      set(ref(db, "/carts/cart_101/deleted_tems"), {});
    }
    for (let item in items) {
      await get(ref(db, `/productData/${items[item]}`))
        .then((snapshot) => {
          products[item] = snapshot.val();
          console.log(products);
        })
        .catch((err) => {
          console.log(err);
        });
    }
    ws.send(JSON.stringify(products));
  });
});
//******************************************* */

//Renders home page, i.e., login page
app.get("/", async (req, res) => {
  res.render("index", { error: "" });
});

app.post("/", async (req, res) => {
  const { email, password } = req.body;
  await signInWithEmailAndPassword(auth, email, password)
    .then(async () => {
      let user = {};
      await get(ref(db, `/users/${email.slice(0, email.indexOf("@"))}`))
        .then((snapshot) => {
          user = snapshot.val();
          console.log(user);
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

//Send sign up form to /signUp path
app.get("/signUp", (req, res) => {
  res.render("signUp");
});

//Post request to /signUp path to create user
app.post("/signUp", async (req, res) => {
  const { email, password, name, phone } = req.body;
  //validate the credentials in front-end .js file as well as here in back-end
  await createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log(userCredential.user);
      set(ref(db, `/users/${email.slice(0, email.indexOf("@"))}/`), {
        name: name,
        phone: phone,
      });
      res.render("connectCart", {
        user: { name: name },
        error: "",
      });
    })
    .catch((error) => {
      console.log(error);
      res.send("OOPS! Some error occurred!");
    });
});

//
app.post("/connectCart", async (req, res) => {
  const { cartid } = req.body;
  await get(ref(db, `/carts/cart_${cartid}`))
    .then(async (snapshot) => {
      snapshot = snapshot.val();
      if (snapshot.isAvailable) {
        await set(ref(db, `/carts/cart_${cartid}/isAvailable`), false)
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

app.post("/logout", async (req, res) => {
  signOut(auth)
    .then(async () => {
      await set(ref(db, "/carts/cart_101/isAvailable"), true);
      await set(ref(db, "/carts/cart_101/items"), {})
        .then(() => {
          res.redirect("/");
        })
        .catch((err) => {
          console.log(err);
          res.send("SOMETHING WENT WRONG!");
        });
    })
    .catch((err) => {
      console.log(err);
      res.send("SOMETHING WENT WRONG!");
    });
});
