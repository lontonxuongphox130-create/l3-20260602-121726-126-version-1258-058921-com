(function () {
  const toggle = document.querySelector(".mobile-toggle");
  const nav = document.querySelector("[data-mobile-nav]");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      const opened = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(opened));
    });
  }

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  const input = document.querySelector("[data-search-input]");
  const cards = Array.from(document.querySelectorAll("[data-card]"));

  function applySearch(value) {
    const keyword = value.trim().toLowerCase();
    cards.forEach(function (card) {
      const haystack = (card.getAttribute("data-search") || "").toLowerCase();
      const year = card.getAttribute("data-year") || "";
      const type = (card.getAttribute("data-type") || "").toLowerCase();
      const matched = !keyword || haystack.includes(keyword) || year.includes(keyword) || type.includes(keyword);
      card.classList.toggle("is-hidden", !matched);
    });
  }

  if (input && cards.length) {
    input.addEventListener("input", function () {
      applySearch(input.value);
    });
  }

  document.querySelectorAll("[data-filter-value]").forEach(function (button) {
    button.addEventListener("click", function () {
      const value = button.getAttribute("data-filter-value") || "";
      if (input) {
        input.value = value;
      }
      applySearch(value);
    });
  });
})();
