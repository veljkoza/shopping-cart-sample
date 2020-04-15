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

const shoppingCart = $(".shopping-cart-products");
const totalAmountElement = $("#totalAmount");
const purchaseBtn = $("#purchase");

if (localStorage.getItem("allItemsJsonId") === null) {
  createItemsJson();
} else {
  loadItems();
}

if (localStorage.getItem("cartItems") === null) {
  let cartItems = [];
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
} else {
  let cartSum = 0;
  let cartItems = JSON.parse(localStorage.getItem("cartItems"));
  cartItems.forEach((cartItem) => {
    createCartItem(
      cartItem.id,
      cartItem.name,
      cartItem.price,
      cartItem.img,
      true
    );
    cartSum += cartItem.price * cartItem.noOf;
    totalAmountElement.innerHTML = `$${cartSum}`;
  });
}

async function loadItems() {
  let blobId = localStorage.getItem("allItemsJsonId");
  let items = [];
  await fetch(`https://jsonblob.com/api/jsonBlob/${blobId}`, {
    method: "GET",
  })
    .then((res) => res.json())
    .then((data) =>
      data.items.forEach((item) => {
        createNewItem(
          item.name,
          item.desc,
          item.img,
          item.price,
          item.id,
          true
        );
      })
    );
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
  addProductPrice.addEventListener("keyup", (e) => {
    console.log(e.target.oldValue)
    if (!/^\d+$/.test(e.target.value)) {
      addProductPrice.value ="";
      addProductPrice.classList.add("warning")  
      return;
    }else{
      addProductPrice.classList.remove("warning")
    }
  });

  addBtn.addEventListener("click", addNewItem);
  document.addEventListener("click", (e) => {
    let cartProducts = document.querySelectorAll(".shopping-cart-product");
    [...cartProducts].forEach((product) => {
      if (product.classList.contains("warning")) {
        product.classList.remove("warning");
      }
      if (addProductName.classList.contains("warning")) {
        addProductName.classList.remove("warning");
      }
      if (addProductImg.classList.contains("warning")) {
        addProductImg.classList.remove("warning");
      }
      if (addProductDesc.classList.contains("warning")) {
        addProductDesc.classList.remove("warning");
      }
      if (addProductPrice.classList.contains("warning")) {
        addProductPrice.classList.remove("warning");
      }
    });
  });
  purchaseBtn.addEventListener("click", (e) => {
    let purchaseModal = document.createElement("div");
    purchaseModal.innerHTML =
      "<h2>Purchase has been successful!</h2><button id='okay'>Okay.</button>";
    purchaseModal.lastElementChild.addEventListener("click", (e) => {
      modalContainer.classList.remove("active");
      JSON.parse(localStorage.getItem("cartItems")).forEach((cartItem) =>
        deleteCartItem(cartItem.id)
      );
      totalAmountElement.textContent = "$0";
      let cartItems = [];
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    });
    purchaseModal.classList.add("purchase");
    modal.appendChild(purchaseModal);
    modalContainer.classList.add("active");
  });
})();

function createNewItem(name, desc, img, price, id, loaded) {
  if (!loaded) {
    id = Math.random().toString(16).slice(2);
  }
  let newProductDiv = document.createElement("div");
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

  buyBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    let cartItems = JSON.parse(localStorage.getItem("cartItems"));
    if (cartItems.length > 0) {
      let item = cartItems.find((item) => item.id === id);
      if (typeof item !== "undefined") {
        let doubleCartItem = findCartItem(id);
        doubleCartItem.classList.add("warning");
        return;
      }
    }
    createCartItem(id, name, price, img, false);
    increaseTotal(price);
  });

  listProducts.appendChild(newProductDiv);
  if (!loaded) {
    let newItem = {};
    newItem.id = id;
    newItem.name = name;
    newItem.desc = desc;
    newItem.img = img;
    newItem.price = price;

    addNewItemToJson(newItem);
  }
}

function addNewItem(e) {
  e.preventDefault();
  e.stopPropagation();
  let name = addProductName.value;
  if (name === "") {
    addProductName.classList.add("warning");
    return;
  }
  let desc = addProductDesc.value;
  if (desc === "") {
    addProductDesc.classList.add("warning");
    return;
  }
  let img = addProductImg.value;
  if (img === "") {
    addProductImg.classList.add("warning");
    return;
  }
  let price = addProductPrice.value;

  if (price <= 0) {
    addProductPrice.classList.add("warning");
    return;
  }
  createNewItem(name, desc, img, price, false);
}

