
/*section */

function openSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach((section) => {
      section.classList.remove('active');
    });
  
    // Show the clicked section
    const section = document.getElementById(sectionId);
    section.classList.add('active');
  }