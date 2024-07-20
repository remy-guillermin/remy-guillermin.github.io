let currentIndex = { 'current-gear': 0, 'old-gear': 0 };

function moveCarousel(sectionId, direction) {
    const section = document.getElementById(sectionId);
    const gearList = section.querySelector('.gear-list');
    const items = gearList.querySelectorAll('.gear-card');
    const itemWidth = gearList.querySelectorAll('.gear-card.aux')[0].getBoundingClientRect().width;
    const totalItems = items.length;

    currentIndex[sectionId] += direction;

    if (currentIndex[sectionId] < 0) {
        currentIndex[sectionId] = totalItems - 1;
    } else if (currentIndex[sectionId] >= totalItems) {
        currentIndex[sectionId] = 0;
    }

    updateActiveGear(sectionId);

    const offset = -currentIndex[sectionId] * (itemWidth + 20);
    gearList.style.transform = `translateX(${offset}px)`;

    updateIndicators(sectionId);
}

function moveToSlide(sectionId, index) {
    const section = document.getElementById(sectionId);
    const gearList = section.querySelector('.gear-list');
    const items = gearList.querySelectorAll('.gear-card');
    const itemWidth = items[0].getBoundingClientRect().width;

    updateActiveGear(sectionId);

    currentIndex[sectionId] = index;
    const offset = -currentIndex[sectionId] * itemWidth;
    gearList.style.transform = `translateX(${offset}px)`;

    updateIndicators(sectionId);
}

function updateIndicators(sectionId) {
    const section = document.getElementById(sectionId);
    const dots = section.querySelectorAll('.carousel-indicators .dot');

    dots.forEach((dot, index) => {
        if (index === currentIndex[sectionId]) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function updateActiveGear(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const items = section.querySelectorAll('.gear-list .gear-card');
    items.forEach((item, index) => {
        item.classList.toggle('aux', index !== currentIndex[sectionId]);
    });
}

// Initialize the carousel indicators on page load
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.carousel-container').forEach(container => {
        const sectionId = container.parentElement.id;
        updateIndicators(sectionId);
        updateActiveGear(sectionId)
    });
});
