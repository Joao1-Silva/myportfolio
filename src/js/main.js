document.documentElement.classList.add("js");

const introScreen = document.getElementById("introScreen");
const skipIntroButton = document.getElementById("skipIntro");
const langToggle = document.getElementById("langToggle");
const currentLangLabel = document.querySelector(".current-lang");
const nav = document.querySelector(".nav");
const navMenuToggle = document.getElementById("navMenuToggle");
const translatableElements = document.querySelectorAll("[data-en][data-es]");
const translatableLabels = document.querySelectorAll("[data-aria-en][data-aria-es]");
const translatablePlaceholders = document.querySelectorAll("[data-placeholder-en][data-placeholder-es]");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("section[id]");
const sceneSections = [...document.querySelectorAll(".section-scene")]
    .map((scene) => scene.closest("section"))
    .filter(Boolean);
const revealElements = document.querySelectorAll(".reveal");
const tiltCards = document.querySelectorAll(
    ".stat-card, .service-card, .product-card, .project-card, .capability-card, .info-card"
);
const contactTypeLinks = document.querySelectorAll("[data-contact-type]");
const projectForm = document.getElementById("projectForm");
const projectTypeSelect = document.getElementById("projectType");
const formStatus = document.getElementById("formStatus");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const safeStorage = {
    get(storage, key) {
        try {
            return storage.getItem(key);
        } catch {
            return null;
        }
    },
    set(storage, key, value) {
        try {
            storage.setItem(key, value);
        } catch {
            // The experience still works when storage is blocked.
        }
    }
};

const savedLanguage = safeStorage.get(window.localStorage, "preferred-language");
let currentLanguage = savedLanguage === "en" ? "en" : "es";
let introDismissed = false;

const updateMenuLabel = () => {
    if (!navMenuToggle) {
        return;
    }

    const isOpen = navMenuToggle.getAttribute("aria-expanded") === "true";
    const label = isOpen
        ? currentLanguage === "es" ? "Cerrar menú" : "Close menu"
        : currentLanguage === "es" ? "Abrir menú" : "Open menu";

    navMenuToggle.setAttribute("aria-label", label);
};

const setLanguage = (language) => {
    translatableElements.forEach((element) => {
        element.textContent = element.dataset[language];
    });

    translatableLabels.forEach((element) => {
        element.setAttribute("aria-label", element.dataset[`aria${language === "es" ? "Es" : "En"}`]);
    });

    translatablePlaceholders.forEach((element) => {
        element.setAttribute("placeholder", element.dataset[`placeholder${language === "es" ? "Es" : "En"}`]);
    });

    document.documentElement.lang = language;
    currentLangLabel.textContent = language.toUpperCase();
    currentLanguage = language;
    safeStorage.set(window.localStorage, "preferred-language", language);
    updateMenuLabel();
};

const dismissIntro = () => {
    if (introDismissed || !introScreen) {
        return;
    }

    introDismissed = true;
    document.body.classList.remove("intro-active");
    introScreen.classList.add("is-hidden");
    introScreen.setAttribute("aria-hidden", "true");
    window.setTimeout(() => {
        introScreen.classList.remove("is-active", "is-hidden");
    }, 540);
};

const initializeIntro = () => {
    if (!introScreen || reduceMotion) {
        introDismissed = true;
        return;
    }

    introScreen.classList.add("is-active");
    introScreen.setAttribute("aria-hidden", "false");
    document.body.classList.add("intro-active");
    window.setTimeout(dismissIntro, 2200);
};

const closeMenu = () => {
    nav?.classList.remove("is-menu-open");
    navMenuToggle?.setAttribute("aria-expanded", "false");
    updateMenuLabel();
};

