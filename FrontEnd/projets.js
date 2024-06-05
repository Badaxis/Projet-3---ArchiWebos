const projets = await fetch("http://localhost:5678/api/works").then(proj => proj.json());

const token = window.sessionStorage.getItem("token");

const categories = ["Tous"];

// Création de la gallerie
const gallery = document.querySelector(".gallery");
const genererGallerie = (projets) => {
  gallery.innerHTML = "";
  for (let projet of projets) {
    const figureElement = document.createElement("figure");
    const imgElement = document.createElement("img");
    imgElement.src = projet.imageUrl;
    imgElement.alt = projet.title;
    const figcaptionElement = document.createElement("figcaption");
    figcaptionElement.innerText = projet.title;

    if (projet.category) {
      const categorie = projet.category.name;
      categories.push(categorie);
    }

    gallery.appendChild(figureElement);
    figureElement.appendChild(imgElement);
    figureElement.appendChild(figcaptionElement);
  }
};
genererGallerie(projets);

// Création du menu de filtres
const setCategories = new Set(categories);
const filtres = document.querySelector(".filtres");
for (let categorie of setCategories) {
  const buttonElement = document.createElement("button");
  buttonElement.textContent = categorie;
  buttonElement.className = categorie === "Tous" ? "btn-filter-active" : "btn-filter-inactive";

  buttonElement.addEventListener("click", () => {
    const projetsFiltres = categorie !== "Tous"
      ? projets.filter(projet => projet.category.name === categorie)
      : projets;

    if (buttonElement.className === "btn-filter-inactive") {
      document.querySelector(".btn-filter-active").className = "btn-filter-inactive";
      buttonElement.className = "btn-filter-active";
    }
    genererGallerie(projetsFiltres);
  });
  filtres.appendChild(buttonElement);
}

// Fonctionnalités de la modale
const modal = document.querySelector("dialog");

const validerBtn = document.querySelector("#valider-btn");
const filePicker = document.querySelector("#add-btn");
const selectCategorie = document.querySelector("#form-categorie");
const newProjTitle = document.querySelector("#form-titre");
const validerRequired = [filePicker, selectCategorie, newProjTitle];
const checkRequired = () => {
  let allFilled = true;
  validerRequired.forEach((input) => {
    if (!input.value.trim() || input.value == 0) {
      allFilled = false;
    }
  });
  validerBtn.disabled = !allFilled;
};

const photoSelect = document.querySelector(".photo-select");
const preview = document.querySelector(".photo-preview");
filePicker.addEventListener("change", () => {
  const file = filePicker.files[0];
  const photo = document.createElement("img");
  photo.src = URL.createObjectURL(file);
  preview.appendChild(photo);
  preview.setAttribute("class", "photo-preview");
  photoSelect.setAttribute("class", "hidden");
  checkRequired();
});
newProjTitle.addEventListener("input", () => checkRequired());
selectCategorie.addEventListener("input", () => checkRequired());

const modalSwitch = () => {
  const deleteSection = document.querySelector(".modal-delete");
  deleteSection.classList.toggle("hidden");
  const addSection = document.querySelector(".modal-add");
  addSection.classList.toggle("hidden");
  const returnBtn = document.querySelector(".return-btn");
  returnBtn.classList.toggle("hidden");
};

const closeModal = () => {
  modal.close();
  if (preview.hasChildNodes()) {
    preview.removeChild(preview.firstChild);
  }
  preview.setAttribute("class", "hidden");
  photoSelect.setAttribute("class", "photo-select");
  validerRequired.forEach((input) => input.value = "");
  validerBtn.disabled = true;
  if (document.querySelector(".modal-delete").classList.contains("hidden")) {
    modalSwitch();
  }
};
closeModal();

const modalForm = document.querySelector("#modal-form");
modalForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(modalForm);
  const reponse = await fetch("http://localhost:5678/api/works", {
    method: "POST",
    headers: { "Authorization": `bearer ${token}` },
    body: formData
  });
  if (reponse.ok) {
    closeModal();
    const result = await reponse.json();
    projets.push(result);
    genererGallerie(projets);
  } else {
    console.error(reponse.status);
  }
});

modal.addEventListener("click", (event) => {
  const rect = modal.getBoundingClientRect();
  if ((event.clientX < rect.left || event.clientX > rect.right
    || event.clientY < rect.top || event.clientY > rect.bottom)
    && event.target === modal
  ) { closeModal(); }
});

const closeBtn = document.querySelector(".close-btn");
closeBtn.addEventListener("click", () => closeModal());
const returnBtn = document.querySelector(".return-btn");
returnBtn.addEventListener("click", () => modalSwitch());
const ajoutBtn = document.querySelector("#ajout-btn");
ajoutBtn.addEventListener("click", () => modalSwitch());

const modalCategories = [...setCategories];
modalCategories[0] = "";
for (let modalCategorie in modalCategories) {
  const optElement = document.createElement("option");
  optElement.value = modalCategorie;
  optElement.text = modalCategories[modalCategorie];
  selectCategorie.appendChild(optElement);
}

const generateModalGallery = () => {
  const modalGallery = document.querySelector(".modal-gallery");
  modalGallery.innerHTML = "";
  for (let projet of projets) {
    const figureElement = document.createElement("figure");
    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = `<i class="fa-solid fa-trash-can fa-xs"></i>`;
    deleteBtn.className = "delete-btn";
    const imgElement = document.createElement("img");
    imgElement.src = projet.imageUrl;
    imgElement.alt = projet.title;
    deleteBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      const imageId = projet.id;
      const reponse = await fetch(`http://localhost:5678/api/works/${imageId}`, {
        method: "DELETE",
        headers: { "Authorization": `bearer ${token}` }
      });
      if (reponse.ok) {
        const projIndex = projets.findIndex(proj => proj.id === imageId);
        projets.splice(projIndex, 1);
        genererGallerie(projets);
        generateModalGallery();
      } else {
        console.error(reponse.status);
      }
    });
    modalGallery.appendChild(figureElement);
    figureElement.appendChild(deleteBtn);
    figureElement.appendChild(imgElement);
  }
};

// Version admin après connexion
const adminPageSetup = () => {
  const banniere = document.querySelector(".banniere");
  banniere.classList.toggle("hidden");
  const header = document.querySelector("header");
  header.setAttribute("class", "header-admin");
  const loginLink = document.querySelector(".login-link");
  loginLink.setAttribute("href", "./index.html");
  loginLink.textContent = "logout";
  loginLink.addEventListener("click", () => {
    window.sessionStorage.removeItem("token");
  });
  const modifBouton = document.querySelector(".modifier-btn");
  modifBouton.classList.toggle("hidden");
  modifBouton.addEventListener("click", () => {
    generateModalGallery();
    modal.showModal();
  });
  filtres.setAttribute("class", "hidden");
};

if (token) {
  adminPageSetup();
}
