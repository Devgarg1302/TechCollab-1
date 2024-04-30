

function validatePassword() {
    var passwordInput = document.getElementById('password');
    var confirmPasswordInput = document.getElementById('confirmPassword');
    var passwordError = document.getElementById('passwordError');
    var confirmpasswordError = document.getElementById('confirmpasswordError');

    // Reset error message
    passwordError.textContent = '';
    confirmpasswordError.textContent = '';

    // Check if the password is at least 8 characters long
    if (passwordInput.value.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters long.';
        return;
    }

    // Check if the password contains at least one uppercase letter
    if (!/[A-Z]/.test(passwordInput.value)) {
        passwordError.textContent = 'Password must contain at least one uppercase letter.';
        return;
    }

    // Check if the password contains at least one lowercase letter
    if (!/[a-z]/.test(passwordInput.value)) {
        passwordError.textContent = 'Password must contain at least one lowercase letter.';
        return;
    }

    // Check if the password contains at least one digit
    if (!/\d/.test(passwordInput.value)) {
        passwordError.textContent = 'Password must contain at least one digit.';
        return;
    }

    // If all checks pass, the password is valid
    //passwordError.textContent = 'Password is valid.';

     // Check if the passwords match
     if (passwordInput.value !== confirmPasswordInput.value) {
        confirmpasswordError.textContent = 'Passwords do not match.';
    }
}


// public/script.js
// const form = document.getElementById('myForm');
// const submittedDataContainer = document.getElementById('submittedData');

// form.addEventListener('submit', event => {
//     event.preventDefault();

//     // Extract form data
//     const formData = new FormData(form);
//     const data = Object.fromEntries(formData.entries());

//     // Display submitted data on the main page
//     displaySubmittedData(data);
// });

// function displaySubmittedData(data) {
//     // Create HTML to display the submitted data
//     const html = `
// <div class="accordion" id="collapseOne">
//     <div class="teaser" data-toggle="collapse" data-target="#contentOne" aria-expanded="false">
//         <div class="time">
//             <h5 id="time"></h5>
//         </div>
//         <div class="title">
//         <img src="/FINAL/bin.png" onclick=deleteSubmittedData() alt="Delete">
//             <h3>${data.name}</h3>
//             <h6 class="theme">ML</h6>
//         </div>
//     </div>
    
//     <div id="contentOne" class="collapse">
//         <div class="content">
//             ${data.mentor}: ${data.description}
//         </div>
//     </div>
    
// </div>
//     `;
//     // Update the content of the container
//     submittedDataContainer.innerHTML = html;
//     date = new Date();
//     day = date.getDate();
//     month = date.toLocaleString('default', { month: 'long' });

// document.getElementById('time').innerHTML= day +" "+month+ "-active";
// }

// function deleteSubmittedData() {
//         submittedDataContainer.innerHTML = "";
// }


