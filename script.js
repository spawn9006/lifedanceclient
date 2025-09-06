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
});
