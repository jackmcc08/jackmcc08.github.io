//main javascript file for testing
'use strict'

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
