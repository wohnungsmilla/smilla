// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    // Toggle mobile menu
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // Close mobile menu on window resize if screen becomes larger
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });


    // Footer mobile menu functionality
    const footerHamburger = document.querySelector('.footer-hamburger');
    const footerMenu = document.querySelector('.footer-menu');
    const footerLinks = document.querySelectorAll('.footer-menu a');

    // Toggle footer mobile menu
    if (footerHamburger) {
        footerHamburger.addEventListener('click', function() {
            footerHamburger.classList.toggle('active');
            footerMenu.classList.toggle('active');
        });
    }

    // Close footer mobile menu when clicking on a link
    footerLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (footerHamburger) {
                footerHamburger.classList.remove('active');
            }
            footerMenu.classList.remove('active');
        });
    });

    // Close footer mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (footerHamburger && footerMenu) {
            if (!footerHamburger.contains(event.target) && !footerMenu.contains(event.target)) {
                footerHamburger.classList.remove('active');
                footerMenu.classList.remove('active');
            }
        }
    });

    // Close footer mobile menu on window resize if screen becomes larger
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            if (footerHamburger) {
                footerHamburger.classList.remove('active');
            }
            if (footerMenu) {
                footerMenu.classList.remove('active');
            }
        }
    });

    // Text background swipe for mobile
    function enableTextBackgroundSwipe() {
        const slider = document.querySelector('.mobile-images-slider');
        if (!slider) return;
        const slides = slider.querySelectorAll('.mobile-images-slide');
        if (slides.length < 2) return;
        let current = 0;
        let startX = null;
        let startY = null;
        let isTouch = false;
        let isScrolling = false;

        function showSlide(idx) {
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === idx);
            });
            
            // Update indicators
            const indicators = document.querySelectorAll('.swipe-indicators .indicator');
            indicators.forEach((indicator, i) => {
                indicator.classList.toggle('active', i === idx);
            });
            
            // Hide/show text content based on slide
            const textContent = document.querySelector('.mobile-images-content');
            if (textContent) {
                if (idx === 0) {
                    // First slide - show text
                    textContent.style.display = 'block';
                    textContent.style.opacity = '1';
                    textContent.style.visibility = 'visible';
                } else {
                    // All other slides - hide text
                    textContent.style.display = 'none';
                    textContent.style.opacity = '0';
                    textContent.style.visibility = 'hidden';
                }
            }
        }

        function onTouchStart(e) {
            if (window.innerWidth > 768) return;
            isTouch = true;
            startX = e.touches ? e.touches[0].clientX : e.clientX;
            startY = e.touches ? e.touches[0].clientY : e.clientY;
            isScrolling = false;
        }
        function onTouchMove(e) {
            if (!isTouch || startX === null || startY === null) return;
            const moveX = e.touches ? e.touches[0].clientX : e.clientX;
            const moveY = e.touches ? e.touches[0].clientY : e.clientY;
            const diffX = Math.abs(moveX - startX);
            const diffY = Math.abs(moveY - startY);
            // Only prevent default if horizontal swipe is dominant
            if (diffX > 10 && diffX > diffY) {
            e.preventDefault();
                isScrolling = false;
            } else {
                isScrolling = true;
            }
        }
        function onTouchEnd(e) {
            if (!isTouch || startX === null || startY === null) return;
            let endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
            let endY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
            let diffX = endX - startX;
            let diffY = endY - startY;
            if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX < 0) {
                    // swipe left
                    current = (current + 1) % slides.length;
                } else {
                    // swipe right
                    current = (current - 1 + slides.length) % slides.length;
                }
                showSlide(current);
            }
            isTouch = false;
            startX = null;
            startY = null;
            isScrolling = false;
        }

        slider.addEventListener('touchstart', onTouchStart);
        slider.addEventListener('touchmove', onTouchMove, { passive: false });
        slider.addEventListener('touchend', onTouchEnd);
        slider.addEventListener('mousedown', onTouchStart);
        slider.addEventListener('mouseup', onTouchEnd);

        // Add click handlers for indicators
        const indicators = document.querySelectorAll('.swipe-indicators .indicator');
        indicators.forEach((indicator, i) => {
            indicator.addEventListener('click', function() {
                current = i;
                showSlide(current);
            });
        });

        // Reset to first slide on resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                showSlide(0);
            }
        });
    }

    enableTextBackgroundSwipe();
    
    // Mobile booking form direct submission (removed for Formspree integration)
}); 