const updateActiveLink = () => {
    let activeSectionId = sections[0]?.id || "";
    const viewportAnchor = window.scrollY + 180;

    sections.forEach((section) => {
        if (viewportAnchor >= section.offsetTop) {
            activeSectionId = section.id;
        }
    });

    navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${activeSectionId}`;
        link.classList.toggle("is-active", isActive);

        if (isActive) {
            link.setAttribute("aria-current", "location");
        } else {
            link.removeAttribute("aria-current");
        }
    });
};

const observeReveals = () => {
    if (reduceMotion || !("IntersectionObserver" in window)) {
        revealElements.forEach((element) => element.classList.add("is-visible"));
        return;
    }

    document.documentElement.classList.add("reveal-ready");
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -30px 0px"
        }
    );

    revealElements.forEach((element, index) => {
        element.style.transitionDelay = `${Math.min(index * 35, 175)}ms`;
        observer.observe(element);
    });
};

const observeSectionScenes = () => {
    if (!("IntersectionObserver" in window)) {
        sceneSections.forEach((section) => section.classList.add("is-in-view"));
        return;
    }

    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                entry.target.classList.toggle("is-in-view", entry.isIntersecting);
            });
        },
        {
            threshold: 0.08,
            rootMargin: "-10% 0px -12% 0px"
        }
    );

    sceneSections.forEach((section) => sectionObserver.observe(section));
};

const initializeTiltCards = () => {
    const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (reduceMotion || !supportsHover) {
        return;
    }

    tiltCards.forEach((card) => {
        let animationFrame;
        card.classList.add("tilt-card");

        card.addEventListener("pointerenter", () => {
            card.classList.add("is-tilting");
        });

        card.addEventListener("pointermove", (event) => {
            window.cancelAnimationFrame(animationFrame);
            animationFrame = window.requestAnimationFrame(() => {
                const bounds = card.getBoundingClientRect();
                const x = (event.clientX - bounds.left) / bounds.width;
                const y = (event.clientY - bounds.top) / bounds.height;
                const rotateX = (0.5 - y) * 9;
                const rotateY = (x - 0.5) * 11;

                card.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
                card.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
                card.style.setProperty("--pointer-x", `${(x * 100).toFixed(1)}%`);
                card.style.setProperty("--pointer-y", `${(y * 100).toFixed(1)}%`);
            });
        });

        card.addEventListener("pointerleave", () => {
            window.cancelAnimationFrame(animationFrame);
            card.classList.remove("is-tilting");
            card.style.setProperty("--tilt-x", "0deg");
            card.style.setProperty("--tilt-y", "0deg");
            card.style.setProperty("--pointer-x", "50%");
            card.style.setProperty("--pointer-y", "50%");
        });
    });
};

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
        const targetId = anchor.getAttribute("href");
        const target = document.querySelector(targetId);

        if (!target) {
            return;
        }

        event.preventDefault();
        closeMenu();
        target.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start"
        });
    });
});

contactTypeLinks.forEach((link) => {
    link.addEventListener("click", () => {
        if (projectTypeSelect) {
            projectTypeSelect.value = link.dataset.contactType;
        }
    });
});

langToggle?.addEventListener("click", () => {
    setLanguage(currentLanguage === "es" ? "en" : "es");
});

navMenuToggle?.addEventListener("click", () => {
    const isOpen = navMenuToggle.getAttribute("aria-expanded") === "true";
    navMenuToggle.setAttribute("aria-expanded", String(!isOpen));
    nav?.classList.toggle("is-menu-open", !isOpen);
    updateMenuLabel();
});

skipIntroButton?.addEventListener("click", dismissIntro);

window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        dismissIntro();
        closeMenu();
    }
});

window.addEventListener("scroll", updateActiveLink, { passive: true });
window.addEventListener("resize", () => {
    updateActiveLink();

    if (window.innerWidth > 1020) {
        closeMenu();
    }
});

projectForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!projectForm.reportValidity()) {
        return;
    }

    const formData = new FormData(projectForm);
    const name = String(formData.get("name")).trim();
    const email = String(formData.get("email")).trim();
    const message = String(formData.get("message")).trim();
    const selectedType = projectTypeSelect.options[projectTypeSelect.selectedIndex].text;
    const subject = currentLanguage === "es"
        ? `Nuevo proyecto: ${selectedType}`
        : `New project: ${selectedType}`;
    const body = currentLanguage === "es"
        ? `Hola Jonathan,\n\nSoy ${name} (${email}).\n\nTipo de proyecto: ${selectedType}\n\nContexto:\n${message}`
        : `Hi Jonathan,\n\nI'm ${name} (${email}).\n\nProject type: ${selectedType}\n\nContext:\n${message}`;

    formStatus.textContent = currentLanguage === "es"
        ? "Abriendo tu aplicación de correo…"
        : "Opening your email app…";
    window.location.href = `mailto:jonathansilvads@hotmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

document.getElementById("currentYear").textContent = String(new Date().getFullYear());
setLanguage(currentLanguage);
initializeIntro();
updateActiveLink();
observeReveals();
observeSectionScenes();
initializeTiltCards();
