(function () {
  function loadComponent(targetId, path, onLoaded) {
    const mount = document.getElementById(targetId);
    if (!mount) {
      return;
    }

    fetch(path)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Failed to load component: " + path);
        }
        return response.text();
      })
      .then(function (html) {
        mount.innerHTML = html;
        if (typeof onLoaded === "function") {
          onLoaded();
        }
      })
      .catch(function () {
        mount.innerHTML = "";
      });
  }

  function getCurrentPage() {
    const path = window.location.pathname.split("/").pop();
    return path || "index.html";
  }

  function setActiveNav() {
    const currentPage = getCurrentPage();
    const currentHash = window.location.hash;
    const links = document.querySelectorAll("[data-nav-link]");

    links.forEach(function (link) {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");

      const href = link.getAttribute("href") || "";
      const baseHref = href.split("#")[0] || "index.html";
      const hashPart = href.includes("#") ? "#" + href.split("#")[1] : "";
      let isActive = false;

      if (baseHref !== currentPage) {
        isActive = false;
      } else if (!hashPart) {
        isActive = currentHash === "";
      } else {
        isActive = currentHash === hashPart;
      }

      if (isActive) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      }
    });
  }

  function initMobileNav() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      const isOpen = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initReveal() {
    const targets = document.querySelectorAll("[data-reveal]");
    if (!targets.length) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      targets.forEach(function (target) {
        target.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -10% 0px"
      }
    );

    targets.forEach(function (target, index) {
      target.style.transitionDelay = Math.min(index * 40, 220) + "ms";
      observer.observe(target);
    });
  }

  function setYear() {
    const year = String(new Date().getFullYear());
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = year;
    });
  }

  function initializeSharedUi() {
    setActiveNav();
    initMobileNav();
    setYear();
    window.addEventListener("hashchange", setActiveNav);
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadComponent("site-header", "components/header.html", initializeSharedUi);
    loadComponent("site-footer", "components/footer.html", setYear);
    initReveal();
    setYear();
  });
})();
