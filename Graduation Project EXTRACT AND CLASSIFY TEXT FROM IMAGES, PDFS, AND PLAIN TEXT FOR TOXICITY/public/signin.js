var x = 'http://127.0.0.1:5000'

document.addEventListener("DOMContentLoaded", function() {
    const registerButton = document.querySelector(".register-button");
    const signinForm = document.querySelector(".signin-form");
    const registerForm = document.querySelector(".register-form");
    const alreadyAccountLink = document.querySelector(".already-account");
    const forgetPasswordLink = document.querySelector('.forget-password');
    const forgetPasswordContainer = document.querySelector('.forget-password-container');
    const backToSigninLink = document.querySelector('.back-to-signin');

    registerButton.addEventListener("click", function() {
        signinForm.classList.add("hidden");
        registerForm.classList.remove("hidden");
        forgetPasswordContainer.classList.add("hidden");
    });

    alreadyAccountLink.addEventListener("click", function(event) {
        event.preventDefault();
        signinForm.classList.remove("hidden");
        registerForm.classList.add("hidden");
        forgetPasswordContainer.classList.add("hidden");
    });

    forgetPasswordLink.addEventListener('click', function(event) {
        forgetPasswordContainer.classList.remove('hidden'); 
        signinForm.classList.add("hidden");
        registerForm.classList.add("hidden");
        event.preventDefault(); 
    });

    backToSigninLink.addEventListener('click', function(event) {
        event.preventDefault(); 
        forgetPasswordContainer.classList.add('hidden'); 
        signinForm.classList.remove("hidden");
        registerForm.classList.add("hidden");
    });
});
document.addEventListener("DOMContentLoaded", function() {
    const signInForm = document.getElementById("signin-form");

    // Email regular expression pattern
    const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    signInForm.addEventListener("submit", async function(event) {
        event.preventDefault(); 

        const formData = new FormData(signInForm); 
        const formDataObject = Object.fromEntries(formData); 
        
        // Check if the entered email matches the email regex pattern
        if (!emailRegex.test(formDataObject.username)) {
            alert("Please enter a valid email address.");
            return; // Stop form submission if email is invalid
        }

        console.log("Form Data:", formDataObject); 

        try {
            
            const response = await fetch(`http://127.0.0.1:5000/signin?email=${encodeURIComponent(formDataObject.username)}&password=${encodeURIComponent(formDataObject.password)}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json(); 
            console.log("Response Data:", data); 

            if (data.message === "Admin sign-in successful") {
                window.location.href = "admin.html";
            } else if (data.message === "User sign-in successful") {
                alert("login succeful"); 

                window.location.href = "index.html";
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please check ur login info."); 
        }
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const registerForm = document.getElementById("register-form");

    registerForm.addEventListener("submit", async function(event) {
        event.preventDefault(); 
        const formData = new FormData(registerForm); 
        const formDataObject = {
            full_name: formData.get('full-name'), 
            email: formData.get('register-email'), 
            password: formData.get('register-password')  
        };

        const emailPattern = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailPattern.test(formDataObject.email)) {
            alert("Please enter a valid email address.");
            return;
        }

        console.log("Form Data:", formDataObject); 

        try {
            
            const response = await fetch(`  http://127.0.0.1:5000/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formDataObject) 
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json(); 
            console.log("Response Data:", data); 
            alert(data.message); 
            window.location.href = "index.html";

        } catch (error) {
            console.error("Error:", error);
            alert("this Email is Already Registered"); 
        }
    });
});


document.addEventListener("DOMContentLoaded", function() {
    const forgetPasswordForm = document.getElementById("forget-password-form");

    // Email regular expression pattern
    const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    forgetPasswordForm.addEventListener("submit", async function(event) {
        event.preventDefault(); 

        const emailInput = document.getElementById("email");
        const email = emailInput.value;

        // Check if the entered email matches the email regex pattern
        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address.");
            return; // Stop form submission if email is invalid
        }

        try {
            const response = await fetch("http://127.0.0.1:5000/forget-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: email }) 
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json(); 
            console.log("Response Data:", data); 
            alert(data.message); 
        } catch (error) {
            console.error("Error:", error);
            alert("this E-mail is not Found"); 
        }
    });
});
