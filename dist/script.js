function $(selector) {
  return document.querySelector(selector);
}

const addProductName = $("#product-name");
const addProductDesc = $("#product-description");
const addProductImg = $("#product-image");
const addProductPrice = $("#product-price");
const addBtn = $("#add-btn");

const listProducts = $(".list-products");

if (localStorage.getItem("allItemsJsonId") === null) {
  createItemsJson();
}

async function createItemsJson() {
  let items = {
    items: [],
  };
  let blobId = "";
  await fetch("https://jsonblob.com/api/jsonBlob", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(items),
  }).then((res) => {
    res.headers.forEach((header) => {
      blobId = header;
    });
  });
  localStorage.setItem("allItemsJsonId", blobId);
}

(function loadEventListeners() {
  addBtn.addEventListener("click", addNewItem);
})();

function addNewItem(e) {
  e.preventDefault();
  let newProductDiv = document.createElement("div");
  let name = addProductName.value;
  let desc = addProductDesc.value;
  let img = addProductImg.value;
  let price = addProductPrice.value;

  let id = Math.random().toString(16).slice(2);
  newProductDiv.classList.add("product");
  newProductDiv.innerHTML = ` 
    <img
        src="${img}"
    />
    <p>${name}</p>
    <p>$${price}</p>
    <button class="details-button">Details</button>
    <button class="buy-button">Buy</button>`;

  listProducts.appendChild(newProductDiv);

  let newItem = {};
  newItem.id = id;
  newItem.name = name;
  newItem.desc = desc;
  newItem.img = img;
  newItem.price = price;

  addNewItemToJson(newItem);
}

async function addNewItemToJson(newItem) {
  let blobId = localStorage.getItem("allItemsJsonId");
  let jsonObj = { items: [] };

  await fetch(`https://jsonblob.com/api/jsonBlob/${blobId}`, {
    method: "GET",
  })
    .then((res) => res.json())
    .then((data) => {
      jsonObj.items = data.items;
    });
  jsonObj.items.push(newItem);

  fetch(`https://jsonblob.com/api/jsonBlob/${blobId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(jsonObj),
  })
    .then((response) => {
      if (response.ok) {
        response.json();
      } else {
        throw new Error("Wrong json ID!");
      }
    })
    .catch((error) => {
      console.log(error);
    });
}
