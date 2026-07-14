(function () {
  "use strict";

  var carousels = document.querySelectorAll("[data-photo-carousel]");
  var reducedMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };

  Array.prototype.forEach.call(carousels, function (carousel) {
    var track = carousel.querySelector("[data-carousel-track]");
    var controls = carousel.querySelector("[data-carousel-controls]");
    var previous = carousel.querySelector("[data-carousel-prev]");
    var next = carousel.querySelector("[data-carousel-next]");
    var status = carousel.querySelector("[data-carousel-status]");
    var slides = track
      ? Array.prototype.slice.call(track.querySelectorAll(".photo-carousel__slide"))
      : [];

    if (!track || !slides.length) {
      return;
    }

    var currentIndex = 0;
    var animationFrame = 0;
    var settleTimer = 0;
    var resizeTimer = 0;

    function clamp(index) {
      return Math.max(0, Math.min(index, slides.length - 1));
    }

    function slideLeft(index) {
      return slides[index].offsetLeft - track.offsetLeft;
    }

    function nearestIndex() {
      var left = track.scrollLeft;
      var bestIndex = 0;
      var bestDistance = Infinity;

      slides.forEach(function (slide, index) {
        var distance = Math.abs(slide.offsetLeft - track.offsetLeft - left);

        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });

      return bestIndex;
    }

    function update(index, announce) {
      currentIndex = clamp(index);

      if (previous) {
        previous.disabled = currentIndex === 0;
      }
      if (next) {
        next.disabled = currentIndex === slides.length - 1;
      }
      if (status && announce) {
        status.textContent = String(currentIndex + 1) + " / " + String(slides.length);
      }
    }

    function moveTo(index, behavior, announce) {
      index = clamp(index);
      update(index, announce);

      try {
        track.scrollTo({ left: slideLeft(index), behavior: behavior });
      } catch (error) {
        track.scrollLeft = slideLeft(index);
      }
    }

    function requestedBehavior() {
      return reducedMotion.matches ? "auto" : "smooth";
    }

    if (slides.length > 1 && controls) {
      controls.hidden = false;
      carousel.classList.add("is-enhanced");
    }

    update(nearestIndex(), true);

    if (previous) {
      previous.addEventListener("click", function () {
        moveTo(currentIndex - 1, requestedBehavior(), true);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        moveTo(currentIndex + 1, requestedBehavior(), true);
      });
    }

    track.addEventListener(
      "scroll",
      function () {
        if (!animationFrame) {
          animationFrame = window.requestAnimationFrame(function () {
            update(nearestIndex(), false);
            animationFrame = 0;
          });
        }

        window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(function () {
          update(nearestIndex(), true);
        }, 140);
      },
      { passive: true }
    );

    track.addEventListener("keydown", function (event) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveTo(currentIndex - 1, requestedBehavior(), true);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        moveTo(currentIndex + 1, requestedBehavior(), true);
      } else if (event.key === "Home") {
        event.preventDefault();
        moveTo(0, requestedBehavior(), true);
      } else if (event.key === "End") {
        event.preventDefault();
        moveTo(slides.length - 1, requestedBehavior(), true);
      }
    });

    window.addEventListener(
      "resize",
      function () {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(function () {
          moveTo(currentIndex, "auto", false);
        }, 100);
      },
      { passive: true }
    );
  });
})();
