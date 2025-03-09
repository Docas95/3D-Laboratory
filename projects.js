// Carousel functionality
document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('.carousel');
    const items = document.querySelectorAll('.carousel-item');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    
    let currentIndex = 0;
    const totalItems = items.length;
    
    // Function to update the active slide
    function updateCarousel(index) {
      // Remove active class from all items and indicators
      items.forEach(item => item.classList.remove('active'));
      indicators.forEach(ind => ind.classList.remove('active'));
      
      // Add active class to current item and indicator
      items[index].classList.add('active');
      indicators[index].classList.add('active');
      
      currentIndex = index;
    }
    
    // Next button click
    nextBtn.addEventListener('click', function() {
      let newIndex = currentIndex + 1;
      if (newIndex >= totalItems) {
        newIndex = 0;
      }
      updateCarousel(newIndex);
    });
    
    // Previous button click
    prevBtn.addEventListener('click', function() {
      let newIndex = currentIndex - 1;
      if (newIndex < 0) {
        newIndex = totalItems - 1;
      }
      updateCarousel(newIndex);
    });
    
    // Indicator clicks
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', function() {
        updateCarousel(index);
      });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') {
        prevBtn.click();
      } else if (e.key === 'ArrowRight') {
        nextBtn.click();
      }
    });
  });
  