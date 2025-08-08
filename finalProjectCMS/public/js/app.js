// --------- CMS Dashboard JavaScript ---------
const toggleSidebarBtn = document.querySelector(".toggle-sidebar");
const userCountElem = document.querySelector(".users-data");
const productCountElem = document.querySelector(".products-data");
const newUsersSection = document.querySelector(".latest-users");
const productsListContainer = document.querySelector(".table-component");
const modalScreen = document.querySelector(".modal-screen");
const modalContentContainer = document.querySelector(".modal");
const toast = document.querySelector(".toast");
const toastStatusText = document.querySelector(".toast-content");
const processBar = document.querySelector(".process-bar");
const themeBtn = document.querySelector(".theme-button");
const themeIcon = themeBtn.firstElementChild;
const 
let is_changed;
let cmsData;
let currentPage = 1; // tracks pagination state
let allPageCount;

// ---------- Render Functions ----------
function showNewUsers() {
  newUsersSection.innerHTML = "";
  newUsersSection.insertAdjacentHTML(
    "beforeend",
    `
    <i class="ui-border top indigo"></i>
    <div class="section-header">
      <p class="section-title">جدیدترین کاربران</p>
      <a href="./dashboard/users/index.html" class="section-link">
        بیشتر
        <i class="fa-solid fa-chevron-left"></i>
      </a>
    </div>
  `
  );

  cmsData.users.slice(0, 6).forEach(u => {
    newUsersSection.insertAdjacentHTML(
      "beforeend",
      `
      <article>
        <span class="icon-card"><i class="fa-solid fa-user"></i></span>
        <div>
          <p class="user-name">${u.userName}</p>
          <p class="user-email">${u.email}</p>
        </div>
      </article>
    `
    );
  });
}

function renderProductTable(productsToShow) {
  productsListContainer.innerHTML = "";
  productsListContainer.insertAdjacentHTML(
    "beforeend",
    `
    <i class="ui-border emerald top"></i>
    <div class="section-header">
      <div>
        <p class="title-text">لیست محصولات</p>
        <p class="products-count-text caption-text">
          <span class="products-data">${cmsData.products.length}</span>
          <span> محصول در وبسایت شما وجود دارد </span>
        </p>
      </div>
      <a href="./dashboard/products/index.html" class="section-link products">
        <span>
          محصولات
          <i class="fa-solid fa-chevron-left"></i>
        </span>
      </a>
    </div>
    <div class="table-head-row">
      <p>عنوان محصول</p>
      <p>قیمت محصول</p>
      <p>عنوان کوتاه</p>
      <p>مدیریت</p>
    </div>
  `
  );

  productsToShow.forEach(p => {
    productsListContainer.insertAdjacentHTML(
      "beforeend",
      `
      <div class="table-body">
        <div class="tableRow">
          <p class="product-title">${p.title}</p>
          <p class="product-price">${p.price.toLocaleString()}</p>
          <p class="product-shortName">${p.slug}</p>
          <div class="product-manage">
            <button class="edit-btn" onclick="openEditModal(${p.id})"><i class="fas fa-edit"></i></button>
            <button class="remove-btn" onclick="openDeleteModal(${p.id})"><i class="fas fa-trash-alt"></i></button>
          </div>
        </div>
      </div>
    `
    );
  });
}

function showLastProducts() {
  const lastSix = cmsData.products.slice(-6);
  renderProductTable(lastSix);
}

// ---------- Modal Handlers ----------
function cancelEditBtnHandler() {
  is_changed = false;
  closeModal();
  toastHandler("edit");
}

function cancelDeleteBtnHandler() {
  is_changed = false;
  closeModal();
  toastHandler("delete");
}

function closeXhandler() {
  closeModal();
}

function toastHandler(action) {
  toast.classList.remove("hidden");
  processBar.style.transition = "none";
  processBar.style.width = "0%";
  processBar.offsetWidth;

  if (is_changed) {
    toast.classList.remove("failed");
    toast.classList.add("success");
    toastStatusText.textContent = action === "edit" ? "با موفقیت ویرایش شد" : "با موفقیت حذف شد";
    processBar.style.backgroundColor = "#16a34a";
  } else {
    toast.classList.remove("success");
    toast.classList.add("failed");
    toastStatusText.textContent = action === "edit" ? "ویرایش انجام نشد" : "حذف انجام نشد";
    processBar.style.backgroundColor = "#dc2626";
  }

  processBar.style.transition = "width 3s linear";
  processBar.style.width = "100%";

  setTimeout(() => {
    toast.classList.add("hidden");
    processBar.style.transition = "none";
    processBar.style.width = "0%";
  }, 3000);
}

// ---------- Edit & Delete Logic ----------
function removeProduct(productID) {
  const prevLength = cmsData.products.length;
  cmsData.products = cmsData.products.filter(p => p.id !== productID);
  is_changed = cmsData.products.length < prevLength;
  updateProductCount(cmsData.products);
}

