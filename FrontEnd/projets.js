const works = await fetch("http://localhost:5678/api/works");
const projets = await works.json();

const categories = ["Tous"];

// Création de la gallerie
const genererGallerie = projets => {
  for (let projet of projets) {
    const gallery = document.querySelector(".gallery");

    const figureElement = document.createElement("figure");
    const imgElement = document.createElement("img");
    imgElement.src = projet.imageUrl;
    imgElement.alt = projet.title;
    const figcaptionElement = document.createElement("figcaption");
    figcaptionElement.innerText = projet.title;

    const categorie = projet.category.name;
    categories.push(categorie);

    gallery.appendChild(figureElement);
    figureElement.appendChild(imgElement);
    figureElement.appendChild(figcaptionElement);
  }
};
genererGallerie(projets);

// Création du menu de filtres
const setCategories = new Set(categories);
for (let categorie of setCategories) {
  const filtres = document.querySelector(".filtres");

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
    document.querySelector(".gallery").innerHTML = "";
    genererGallerie(projetsFiltres);
  });

  filtres.appendChild(buttonElement);
}
