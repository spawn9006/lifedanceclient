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
});