function submitBtnHandlerDelete(productID) {
  removeProduct(productID);

  if (location.pathname.includes('/dashboard/products/')) {
    showProductPageTableContent(currentPage);
    calAndShowPageBtns();
  } else {
    showLastProducts();
  }

  closeModal();
  toastHandler("delete");
  saveToLocalStorage(cmsData);
}

function submitEditBtnHandler(productID) {
  const newTitle = document.getElementById("product-title").value;
  const newSlug = document.getElementById("product-shortName").value;
  const newPrice = +document.getElementById("product-price").value;
  const product = cmsData.products.find(p => p.id === productID);

  if (product) {
    product.title = newTitle;
    product.slug = newSlug;
    product.price = newPrice;
    is_changed = true;
  } else {
    is_changed = false;
  }

  if (location.pathname.includes('/dashboard/products/')) {
    showProductPageTableContent(currentPage);
    calAndShowPageBtns();
  } else {
    showLastProducts();
  }

  closeModal();
  toastHandler("edit");
  saveToLocalStorage(cmsData);
}
function submitCreateProductHandler(){
  const createdTitle = document.getElementById('product-title').value
  const createdPrice = document.getElementById('product-price').value
  const createdShortName = document.getElementById('product-shortName').value
  const CreatedProduct = {title : createdTitle , price : createdPrice , slug : createdShortName}
  cmsData.products.push(CreatedProduct)
  saveToLocalStorage(cmsData)
  calAndShowPageBtns()
  showProductPageTableContent(allPageCount)
  calAndShowPageBtns()
  closeModal()
}
// ---------- Modal Openers ----------
function openDeleteModal(id) {
  modalContentContainer.innerHTML = "";
  modalContentContainer.insertAdjacentHTML(
    "beforeend",
    `
    <header class="modal-header">
      <h3>حذف محصول</h3>
      <button class="close-modal" onclick="closeXhandler()"><i class="fas fa-times"></i></button>
    </header>
    <main class="modal-content">
      <p class="remove-text">آیا از حذف این محصول اطمینان دارید؟</p>
    </main>
    <footer class="modal-footer">
      <button class="cancel" onclick="cancelDeleteBtnHandler()">انصراف</button>
      <button class="submit" onclick="submitBtnHandlerDelete(${id})">تائید</button>
    </footer>
  `
  );
  modalScreen.classList.remove("hidden");
}

function openEditModal(productID) {
  modalContentContainer.innerHTML = "";
  modalContentContainer.insertAdjacentHTML(
    "beforeend",
    `
    <header class="modal-header">
      <h3>ویرایش محصول</h3>
      <button class="close-modal" onclick="closeXhandler()"><i class="fas fa-times"></i></button>
    </header>
    <main class="modal-content">
      <input type="text" class="modal-input" id="product-title" placeholder="عنوان محصول را وارد نمائید ..." />
      <input type="number" class="modal-input" id="product-price" placeholder="قیمت محصول را وارد نمائید ..." />
      <input type="text" class="modal-input" id="product-shortName" placeholder="عنوان کوتاه محصول را وارد نمائید ..." />
    </main>
    <footer class="modal-footer">
      <button class="cancel" onclick="cancelEditBtnHandler()">انصراف</button>
      <button class="submit" onclick="submitEditBtnHandler(${productID})">تائید</button>
    </footer>
  `
  );
  modalScreen.classList.remove("hidden");
}
function openCreateProductModal(){
  modalContentContainer.innerHTML = ''
  modalContentContainer.insertAdjacentHTML('beforeend' , `
               <header class="modal-header">
            <h3>ایجاد محصول</h3>
            <button class="close-modal" onclick = "closeXhandler()">
              <i class="fas fa-times"></i>
            </button>
          </header>
          <main class="modal-content">
            <input
              type="text"
              class="modal-input"
              placeholder="عنوان محصول را وارد نمائید ..."
              id="product-title"
            />
            <input
              type="number"
              class="modal-input"
              placeholder="قیمت محصول را وارد نمائید ..."
              id="product-price"
            />
            <input
              type="text"
              class="modal-input"
              placeholder="عنوان کوتاه محصول را وارد نمائید ..."
              id="product-shortName"
            />
          </main>
          <footer class="modal-footer">
            <button class="cancel" onclick = "cancelEditBtnHandler()">انصراف</button>
            <button class="submit" onclick = "submitCreateProductHandler()">تائید</button>
          </footer>
    `)
    modalScreen.classList.remove('hidden')
}
function closeModal() {
  modalScreen.classList.add("hidden");
}

// ---------- Theme & Storage ----------
function changeThemeHandler() {
  getThemeFromLocalStorage();
  if (themeIcon.classList.contains("fa-sun")) {
    themeIcon.classList.replace("fa-sun", "fa-moon");
    document.documentElement.classList.add("dark");
  } else {
    themeIcon.classList.replace("fa-moon", "fa-sun");
    document.documentElement.classList.remove("dark");
  }
  saveThemeToLocalStorage();
}

function updateUserCount(users) {
  userCountElem.textContent = users.length;
}

function updateProductCount(products) {
  productCountElem.textContent = products.length;
}

function saveToLocalStorage(data) {
  localStorage.setItem("CMS_DATA", JSON.stringify(data))

}

