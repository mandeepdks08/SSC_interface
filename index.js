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
  apiKey: "AIzaSyBnFBTimV12rTPKjRZ4wn8HkLrsLk5-7E8",
  authDomain: "cart-e2732.firebaseapp.com",
  databaseURL:
    "https://cart-e2732-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cart-e2732",
  storageBucket: "cart-e2732.appspot.com",
  messagingSenderId: "91406675401",
  appId: "1:91406675401:web:a11fed29eec28cd7d34c18",
  measurementId: "G-S1SX5VKC07",
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase();
const auth = getAuth();
//********************************************* */

//**********WebSocket Config******************//
const { WebSocketServer } = require("ws");
const wss = new WebSocketServer({ port: 8080 });
wss.on("connection", (ws) => {
  console.log("User joined!");

  //onValue fn. triggers whenever there are changes in the specified path
  onValue(ref(db, "/carts/cart1/products"), (snapshot) => {
    const data = snapshot.val();
    if (data) {
      ws.send(JSON.stringify(data));
    } else {
      ws.send(JSON.stringify({}));
    }
  });

  //This fn. runs when a socket disconnects
  ws.on("close", () => {
    console.log("User left :(");
  });
});
//******************************************* */

//Renders home page, i.e., login page
//Also checks for email and id, and if provided, tries to log-in the user
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
  await get(ref(db, `/carts/cart${cartid}`))
    .then(async (snapshot) => {
      snapshot = snapshot.val();
      if (snapshot.isAvailable) {
        await set(ref(db, `/carts/cart${cartid}/isAvailable`), false)
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
          error: "Cart already in use! (manually set isAvailable: true on firebase)",
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
      await set(ref(db, "/carts/cart1/isAvailable"), true);
      await set(ref(db, "/carts/cart1/products"), {})
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
