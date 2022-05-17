function displayCartEmpty() {
  const section = document.querySelector("section");
  section.innerHTML = "Cart is empty";
  section.classList.add("text-center", "display-6");
}

displayCartEmpty();

function createTable() {
  document
    .querySelector("section")
    .classList.remove("text-center", "display-6");
  document.querySelector("section").innerHTML = ``;

  //Declaring elements
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");
  const tr = document.createElement("tr");
  const sno = document.createElement("th");
  const item = document.createElement("th");
  const price = document.createElement("th");

  //Adding classes to elements
  table.classList.add("table");
  thead.classList.add("thead-dark");

  //Adding innerText in elements
  sno.innerText = "#";
  item.innerText = "Item";
  price.innerHTML = "Price";
  tr.id = "tableHeader";

  sno.scope = "col";
  item.scope = "col";
  price.scope = "col";

  //Appending elements
  tr.append(sno, item, price);
  thead.append(tr);
  table.append(thead, tbody);
  document.querySelector("section").append(table);
}

function displayProducts(products) {
  if (products.length == 0) return displayCartEmpty();

  createTable();
  let total = 0;
  let i = 1;
  for (let product of products) {
    const tr = document.createElement("tr");
    const sno = document.createElement("th");
    const item = document.createElement("td");
    const price = document.createElement("td");
    sno.innerText = `${i}`;
    item.innerText = `${product.name}`;
    price.innerText = `${product.price}`;
    sno.scope = "row";
    tr.append(sno);
    tr.append(item);
    tr.append(price);
    document.querySelector("tbody").append(tr);
    total += product.price;
    i++;
  }
  const tr = document.createElement("tr");
  const sno = document.createElement("td");
  const totalLabel = document.createElement("th");
  const totalPrice = document.createElement("th");
  totalLabel.innerText = "Total";
  totalPrice.innerHTML = `&#8377; ${total}`;

  totalLabel.classList.add("bold", "text-end");
  totalPrice.classList.add("bold");

  tr.append(sno, totalLabel, totalPrice);
  document.querySelector("tbody").append(tr);
}

async function getCartID() {
  let cartid = -1;
  await get(child(ref(realDB), `/currentUsers/${user.email}`))
    .then((snapshot) => {
      if (!snapshot.exists()) window.location.assign("/cart/connect");
      cartid = snapshot.val();
    })
    .catch((err) => {
      console.log(err);
    });
  return cartid;
}

const cartID = getCartID();
if (cartID == -1) window.location.assign("/cart/connect");

onValue(ref(db, `/carts/${cartID}/products`), async (snapshot) => {
  if (!snapshot.exists()) return;
  const productIds = snapshot.val();
  const products = [];
  for (let productId in productIds) {
    const doc = await db
      .collection("products")
      .doc(productIds[productId])
      .get();
    if (doc.exists()) products.push(doc.data());
  }
  displayProducts(products);
});
