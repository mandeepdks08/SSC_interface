const ws = new WebSocket("ws://localhost:8080");
let products = [];
let total = 0;
function displayCartEmpty() {
  const section = document.querySelector("section");
  section.innerHTML = "Cart is empty";
  section.classList.add("text-center", "display-6");
}
if (products.length == 0) {
  displayCartEmpty();
}
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
function displayProducts() {
  if (products.length == 0) {
    displayCartEmpty();
  } else {
    createTable();
    total = 0;
    for (let product of products) {
      const tr = document.createElement("tr");
      const sno = document.createElement("th");
      const item = document.createElement("td");
      const price = document.createElement("td");
      sno.innerText = `${products.indexOf(product) + 1}`;
      item.innerText = `${product.name}`;
      price.innerText = `${product.price}`;
      sno.scope = "row";
      tr.append(sno);
      tr.append(item);
      tr.append(price);
      document.querySelector("tbody").append(tr);
      total += product.price;
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
}
ws.addEventListener("open", () => {
  ws.addEventListener("message", (e) => {
    const product = JSON.parse(e.data);
    const keys = Object.keys(product);
    if (keys.length == 0) {
      displayCartEmpty();
    } else {
      products = [];
      for (let key of keys) {
        products.push(product[key]);
      }
      displayProducts();
    }
  });
});

function checkout() {
  window.sessionStorage.setItem("billAmount", total);
  return confirm("Sure you want to checkout?");
}
