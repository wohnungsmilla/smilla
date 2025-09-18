console.log('=== LIGHTBOX SCRIPT START ===');

class Lightbox {
    constructor() {
        console.log('Lightbox constructor called');
        
        // Define all images independently of the grid
        this.imageData = [
            { src: 'images/smilla/wohnzimmer.jpg', alt: 'Wohnzimmer' },
            { src: 'images/smilla/kamin.jpg', alt: 'Kamin' },
            { src: 'images/smilla/kueche.jpg', alt: 'Küche' },
            { src: 'images/smilla/esstisch.jpg', alt: 'Esstisch' },
            { src: 'images/smilla/schlafzimmer01.jpg', alt: 'Schlafzimmer' },
            { src: 'images/smilla/bad01.jpg', alt: 'Bad' },
            { src: 'images/smilla/bad02.jpg', alt: 'Bad' },
            { src: 'images/smilla/hausflur.jpg', alt: 'Hausflur' },
            { src: 'images/smilla/terrasse.jpg', alt: 'Terrasse' },
        ];
        
        console.log('Image data loaded:', this.imageData.length, 'images');
        
        if (this.imageData.length === 0) {
            console.error('No images defined!');
            return;
        }
        
        this.lightbox = document.createElement('div');
        this.lightbox.className = 'lightbox';
        this.lightbox.innerHTML = `
            <button class="lightbox-close">&times;</button>
            <button class="lightbox-prev">&lt;</button>
            <button class="lightbox-next">&gt;</button>
            <div class="lightbox-content">
                <img src="" alt="">
            </div>
        `;
        document.body.appendChild(this.lightbox);

        this.currentIndex = 0;
        this.lightboxImg = this.lightbox.querySelector('img');
        this.setupEventListeners();
        console.log('Lightbox setup complete');
    }

    setupEventListeners() {
        console.log('Setting up event listeners');
        
        // Add click listeners to all images in the grid
        const gridImages = Array.from(document.querySelectorAll('.image-grid-item img'));
        gridImages.forEach((img, index) => {
            if (index < this.imageData.length) {
                console.log('Adding click listener to grid image', index);
                img.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Grid image clicked:', index);
                    this.open(index);
                });
            }
        });

        // Add click listeners to image grid items
        const imageItems = Array.from(document.querySelectorAll('.image-grid-item'));
        imageItems.forEach((item, index) => {
            if (index < this.imageData.length) {
                console.log('Adding click listener to image item', index);
                item.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Image item clicked:', index);
                    this.open(index);
                });
            }
        });

        // Add click listeners to mobile slider images
        const mobileSlides = Array.from(document.querySelectorAll('.mobile-images-slide'));
        mobileSlides.forEach((slide, index) => {
            if (index < this.imageData.length) {
                console.log('Adding click listener to mobile slide', index);
                slide.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Mobile slide clicked:', index);
                    this.open(index);
                });
            }
        });

        // Close lightbox
        this.lightbox.querySelector('.lightbox-close').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Close button clicked');
            this.close();
        });
        
        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) {
                e.preventDefault();
                console.log('Background clicked');
                this.close();
            }
        });

        // Navigation
        this.lightbox.querySelector('.lightbox-prev').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Prev button clicked');
            this.prev();
        });
        
        this.lightbox.querySelector('.lightbox-next').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Next button clicked');
            this.next();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.lightbox.classList.contains('active')) return;
            
            switch (e.key) {
                case 'Escape':
                    this.close();
                    break;
                case 'ArrowLeft':
                    this.prev();
                    break;
                case 'ArrowRight':
                    this.next();
                    break;
            }
        });
    }

    // Method to add images programmatically
    addImage(src, alt) {
        this.imageData.push({ src, alt });
        console.log('Added image:', src);
    }

    // Method to remove images programmatically
    removeImage(index) {
        if (index >= 0 && index < this.imageData.length) {
            this.imageData.splice(index, 1);
            console.log('Removed image at index:', index);
        }
    }

    // Method to get all images
    getImages() {
        return this.imageData;
    }

    // Method to open lightbox with specific image by src
    openBySrc(src) {
        const index = this.imageData.findIndex(img => img.src === src);
        if (index !== -1) {
            this.open(index);
        } else {
            console.error('Image not found:', src);
        }
    }

    open(index) {
        console.log('=== OPEN METHOD CALLED ===');
        console.log('Opening lightbox for index:', index);
        
        if (index < 0 || index >= this.imageData.length) {
            console.error('Invalid index:', index);
            return;
        }
        
        this.currentIndex = index;
        this.updateImage();
        this.lightbox.classList.add('active');
        
        document.body.style.overflow = 'hidden';
        
        // Force a repaint
        this.lightbox.offsetHeight;
        
        console.log('=== OPEN METHOD COMPLETE ===');
    }

    close() {
        console.log('Closing lightbox');
        this.lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.imageData.length) % this.imageData.length;
        console.log('Previous image, new index:', this.currentIndex);
        this.updateImage();
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.imageData.length;
        console.log('Next image, new index:', this.currentIndex);
        this.updateImage();
    }

    updateImage() {
        const imageData = this.imageData[this.currentIndex];
        console.log('Updating image:', imageData.src);
        this.lightboxImg.src = imageData.src;
        this.lightboxImg.alt = imageData.alt;
    }
}

// Initialize lightbox when DOM is loaded
console.log('Setting up DOMContentLoaded listener');
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing lightbox...');
    try {
        window.lightbox = new Lightbox();
    } catch (error) {
        console.error('Error initializing lightbox:', error);
    }
});

// Also try to initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    console.log('DOM still loading, waiting for DOMContentLoaded');
} else {
    console.log('DOM already loaded, initializing immediately');
    try {
        window.lightbox = new Lightbox();
    } catch (error) {
        console.error('Error initializing lightbox:', error);
    }
}

console.log('=== LIGHTBOX SCRIPT END ==='); 