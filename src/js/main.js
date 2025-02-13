// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add active class to navigation links based on scroll position
const addActiveClass = () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav a');

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - 60) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
        }
    });
};

// Throttle function to limit scroll event firing
const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Add throttled scroll event listener
window.addEventListener('scroll', throttle(addActiveClass, 100));

// Intersection Observer for fade-in animations
const observerOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: "0px"
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all sections for fade-in animation
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Handle mobile navigation
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.nav');
    let lastScrollTop = 0;

    // Hide/show navigation on scroll
    window.addEventListener('scroll', throttle(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > nav.offsetHeight) {
            // Scrolling down
            nav.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            nav.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    }, 100));

    // Close navigation on link click (mobile)
    document.querySelectorAll('.nav a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                nav.style.transform = 'translateY(-100%)';
                setTimeout(() => {
                    nav.style.transform = 'translateY(0)';
                }, 1000);
            }
        });
    });
});

// Add resize handler for responsive adjustments
window.addEventListener('resize', throttle(() => {
    // Reset any mobile-specific styles when returning to desktop
    if (window.innerWidth > 768) {
        document.querySelector('.nav').style.transform = 'translateY(0)';
    }
}, 100));

// Add touch support for mobile devices
let touchstartX = 0;
let touchendX = 0;

document.addEventListener('touchstart', e => {
    touchstartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
    touchendX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const nav = document.querySelector('.nav');
    const swipeDistance = Math.abs(touchendX - touchstartX);
    
    if (swipeDistance > 50) { // Minimum swipe distance
        if (touchendX < touchstartX) {
            // Swipe left - hide nav
            nav.style.transform = 'translateY(-100%)';
        } else {
            // Swipe right - show nav
            nav.style.transform = 'translateY(0)';
        }
    }
}
