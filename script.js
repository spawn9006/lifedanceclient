// ===================================
// DANCE SCHOOL WEBSITE - MINIMAL SCRIPT
// Mobile Navigation Toggle Only
// ===================================

document.addEventListener("DOMContentLoaded", function () {
  console.log("🎭 Dance School Website Ready");

  // Mobile menu toggle
  const menuToggle = document.querySelector(".nav__toggle");

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      // Toggle active state on the button
      menuToggle.classList.toggle("nav__toggle--active");

      // You can add mobile menu functionality here later
      console.log("Mobile menu toggled");
    });
  }

  // Navigation scroll effect
  const nav = document.querySelector(".nav");
  let lastScrollY = window.scrollY;

  function handleNavScroll() {
    const currentScrollY = window.scrollY;

    // Add class when scrolled down more than 50px
    if (currentScrollY > 50) {
      nav.classList.add("nav--scrolled");
    } else {
      nav.classList.remove("nav--scrolled");
    }

    lastScrollY = currentScrollY;
  }

  // Add scroll event listener with throttling for performance
  let scrollTimeout;
  window.addEventListener("scroll", function () {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(handleNavScroll, 10);
  });

  // Call once on load to set initial state
  handleNavScroll();

  // Initialize image carousels
  initImageCarousels();
});

function initImageCarousels() {
  const realizariSection = document.querySelector("#realizari");
  if (!realizariSection) return;

  const imagesSection = realizariSection.querySelector(".images");
  if (!imagesSection) return;

  const figures = imagesSection.querySelectorAll("figure");
  console.log(`Found ${figures.length} carousel figures`);

  figures.forEach((figure, figureIndex) => {
    const images = Array.from(figure.querySelectorAll("img"));
    if (images.length < 3) return; // Skip if not 3 images

    console.log(`Setting up carousel for figure ${figureIndex}`);

    // Setup initial classes
    setupCarouselClasses(images);

    // Start carousel rotation
    startCarouselRotation(images, figureIndex);
  });
}

function setupCarouselClasses(images) {
  // Add carousel class to all images
  images.forEach((img) => img.classList.add("carousel-img"));

  // Set initial positions
  images[0].classList.add("showing"); // First image visible
  images[1].classList.add("next"); // Second image to the right
  images[2].classList.add("prev"); // Third image to the left
}

function startCarouselRotation(images, figureIndex) {
  // Random interval between 3-5 seconds for each figure
  const rotationInterval = 3000 + Math.random() * 2000;

  setInterval(() => {
    rotateCarouselClasses(images);
  }, rotationInterval);

  console.log(
    `Figure ${figureIndex} carousel started with ${rotationInterval}ms interval`
  );
}

function rotateCarouselClasses(images) {
  // Find current positions
  const showingImg = images.find((img) => img.classList.contains("showing"));
  const nextImg = images.find((img) => img.classList.contains("next"));
  const prevImg = images.find((img) => img.classList.contains("prev"));

  // Remove all position classes
  images.forEach((img) => {
    img.classList.remove("showing", "next", "prev");
  });

  // Rotate classes clockwise
  showingImg.classList.add("prev"); // showing → prev (slides left)
  nextImg.classList.add("showing"); // next → showing (slides to center)
  prevImg.classList.add("next"); // prev → next (slides to right)
}
