const toggleSidebarBtn = document.querySelector(".toggle-sidebar");
const userCountElem = document.querySelector(".users-data");
const productCountElem = document.querySelector(".products-data");
const newUsersSection = document.querySelector(".latest-users");
const productsListContainer = document.querySelector(".table-component");
const modalScreen = document.querySelector(".modal-screen");
const modalContentContainer = document.querySelector(".modal");
const toast = document.querySelector(".toast");
const toastStatusText = document.querySelector(".toast-content");
const processBar = document.querySelector('.process-bar')
const themeBtn = document.querySelector('.theme-button')
const searchParams = new URLSearchParams(window.location.search);
const themeIcon = themeBtn.firstElementChild;
let is_changed;
let cmsData;

function showNewUsers() {
  newUsersSection.innerHTML = "";
  newUsersSection.insertAdjacentHTML(
    "beforeend",
    `
    <i class="ui-border top indigo"></i>
    <div class="section-header">
      <p class="section-title">جدیدترین کاربران</p>
      <a href="./dashboard/users/" class="section-link">
        بیشتر
        <i class="fa-solid fa-chevron-left"></i>
      </a>
    </div>
  `
  );

  cmsData.users.slice(0, 6).forEach((u) => {
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
      <a href="./dashboard/products/" class="section-link">
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

  productsToShow.forEach((p) => {
    productsListContainer.insertAdjacentHTML(
      "beforeend",
      `
      <div class="table-body">
        <div class="tableRow">
          <p class="product-title">${p.title}</p>
          <p class="product-price">${p.price.toLocaleString()}</p>
          <p class="product-shortName">${p.slug}</p>
          <div class="product-manage">
            <button class="edit-btn" onclick="openEditModal(${p.id})">
              <i class="fas fa-edit"></i>
            </button>
            <button class="remove-btn" onclick="removeBtnHandler(${p.id})">
              <i class="fas fa-trash-alt"></i>
            </button>
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

function showAllProducts() {
  renderProductTable(cmsData.products);
}

function cancelEditBtnHandler() {
  is_changed = false;
  closeModal();
  toastHandler("edit");
}

function cancelDeleteEditBtnHandler() {
  is_changed = false;
  closeModal();
  toastHandler("delete");
}

function closeXhandler() {
  closeModal();
}

function removeBtnHandler(productID) {
  openDeleteModal(productID);
}

function removeProduct(productID) {
  const prevLength = cmsData.products.length;
  cmsData.products = cmsData.products.filter((p) => p.id !== productID);
  is_changed = cmsData.products.length < prevLength;
  updateProductCount(cmsData.products);
  showLastProducts();
}

function submitBtnHandlerDelete(productID) {
  removeProduct(productID);
  closeModal();
  toastHandler("delete");
  saveToLocalStorage(cmsData)
}

function openDeleteModal(id) {
  modalContentContainer.innerHTML = "";
  modalContentContainer.insertAdjacentHTML(
    "beforeend",
    `
    <header class="modal-header">
      <h3>حذف محصول</h3>
      <button class="close-modal" onclick="closeXhandler()">
        <i class="fas fa-times"></i>
      </button>
    </header>
    <main class="modal-content">
      <p class="remove-text">آیا از حذف این محصول اطمینان دارید؟</p>
    </main>
    <footer class="modal-footer">
      <button class="cancel" onclick="cancelDeleteEditBtnHandler()">انصراف</button>
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
      <button class="close-modal" onclick="closeXhandler()">
        <i class="fas fa-times"></i>
      </button>
    </header>
    <main class="modal-content">
      <input type="text" class="modal-input" placeholder="عنوان محصول را وارد نمائید ..." id="product-title" />
      <input type="number" class="modal-input" placeholder="قیمت محصول را وارد نمائید ..." id="product-price" />
      <input type="text" class="modal-input" placeholder="عنوان کوتاه محصول را وارد نمائید ..." id="product-shortName" />
    </main>
    <footer class="modal-footer">
      <button class="cancel" onclick="cancelEditBtnHandler()">انصراف</button>
      <button class="submit" onclick="submitEditBtnHandler(${productID})">تائید</button>
    </footer>
  `
  );
  modalScreen.classList.remove("hidden");
}

function submitEditBtnHandler(productID) {
  const newProductTitle = document.getElementById("product-title").value;
  const newProductShortName =
    document.getElementById("product-shortName").value;
  const newProductPrice = +document.getElementById("product-price").value;
  const product = cmsData.products.find((p) => p.id === productID);
  if (product) {
    product.title = newProductTitle;
    product.slug = newProductShortName;
    product.price = newProductPrice;
    is_changed = true;
  } else {
    is_changed = false;
  }
  showLastProducts();
  closeModal();
  toastHandler("edit");
  saveToLocalStorage(cmsData)
}

function toastHandler(action) {
  // Reset & show
  toast.classList.remove('hidden');
  processBar.style.transition = 'none';
  processBar.style.width = '0%';

  // Force‑reflow so we can restart the transition
  // (this “flushes” the style changes)
  // eslint-disable-next-line no-unused-expressions
  processBar.offsetWidth;

  // Set up color & text
  if (is_changed) {
    toast.classList.remove('failed');
    toast.classList.add('success');
    toastStatusText.textContent =
      action === 'edit' ? 'با موفقیت ویرایش شد' : 'با موفقیت حذف شد';
    processBar.style.backgroundColor = '#16a34a'; // green
  } else {
    toast.classList.remove('success');
    toast.classList.add('failed');
    toastStatusText.textContent =
      action === 'edit' ? 'ویرایش انجام نشد' : 'حذف انجام نشد';
    processBar.style.backgroundColor = '#dc2626'; // red
  }

  // Kick off a 3s linear transition
  processBar.style.transition = 'width 3s linear';
  processBar.style.width = '100%';

  // Hide & reset after 3s
  setTimeout(() => {
    toast.classList.add('hidden');
    processBar.style.transition = 'none';
    processBar.style.width = '0%';
  }, 3000);
}
function changeThemeHandler(){
  getThemeFromLocalStorage()
  if(themeIcon.classList.contains('fa-sun')){
    themeIcon.classList.replace('fa-sun', 'fa-moon');
    document.documentElement.classList.add('dark')
  } else {
    themeIcon.classList.replace('fa-moon', 'fa-sun');
    document.documentElement.classList.remove('dark')
  }
  saveThemeToLocalStorage()
}

function updateUserCount(users) {
  userCountElem.textContent = users.length;
}

function updateProductCount(products) {
  productCountElem.textContent = products.length;
}

function closeModal() {
  modalScreen.classList.add("hidden");
}
function saveToLocalStorage(data){
  localStorage.setItem('CMS_DATA' , JSON.stringify(data))
}
function saveThemeToLocalStorage(){
  localStorage.setItem('theme' , JSON.stringify(themeIcon.className))
}
function getThemeFromLocalStorage(){
  const savedTheme = JSON.parse(localStorage.getItem('theme'));
  if (!savedTheme) return; // nothing stored

  themeIcon.className = savedTheme;

  if (savedTheme.includes('fa-moon')) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function getFromLocalStorage(){
  cmsData = JSON.parse(localStorage.getItem('CMS_DATA'))||{
  users: [
    {
      id: 1,
      name: "Yasin",
      userName: "yasinUserName",
      email: "yasinnik2005@gmail.com",
      password: "yasin1212",
    },
    {
      id: 2,
      name: "Sara",
      userName: "sara_dev",
      email: "sara@gmail.com",
      password: "saraPass123",
    },
    {
      id: 3,
      name: "Ali",
      userName: "aliCode",
      email: "ali@yahoo.com",
      password: "aliSecure456",
    },
    {
      id: 4,
      name: "Niloofar",
      userName: "nilo_art",
      email: "niloofar@mail.com",
      password: "nilo789",
    },
    {
      id: 5,
      name: "Omid",
      userName: "omidJS",
      email: "omid@domain.com",
      password: "ompass321",
    },
    {
      id: 6,
      name: "Zahra",
      userName: "zahra_ui",
      email: "zahra@site.com",
      password: "zahraPwd9",
    },
    {
      id: 7,
      name: "Reza",
      userName: "reza_front",
      email: "reza@webdev.ir",
      password: "re123pass",
    },
    {
      id: 8,
      name: "Parsa",
      userName: "parsaCode",
      email: "parsa@cms.com",
      password: "passParsa",
    },
    {
      id: 9,
      name: "Mina",
      userName: "mina_design",
      email: "mina@graphic.com",
      password: "min@745",
    },
    {
      id: 10,
      name: "Hossein",
      userName: "hosse_dev",
      email: "hossein@build.net",
      password: "hos!321",
    },
    {
      id: 11,
      name: "Rana",
      userName: "rana_uiux",
      email: "rana@design.io",
      password: "ranaioX",
    },
    {
      id: 12,
      name: "Hamed",
      userName: "hamedSys",
      email: "hamed@admin.com",
      password: "hamedSecure",
    },
    {
      id: 13,
      name: "Shirin",
      userName: "shirinTech",
      email: "shirin@mail.org",
      password: "techPass",
    },
    {
      id: 14,
      name: "Farhad",
      userName: "farhadJS",
      email: "farhad@devzone.ir",
      password: "farDev2025",
    },
    {
      id: 15,
      name: "Ladan",
      userName: "ladanUX",
      email: "ladan@creatives.com",
      password: "uxLadP@",
    },
  ],
  products: [
    { id: 1, title: "Car", price: 300, slug: "azera-2008" },
    { id: 2, title: "Bike", price: 120, slug: "mountain-bike" },
    { id: 3, title: "Laptop", price: 950, slug: "macbook-pro-16" },
    { id: 4, title: "Camera", price: 670, slug: "canon-eos-90d" },
    { id: 5, title: "Coffee Machine", price: 230, slug: "nespresso-touch" },
    { id: 6, title: "Smartphone", price: 800, slug: "galaxy-s25-ultra" },
    { id: 7, title: "Watch", price: 140, slug: "casio-vintage" },
    { id: 8, title: "Backpack", price: 65, slug: "northface-hiker" },
    { id: 9, title: "Headphones", price: 150, slug: "sony-wh1000xm5" },
    { id: 10, title: "Desk Lamp", price: 40, slug: "philips-led-style" },
    { id: 11, title: "Shoes", price: 90, slug: "nike-airmax" },
    { id: 12, title: "Glasses", price: 120, slug: "rayban-classic" },
    { id: 13, title: "Gaming Chair", price: 350, slug: "dxracer-elite" },
    { id: 14, title: "Keyboard", price: 85, slug: "mechanical-rgb" },
    { id: 15, title: "Book", price: 25, slug: "javascript-mastery" },
  ],
};
}
function loadContent() {
  getFromLocalStorage()
  getThemeFromLocalStorage()
  updateUserCount(cmsData.users);
  updateProductCount(cmsData.products);
  showNewUsers();
  showLastProducts();
}
themeBtn.addEventListener('click' , changeThemeHandler)
window.addEventListener("DOMContentLoaded", loadContent);
toggleSidebarBtn.addEventListener("click", () => {
  document.querySelector(".sidebar").classList.toggle("open");
});

window.addEventListener("keydown", (e) => {
  if (!modalScreen.className.includes("hidden") && e.key === "Escape") {
    closeModal();
  }
});


// window.showAllProducts = showAllProducts;
// window.showLastProducts = showLastProducts;
