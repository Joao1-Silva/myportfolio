const introScreen = document.getElementById("introScreen");
const skipIntroButton = document.getElementById("skipIntro");
const langToggle = document.getElementById("langToggle");
const currentLangLabel = document.querySelector(".current-lang");
const translatableElements = document.querySelectorAll("[data-en][data-es]");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("section[id]");
const revealElements = document.querySelectorAll(".reveal");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let currentLanguage = localStorage.getItem("preferred-language") || "es";
let introDismissed = false;

const setLanguage = (language) => {
    translatableElements.forEach((element) => {
        element.textContent = element.dataset[language];
    });

    document.documentElement.lang = language;
    currentLangLabel.textContent = language.toUpperCase();
    currentLanguage = language;
    localStorage.setItem("preferred-language", language);
};

const dismissIntro = () => {
    if (introDismissed) {
        return;
    }

    introDismissed = true;
    document.body.classList.remove("is-loading");
    introScreen.classList.add("is-hidden");
    introScreen.setAttribute("aria-hidden", "true");
};

const scheduleIntroDismiss = () => {
    const duration = reduceMotion ? 450 : 2600;
    window.setTimeout(dismissIntro, duration);
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
        link.classList.toggle("is-active", link.getAttribute("href") === `#${activeSectionId}`);
    });
};

const observeReveals = () => {
    if (reduceMotion) {
        revealElements.forEach((element) => element.classList.add("is-visible"));
        return;
    }

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
            threshold: 0.16,
            rootMargin: "0px 0px -30px 0px"
        }
    );

    revealElements.forEach((element, index) => {
        element.style.transitionDelay = `${Math.min(index * 45, 220)}ms`;
        observer.observe(element);
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
        target.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start"
        });
    });
});

langToggle.addEventListener("click", () => {
    setLanguage(currentLanguage === "es" ? "en" : "es");
});

skipIntroButton.addEventListener("click", dismissIntro);

window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        dismissIntro();
    }
});

window.addEventListener("scroll", updateActiveLink, { passive: true });
window.addEventListener("resize", updateActiveLink);

window.addEventListener(
    "load",
    () => {
        scheduleIntroDismiss();
        updateActiveLink();
        observeReveals();
    },
    { once: true }
);

document.getElementById("currentYear").textContent = String(new Date().getFullYear());
setLanguage(currentLanguage);
updateActiveLink();
