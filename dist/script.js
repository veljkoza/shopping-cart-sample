function $(selector) {
  return document.querySelector(selector);
}

const addProductName = $("#product-name");
const addProductDesc = $("#product-description");
const addProductImg = $("#product-image");
const addProductPrice = $("#product-price");
const addBtn = $("#add-btn");

const listProducts = $(".list-products");

const modalContainer = $(".modal-container");
const modal = $(".modal");
const hideModalBtn = $("#hideModal");

if (localStorage.getItem("allItemsJsonId") === null) {
  createItemsJson();
} else {
  loadItems();
}

async function loadItems() {
  let blobId = localStorage.getItem("allItemsJsonId");
  let items = [];
  await fetch(`https://jsonblob.com/api/jsonBlob/${blobId}`, {
    method: "GET",
  }).then(res=>res.json())
  .then(data => console.log(data));
}

function loadItem(itemObj){
  
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
  newProductDiv.setAttribute("data-id", id);
  newProductDiv.innerHTML = ` 
    <img
        src="${img}"
    />
    <p>${name}</p>
    <p>$${price}</p>`;
  let detailsBtn = document.createElement("button");
  detailsBtn.classList.add("details-button");
  detailsBtn.textContent = "Details";
  let buyBtn = document.createElement("button");
  buyBtn.classList.add("buy-button");
  buyBtn.textContent = "Buy";

  detailsBtn.addEventListener("click", showModalWindow);
  newProductDiv.appendChild(detailsBtn);
  newProductDiv.appendChild(buyBtn);
  listProducts.appendChild(newProductDiv);

  let newItem = {};
  newItem.id = id;
  newItem.name = name;
  newItem.desc = desc;
  newItem.img = img;
  newItem.price = price;

  addNewItemToJson(newItem);
}

async function showModalWindow(e) {
  let itemId = this.parentElement.getAttribute("data-id");
  let item;
  await getItemById(itemId)
    .then((res) => res)
    .then((data) => (item = data));

  modal.innerHTML = "";
  let modalLeft = document.createElement("div");
  modalLeft.classList.add("modal-left");
  modalLeft.style.backgroundImage = `url('${item.img}')`;
  console.log(modalLeft);
  modal.appendChild(modalLeft);

  let modalRight = document.createElement("div");
  modalRight.classList.add("modal-right");
  modalRight.innerHTML = `<button id="hideModal"><i class="fas fa-times"></i></button>
  <p>${item.name}</p>
  <p>
  ${item.desc}
  </p>
  <span></span>
  <div class="modal-bot">
    <button class="buy-button">Buy</button>
    <p>$${item.price}</p>
  </div>`;
  let hideModalBtn = modalRight.firstElementChild;
  console.log(hideModalBtn);
  hideModalBtn.addEventListener("click", (e) => {
    modalContainer.classList.remove("active");
  });
  modal.appendChild(modalRight);
  modalContainer.classList.add("active");
}

async function getItemById(id) {
  let blobId = localStorage.getItem("allItemsJsonId");
  let item = {};
  console.log("test");
  await fetch(`https://jsonblob.com/api/jsonBlob/${blobId}`, {
    method: "GET",
  })
    .then((res) => res.json())
    .then((data) => {
      item = data.items.find((item) => item.id === id);
    });

  return item;
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
