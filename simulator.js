const { initializeApp } = require("firebase/app");
const { getDatabase, ref, push } = require("firebase/database");
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
const app = initializeApp(firebaseConfig);
const db = getDatabase();

let items = ["bt6285", "ch2343", "ip8349", "lp5478", "pp3425", "sm1231", "sp2434", "tv2456"];

function addItem(id) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            push(ref(db, '/carts/cart_101/items'), id )
                .then(() => {
                    resolve();
                })
        }, 3000);
    });
}

function deleteItem(id) {
    return new Promise((resolve, reject)=> {
        setTimeout(() => {
            push(ref(db, '/carts/cart_101/deleted_tems'), id)
                .then(()=> {
                    resolve();
                })
        }, 3000)
    });
}

async function simulator() {
    let shoppedItems = [];
  
    while(true) {
        let num = Math.floor(Math.random()*10);
        
        if(num < 8) {
            const index = Math.floor(Math.random()*8);
            if(shoppedItems.indexOf(items[index]) != -1) {
                continue;
            } else {
                shoppedItems.push(items[index]);
                await addItem(items[index]);
            }
        } else {
            if(shoppedItems.length != 0) {
                const index = Math.floor(Math.random()*shoppedItems.length); //if array length is 4 => [0,3]
                const id = shoppedItems[index];
                shoppedItems.splice(index,1);
                await deleteItem(id);
            }
        }
    }
}

simulator();