function saveThemeToLocalStorage() {
  localStorage.setItem("theme", JSON.stringify(themeIcon.className));
}

function getThemeFromLocalStorage() {
  const saved = JSON.parse(localStorage.getItem("theme"));
  if (!saved) return;
  themeIcon.className = saved;
  if (saved.includes("fa-moon")) document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
}

function getFromLocalStorage() {
  cmsData = JSON.parse(localStorage.getItem("CMS_DATA")) || {  products: [
    {
      id: 1,
      title: "کتاب روانشناسی",
      slug: "psychology-book",
      price: 120000
    },
    {
      id: 2,
      title: "گوشی موبایل سامسونگ",
      slug: "samsung-phone",
      price: 7500000
    },
    {
      id: 3,
      title: "هدفون بی‌سیم",
      slug: "wireless-headphones",
      price: 850000
    },
    {
      id: 4,
      title: "کیبورد مکانیکی",
      slug: "mechanical-keyboard",
      price: 1450000
    },
    {
      id: 5,
      title: "کفش ورزشی",
      slug: "sports-shoes",
      price: 490000
    },
    {
      id: 6,
      title: "کاپشن زمستانی",
      slug: "winter-jacket",
      price: 1900000
    },
    {
      id: 7,
      title: "دوربین دیجیتال",
      slug: "digital-camera",
      price: 3200000
    },
    {
      id: 8,
      title: "مانیتور ۲۴ اینچ",
      slug: "monitor-24inch",
      price: 2900000
    },
    {
      id: 9,
      title: "لپ‌تاپ ایسوس",
      slug: "asus-laptop",
      price: 17500000
    }
  ],
  users: [
    {
      id: 1,
      userName: "محمد حسینی",
      email: "mohammad.hosseini@example.com"
    },
    {
      id: 2,
      userName: "زهرا احمدی",
      email: "zahra.ahmadi@example.com"
    },
    {
      id: 3,
      userName: "علی رضایی",
      email: "ali.rezaei@example.com"
    },
    {
      id: 4,
      userName: "سارا کریمی",
      email: "sara.karimi@example.com"
    },
    {
      id: 5,
      userName: "مجید مرادی",
      email: "majid.moradi@example.com"
    },
    {
      id: 6,
      userName: "مهدی عباسی",
      email: "mahdi.abbasi@example.com"
    },
    {
      id: 7,
      userName: "مینا غلامی",
      email: "mina.gholami@example.com"
    }
  ]
};
}

function loadContent() {
  getFromLocalStorage();
  getThemeFromLocalStorage();
  updateUserCount(cmsData.users);
  updateProductCount(cmsData.products);
  showNewUsers();
  showLastProducts();
}

// ---------- Events & Pagination ----------
window.addEventListener("DOMContentLoaded", loadContent);
toggleSidebarBtn.addEventListener("click", () => document.querySelector(".sidebar").classList.toggle("open"));
window.addEventListener("keydown", e => { if (!modalScreen.classList.contains("hidden") && e.key === "Escape") closeModal(); });
themeBtn.addEventListener("click", changeThemeHandler);

const itemsPerPage = 6;


function showProductPageTableContent(page = 1) {
  currentPage = page;
  const container = document.querySelector(".table-body");
  container.innerHTML = "";
  const start = (page - 1) * itemsPerPage;
  const batch = cmsData.products.slice(start, start + itemsPerPage);
  batch.forEach(p => container.insertAdjacentHTML("beforeend",
    `<div class="tableRow">
       <p class="product-title">${p.title}</p>
       <p class="product-price">${p.price.toLocaleString()}</p>
       <p class="product-shortName">${p.slug}</p>
       <div class="product-manage">
         <button class="edit-btn" onclick="openEditModal(${p.id})"><i class="fas fa-edit"></i></button>
         <button class="remove-btn" onclick="openDeleteModal(${p.id})"><i class="fas fa-trash-alt"></i></button>
       </div>
     </div>`));
}

function calAndShowPageBtns() {
  const container = document.querySelector(".pagination");
  container.innerHTML = "";
  const pageCount = Math.ceil(cmsData.products.length / itemsPerPage);
  for (let i = 1; i <= pageCount; i++) {
    const span = document.createElement("span");
    span.classList.add("page"); span.tabIndex = 0; span.dataset.page = i; span.textContent = i;
    if (i === currentPage) span.classList.add("active");
    span.addEventListener("click", () => {
      document.querySelectorAll(".page").forEach(el => el.classList.remove("active"));
      span.classList.add("active");
      showProductPageTableContent(i);
    });
    container.appendChild(span);
  }
  if(pageCount/itemsPerPage % itemsPerPage === 6){
    allPageCount = pageCount+1
  }
  else{
    allPageCount = pageCount
  }
}
function ProductsPage_CreateProductHandler(){
  openCreateProductModal()
}
function productPageOnloadHandler() {
  showProductPageTableContent();
  calAndShowPageBtns();
}
//------------------users page -------------------------------

function usersPageOnloadHandler(){
  
}