function createCartItem(id, name, price, img, loaded) {
  let newCartItem = document.createElement("div");
  let cart = JSON.parse(localStorage.getItem("cartItems"));
  let cartItem = {};
  if (!loaded) {
    cartItem.id = id;
    cartItem.name = name;
    cartItem.price = price;
    cartItem.img = img;
    cartItem.noOf = 1;
    cart.push(cartItem);
    localStorage.setItem("cartItems", JSON.stringify(cart));
  }

  let createdItem = cart.find((item) => item.id === id);

  newCartItem.classList.add("shopping-cart-product");
  newCartItem.setAttribute("data-id", id);
  newCartItem.innerHTML = `
          <div class="product-info">
            <div>
              <h3>${name}</h3>
              <p>$${price} &times; ${createdItem.noOf}</p>
            </div>
            <img
            src="${img}"
            />
        </div>
          <div class="product-count"> 
            <span>${createdItem.noOf}</span>
        </div>
        `;
        let amountOfProducts = newCartItem.firstElementChild.firstElementChild.lastElementChild;
        console.log(amountOfProducts)
  let noOfProducts = newCartItem.lastElementChild.children[0];
  let minusBtn = document.createElement("button");
  minusBtn.textContent = "-";
  minusBtn.addEventListener("click", (e) => {
    if (noOfProducts.textContent <= 1) {
      deleteCartItem(id);
      increaseTotal(-price);
      return;
    }
    createdItem.noOf--;
    localStorage.setItem("cartItems", JSON.stringify(cart));
    amountOfProducts.innerHTML = `$${price} × ${parseInt(noOfProducts.textContent - 1)}`
    noOfProducts.textContent = parseInt(noOfProducts.textContent - 1);
    increaseTotal(-price);
  });
  let plusBtn = document.createElement("button");
  plusBtn.textContent = "+";
  plusBtn.addEventListener("click", (e) => {
    createdItem.noOf++;
    localStorage.setItem("cartItems", JSON.stringify(cart));
    let newNo = parseInt(noOfProducts.textContent) + 1;
    amountOfProducts.innerHTML = `$${price} × ${newNo}`

    noOfProducts.textContent = newNo;
    increaseTotal(price);
  });

  newCartItem.lastElementChild.insertBefore(minusBtn, noOfProducts);
  newCartItem.lastElementChild.appendChild(plusBtn);
  shoppingCart.appendChild(newCartItem);
}

function deleteCartItem(id) {
  let cartItems = JSON.parse(localStorage.getItem("cartItems"));
  let cartItemToDelete = findCartItem(id);
  let cartItemIndex = cartItems.indexOf(
    cartItems.find((item) => item.id === id)
  );
  cartItems.splice(cartItemIndex, 1);

  localStorage.setItem("cartItems", JSON.stringify(cartItems));
  shoppingCart.removeChild(cartItemToDelete);
}

function increaseTotal(amount) {
  amount = parseInt(amount);
  let totalAmountElement = document.getElementById("totalAmount");
  let totalAmountCurrent = parseInt(
    totalAmountElement.textContent.substring(
      1,
      totalAmountElement.textContent.length
    )
  );
  totalAmountCurrent += amount;
  totalAmountElement.innerHTML = `$${totalAmountCurrent}`;
}

function findCartItem(id) {
  return $(`.shopping-cart-product[data-id="${id}"]`);
}

function findProduct(id) {
  return $(`.product[data-id="${id}"]`);
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
  let buyBtn = modalRight.lastElementChild.firstElementChild;
  let hideModalBtn = modalRight.firstElementChild;

  buyBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    createCartItem(id, name, price, img, false);
  });
  hideModalBtn.addEventListener("click", (e) => {
    modalContainer.classList.remove("active");
  });
  modal.appendChild(modalRight);
  modalContainer.classList.add("active");
}

async function getItemById(id) {
  let blobId = localStorage.getItem("allItemsJsonId");
  let item = {};
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
