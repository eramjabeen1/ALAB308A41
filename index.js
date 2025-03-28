// index.js – built in VS Code using Axios CDN
// no import/export used to ensure compatibility with the live server

//  get elements from the page
const breedSelect = document.getElementById("breedSelect");
const infoDump = document.getElementById("infoDump");
const getFavoritesBtn = document.getElementById("getFavoritesBtn");
const progressBar = document.getElementById("progressBar");

// setup api key & default axios settings
const API_KEY = "live_tDzprE81y2NnxyJNqVv4OiaNQLJldVoUWaqV56TpXk7MhRbgbOsiRF0mbjR6YSMy"; // replace this with your real key
axios.defaults.baseURL = "https://api.thecatapi.com/v1";
axios.defaults.headers.common["x-api-key"] = API_KEY;

// show progress bar while loading
let requestStart;

axios.interceptors.request.use((config) => {
  document.body.style.cursor = "progress";
  progressBar.style.width = "0%";
  requestStart = Date.now();
  return config;
});

axios.interceptors.response.use((response) => {
  const duration = Date.now() - requestStart;
  document.body.style.cursor = "default";
  progressBar.style.width = "100%";
  setTimeout(() => (progressBar.style.width = "0%"), 400);
  return response;
});

function updateProgress(event) {
  if (event.lengthComputable) {
    const percent = (event.loaded / event.total) * 100;
    progressBar.style.width = `${percent}%`;
  } else {
    progressBar.style.width = `100%`;
  }
}

// loading all cat breeds into the dropdown 
async function loadBreeds() {
  try {
    const res = await axios.get("/breeds", {
      onDownloadProgress: updateProgress,
    });

    res.data.forEach((breed) => {
      const option = document.createElement("option");
      option.value = breed.id;
      option.textContent = breed.name;
      breedSelect.appendChild(option);
    });
  } catch (err) {
    console.error("failed to load breeds", err);
  }
}

loadBreeds(); // runs on page load

// when user picks a breed..show pictures and info 
breedSelect.addEventListener("change", async () => {
  try {
    const breedId = breedSelect.value;

    const res = await axios.get("/images/search", {
      params: { breed_ids: breedId, limit: 5 },
      onDownloadProgress: updateProgress,
    });

    const cats = res.data;
    clearCarousel();

    cats.forEach((cat, index) => {
      const item = createCarouselItem(
        cat.url,
        cat.breeds[0]?.name || "Cat",
        cat.id
      );
      if (index === 0) item.classList.add("active");
      document.getElementById("carouselInner").appendChild(item);
    });

    const breed = cats[0]?.breeds[0];
    if (breed) {
      infoDump.innerHTML = `
        <h3>${breed.name}</h3>
        <p><strong>origin:</strong> ${breed.origin}</p>
        <p><strong>weight:</strong> ${breed.weight.imperial} lbs</p>
        <p><strong>temperament:</strong> ${breed.temperament}</p>
        <p><strong>description:</strong> ${breed.description}</p>
      `;
    } else {
      infoDump.textContent = "no breed info available.";
    }
  } catch (err) {
    console.error("failed to load cat images", err);
  }
});

// when "get favorites" button is clicked
getFavoritesBtn.addEventListener("click", async () => {
  try {
    const res = await axios.get("/favorites", {
      onDownloadProgress: updateProgress,
    });

    clearCarousel();

    res.data.forEach((fav, index) => {
      const item = createCarouselItem(
        fav.image.url,
        "favorite",
        fav.image_id
      );
      if (index === 0) item.classList.add("active");
      document.getElementById("carouselInner").appendChild(item);
    });

    infoDump.innerHTML = "<h3>your favorited cats</h3>";
  } catch (err) {
    console.error("could not load favorites", err);
  }
});

// toggles favorite..unfavorite when heart is clicked 
window.favorite = async function (imgId) {
  try {
    const res = await axios.get("/favorites");
    const existing = res.data.find((f) => f.image_id === imgId);

    if (existing) {
      await axios.delete(`/favorites/${existing.id}`);
      console.log("image unfavorited");
    } else {
      await axios.post("/favorites", { image_id: imgId });
      console.log("image favorited");
    }
  } catch (err) {
    console.error("error toggling favorite", err);
  }
};

// to clear carousel before new content 
function clearCarousel() {
  const container = document.getElementById("carouselInner");
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

// to make a carousel item (card) 
function createCarouselItem(imgSrc, imgAlt, imgId) {
  const template = document.getElementById("carouselItemTemplate");
  const clone = template.content.firstElementChild.cloneNode(true);
  const img = clone.querySelector("img");
  img.src = imgSrc;
  img.alt = imgAlt;

  const favBtn = clone.querySelector(".favorite-button");
  favBtn.setAttribute("data-img-id", imgId);

  favBtn.addEventListener("click", () => {
    favBtn.classList.add("clicked");
    setTimeout(() => favBtn.classList.remove("clicked"), 300);
    window.favorite(imgId);
  });

  return clone;
}
