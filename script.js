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
      // console.log("Mobile menu toggled");
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
  // Handle realizari section
  const realizariSection = document.querySelector("#realizari");
  if (realizariSection) {
    const imagesSection = realizariSection.querySelector(".images");
    if (imagesSection) {
      const figures = imagesSection.querySelectorAll("figure");
      // console.log(`Found ${figures.length} carousel figures in realizari`);

      figures.forEach((figure, figureIndex) => {
        const images = Array.from(figure.querySelectorAll("img"));
        if (images.length < 3) return;

        // console.log(`Setting up realizari carousel for figure ${figureIndex}`);
        setupCarouselClasses(images);
        startCarouselRotation(images, `realizari-${figureIndex}`);
      });
    }
  }

  // Handle lista-experiente section
  const experienceSection = document.querySelector(".lista-experiente");
  if (experienceSection) {
    const imgFigures = experienceSection.querySelectorAll("figure.img");
    // console.log(
    //   `Found ${imgFigures.length} carousel figures in lista-experiente`
    // );

    imgFigures.forEach((figure, figureIndex) => {
      const images = Array.from(figure.querySelectorAll("img"));
      if (images.length < 3) return;

      // console.log(`Setting up experience carousel for figure ${figureIndex}`);
      setupCarouselClasses(images);
      startCarouselRotation(images, `experience-${figureIndex}`);
    });
  }
}

function setupCarouselClasses(images) {
  // Add carousel class to all images
  images.forEach((img) => img.classList.add("carousel-img"));

  // Set initial positions
  images[0].classList.add("showing"); // First image visible
  images[1].classList.add("next"); // Second image to the right
  images[2].classList.add("prev"); // Third image to the left
}

function startCarouselRotation(images, figureIdentifier) {
  // Increase interval - now between 6-10 seconds for each figure
  const rotationInterval = 6000 + Math.random() * 4000;

  setInterval(() => {
    rotateCarouselClasses(images);
  }, rotationInterval);

  // console.log(
  //   `Figure ${figureIdentifier} carousel started with ${rotationInterval}ms interval`
  // );
}

function rotateCarouselClasses(images) {
  // Find current positions
  const showingImg = images.find((img) => img.classList.contains("showing"));
  const nextImg = images.find((img) => img.classList.contains("next"));
  const prevImg = images.find((img) => img.classList.contains("prev"));

  // Step 1: Hide the image that will reposition
  prevImg.classList.add("repositioning");

  // Step 2: Remove position classes
  images.forEach((img) => {
    img.classList.remove("showing", "next", "prev");
  });

  // Step 3: Add new position classes
  nextImg.classList.add("showing"); // next → showing (slides to center)
  showingImg.classList.add("prev"); // showing → prev (slides left)
  prevImg.classList.add("next"); // prev → next (repositions invisibly)

  // Step 4: After repositioning, show the image again
  setTimeout(() => {
    prevImg.classList.remove("repositioning");
  }, 150);
}
