/**
 * 한국교회 상담센터 - Modern JavaScript
 * 반응형 메뉴, 슬라이더, 스크롤 애니메이션 등
 */

// ==========================================
// Mobile Menu Toggle
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            mainNav.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideMenu = mainNav.contains(event.target);
            const isClickOnToggle = mobileMenuToggle.contains(event.target);

            if (!isClickInsideMenu && !isClickOnToggle && mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            }
        });

        // Close menu when clicking on a link
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mainNav.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            });
        });
    }
});

// ==========================================
// Hero Slider
// ==========================================
class HeroSlider {
    constructor() {
        this.slides = document.querySelectorAll('.hero-slide');
        this.currentSlide = 0;
        this.slideInterval = null;
        this.init();
    }

    init() {
        if (this.slides.length > 1) {
            this.startAutoSlide();
        }
    }

    showSlide(index) {
        this.slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === index) {
                slide.classList.add('active');
            }
        });
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this.showSlide(this.currentSlide);
    }

    startAutoSlide() {
        this.slideInterval = setInterval(() => {
            this.nextSlide();
        }, 5000); // 5초마다 슬라이드 변경
    }

    stopAutoSlide() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
        }
    }
}

// Initialize slider when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const slider = new HeroSlider();
});

// ==========================================
// Smooth Scroll for Anchor Links
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Skip if it's just "#"
            if (href === '#') return;

            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();

                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// ==========================================
// Scroll Animations (Fade In)
// ==========================================
class ScrollAnimations {
    constructor() {
        this.animatedElements = document.querySelectorAll('.quick-link-card, .content-card, .service-item');
        this.init();
    }

    init() {
        // Initial check
        this.checkVisibility();

        // Check on scroll
        window.addEventListener('scroll', () => {
            this.checkVisibility();
        });

        // Check on resize
        window.addEventListener('resize', () => {
            this.checkVisibility();
        });
    }

    isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;

        return (
            rect.top <= windowHeight * 0.85 &&
            rect.bottom >= 0
        );
    }

    checkVisibility() {
        this.animatedElements.forEach(element => {
            if (this.isElementInViewport(element)) {
                if (!element.classList.contains('fade-in')) {
                    element.classList.add('fade-in');
                }
            }
        });
    }
}

// Initialize scroll animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new ScrollAnimations();
});

// ==========================================
// Sticky Header on Scroll
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.header');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 100) {
            header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }

        lastScrollTop = scrollTop;
    });
});

// ==========================================
// Back to Top Button (Optional)
// ==========================================
class BackToTop {
    constructor() {
        this.button = this.createButton();
        this.init();
    }

    createButton() {
        const button = document.createElement('button');
        button.className = 'back-to-top';
        button.innerHTML = '↑';
        button.setAttribute('aria-label', '맨 위로 이동');
        button.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            background: #2c5aa0;
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 24px;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 999;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        `;
        document.body.appendChild(button);
        return button;
    }

    init() {
        // Show/hide button on scroll
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                this.button.style.opacity = '1';
                this.button.style.visibility = 'visible';
            } else {
                this.button.style.opacity = '0';
                this.button.style.visibility = 'hidden';
            }
        });

        // Scroll to top on click
        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Hover effect
        this.button.addEventListener('mouseenter', () => {
            this.button.style.transform = 'scale(1.1)';
            this.button.style.background = '#4a90e2';
        });

        this.button.addEventListener('mouseleave', () => {
            this.button.style.transform = 'scale(1)';
            this.button.style.background = '#2c5aa0';
        });
    }
}

// Initialize back to top button
document.addEventListener('DOMContentLoaded', function() {
    new BackToTop();
});

// ==========================================
// Lazy Loading for Images (if needed)
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
});

// ==========================================
// Form Validation (if forms exist)
// ==========================================
class FormValidator {
    constructor(formSelector) {
        this.form = document.querySelector(formSelector);
        if (this.form) {
            this.init();
        }
    }

    init() {
        this.form.addEventListener('submit', (e) => {
            if (!this.validateForm()) {
                e.preventDefault();
            }
        });

        // Real-time validation
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });
    }

    validateForm() {
        let isValid = true;
        const inputs = this.form.querySelectorAll('input[required], textarea[required]');

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;

        // Check if required field is empty
        if (field.hasAttribute('required') && value === '') {
            this.showError(field, '필수 입력 항목입니다.');
            isValid = false;
        }
        // Email validation
        else if (field.type === 'email' && value !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.showError(field, '올바른 이메일 주소를 입력해주세요.');
                isValid = false;
            } else {
                this.removeError(field);
            }
        }
        // Phone validation
        else if (field.type === 'tel' && value !== '') {
            const phoneRegex = /^[0-9-+()]*$/;
            if (!phoneRegex.test(value)) {
                this.showError(field, '올바른 전화번호를 입력해주세요.');
                isValid = false;
            } else {
                this.removeError(field);
            }
        }
        else {
            this.removeError(field);
        }

        return isValid;
    }

    showError(field, message) {
        this.removeError(field);

        field.style.borderColor = '#dc3545';

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = 'color: #dc3545; font-size: 0.875rem; margin-top: 5px;';
        errorDiv.textContent = message;

        field.parentNode.insertBefore(errorDiv, field.nextSibling);
    }

    removeError(field) {
        field.style.borderColor = '';

        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }
}

// ==========================================
// Performance Optimization
// ==========================================
// Debounce function for scroll and resize events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ==========================================
// Console Message (for developers)
// ==========================================
console.log('%c한국교회 상담센터', 'font-size: 20px; font-weight: bold; color: #2c5aa0;');
console.log('%c현대적인 웹사이트로 리뉴얼되었습니다.', 'font-size: 14px; color: #4a90e2;');
