/**
 * Initialize everything when the page loads
 */
document.addEventListener('DOMContentLoaded', () => {
    projectsListingInit();
    setupScrollAnimations();
    
    // Set up event listeners for project navigation
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');
    const dots = document.querySelectorAll('.dot');
    
    prevButton.addEventListener('click', () => {
        plusProject(-1);
    });
    
    nextButton.addEventListener('click', () => {
        plusProject(1);
    });
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentProject(index + 1);
        });
    });
});


/**
 * Current project index
 */
let projectIndex;

/**
 * Navigate to the next or previous project
 * @param {number} n - Direction and amount to navigate (-1 or 1)
 */
function plusProject(n) {
    showProjects(projectIndex += n);
}

/**
 * Navigate to a specific project
 * @param {number} n - Project index to display
 */
function currentProject(n) {
    showProjects(projectIndex = n);
}

/**
 * Initialize the projects listing functionality
 */
function projectsListingInit() {
    projectIndex = 1;
    showProjects(projectIndex);
    
    // Add hover effects for project cards
    const projects = document.getElementsByClassName("project");
    for(let i = 0; i < projects.length; i++) {
        projects[i].addEventListener('mouseleave', function() {
            this.style.boxShadow = 'none';
        });
    }
}

/**
 * Display the selected project and update navigation
 * @param {number} n - Index of the project to show
 */
function showProjects(n) {
    let i;
    let projects = document.getElementsByClassName("project");
    let dots = document.getElementsByClassName("dot");
    
    // Handle index boundaries
    if(n > projects.length) {
        projectIndex = 1;
    }
    if(n < 1) {
        projectIndex = projects.length;
    }
    
    // Hide all projects
    for(i = 0; i < projects.length; i++) {
        projects[i].style.display = "none";
    }
    
    // Reset all navigation dots
    for(i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    
    // Show the selected project and activate its dot
    projects[projectIndex-1].style.display = "block";
    dots[projectIndex-1].className += " active";
}