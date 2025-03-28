// this file handles building, clearing, and scrolling the carousel

// this function makes one cat card
export function createCarouselItem(imgSrc, imgAlt, imgId) {
    const template = document.querySelector("#carouselItemTemplate");
    const clone = template.content.firstElementChild.cloneNode(true);
  
    const img = clone.querySelector("img");
    img.src = imgSrc;
    img.alt = imgAlt;
  
    const favBtn = clone.querySelector(".favorite-button");
    favBtn.setAttribute("data-img-id", imgId);
    favBtn.addEventListener("click", () => {
        favBtn.classList.add("clicked");
        setTimeout(() => favBtn.classList.remove("clicked"), 300);
        favorite(imgId);
      });
      
      if (typeof window.favorite === "function") {
        window.favorite(imgId); // global favorite function from index.js
      } else {
        console.error("Favorite function not available");
      }
    };
  
    return clone;

  
  // clear all carousel items
  export function clear() {
    const carousel = document.getElementById("carouselInner");
    while (carousel.firstChild) {
      carousel.removeChild(carousel.firstChild);
    }
  }
  
  // add one cat card to the carousel
  export function appendCarousel(element) {
    const carousel = document.getElementById("carouselInner");
    const activeItem = document.querySelector(".carousel-item.active");
    if (!activeItem) element.classList.add("active");
    carousel.appendChild(element);
  }
  
  // scrolls left/right for desktop users
  export function start() {
    const carousel = document.getElementById("carouselExampleControls");
  
    if (window.matchMedia("(min-width: 768px)").matches) {
      const inner = document.querySelector(".carousel-inner");
      const cardWidth = document.querySelector(".carousel-item")?.offsetWidth || 300;
      let scrollPosition = 0;
  
      document.querySelector(".carousel-control-next").addEventListener("click", () => {
        scrollPosition += cardWidth;
        inner.scrollTo({ left: scrollPosition, behavior: "smooth" });
      });
  
      document.querySelector(".carousel-control-prev").addEventListener("click", () => {
        scrollPosition -= cardWidth;
        inner.scrollTo({ left: scrollPosition, behavior: "smooth" });
      });
    } else {
      carousel.classList.add("slide");
    }
  }
  