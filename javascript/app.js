//main javascript file for testing
'use strict'
//STICKY HEADER
// When the user scrolls the page, execute myFunction
window.onscroll = function() {stickyHeader()};

// Get the header
var header = document.getElementById("the-header");

// Get the offset position of the navbar
var sticky = header.offsetTop;

// Add the sticky class to the header when you reach its scroll position. Remove "sticky" when you leave the scroll position
function stickyHeader() {
  if (window.pageYOffset > sticky) {
    header.classList.add("sticky");
  } else {
    header.classList.remove("sticky");
  }
}

//DARK MODE BUTTON
const switcher = document.querySelector('.switch_1');

switcher.addEventListener('click', function() {
    document.body.classList.toggle('dark-theme')

    var className = document.body.className;
    //not sure why the below is necessary - needs to investigate
    if(className == "light-theme") {
        this.textContent = "Dark";
    }
    else {
        this.textContent = "Light";
    }

    console.log('current class name: ' + className);

});

//HOME BUTTON on footer - script to make go home
function homeButton() {
    location.href = "../index.html";
};

//HOME BUTTON function for home page as has correct address
function homeButtonAlt() {
    location.href = "index.html";
};

//TOP OF PAGE BUTTON on footer - script to make go to top of page
function topButton() {
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    document.body.scrollTop = 0; // For Safari
};
