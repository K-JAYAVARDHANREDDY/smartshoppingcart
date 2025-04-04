// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBqmzftcpZvKCVq0G4oTdaGxok1ex0wbA4",
    authDomain: "smart-shopping-trolley-54aa2.firebaseapp.com",
    projectId: "smart-shopping-trolley-54aa2",
    storageBucket: "smart-shopping-trolley-54aa2.firebasestorage.app",
    messagingSenderId: "249634474105",
    appId: "1:249634474105:web:5eed2aaaececa5e0006ca8",
    measurementId: "G-LSSLKZ6Y6X",
    databaseURL: "https://smart-shopping-trolley-54aa2-default-rtdb.firebaseio.com"
};

// Initialize Firebase if not already initialized
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log("Firebase initialized successfully");
    }
} catch (error) {
    console.error("Firebase initialization error:", error);
}

// Add message containers to forms
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM Content Loaded");
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        // Only add message containers if they don't exist
        if (!form.querySelector('.error-message')) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'error-message';
            form.insertBefore(messageDiv, form.firstChild);
        }
        if (!form.querySelector('.success-message')) {
            const successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            form.insertBefore(successDiv, form.firstChild);
        }
    });

    // Set up tab switching functionality
    setupTabSwitching();
});

// Function to handle tab switching
function setupTabSwitching() {
    const tabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    
    // Set up tab click handlers
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all forms
            if (loginForm) loginForm.style.display = 'none';
            if (registerForm) registerForm.style.display = 'none';
            if (forgotPasswordForm) forgotPasswordForm.style.display = 'none';
            
            // Show the selected form
            const tabName = this.getAttribute('data-tab');
            if (tabName === 'login' && loginForm) {
                loginForm.style.display = 'block';
            } else if (tabName === 'register' && registerForm) {
                registerForm.style.display = 'block';
            }
        });
    });
    
    // Set up forgot password link
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink && loginForm && forgotPasswordForm) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            loginForm.style.display = 'none';
            forgotPasswordForm.style.display = 'block';
        });
    }
}

// Handle Login
if (document.getElementById('loginForm')) {
    console.log("Login form found");
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        console.log("Login form submitted");
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const errorDiv = this.querySelector('.error-message');
        const successDiv = this.querySelector('.success-message');

        console.log("Login attempt for email:", email);

        // Clear previous messages
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';

        // Show loading state
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Logging in...';
        submitButton.disabled = true;

        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log("Login successful");
                successDiv.textContent = 'Login successful! Redirecting...';
                successDiv.style.display = 'block';
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 1500);
            })
            .catch((error) => {
                console.error("Login error:", error);
                console.error("Error code:", error.code);
                console.error("Error message:", error.message);
                errorDiv.textContent = getReadableErrorMessage(error.code);
                errorDiv.style.display = 'block';
                // Reset button
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            });
    });
}

// Handle Registration
if (document.getElementById('registerForm')) {
    console.log("Register form found");
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        console.log("Register form submitted");
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const errorDiv = this.querySelector('.error-message');
        const successDiv = this.querySelector('.success-message');

        console.log("Registration attempt for email:", email);

        // Clear previous messages
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';

        // Validate password
        if (password.length < 6) {
            errorDiv.textContent = 'Password must be at least 6 characters long';
            errorDiv.style.display = 'block';
            console.log("Password validation failed: too short");
            return;
        }

        if (password !== confirmPassword) {
            errorDiv.textContent = 'Passwords do not match';
            errorDiv.style.display = 'block';
            console.log("Password validation failed: passwords don't match");
            return;
        }

        // Show loading state
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Creating Account...';
        submitButton.disabled = true;

        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log("User created successfully");
                // Update user profile with name
                return userCredential.user.updateProfile({
                    displayName: name
                }).then(() => {
                    console.log("User profile updated with name");
                    // Create user cart in database
                    return firebase.database().ref(`users/${userCredential.user.uid}/cart`).set({
                        items: [],
                        totalItems: 0,
                        totalAmount: 0
                    });
                });
            })
            .then(() => {
                console.log("User cart created in database");
                successDiv.textContent = 'Registration successful! Redirecting to login...';
                successDiv.style.display = 'block';
                // Sign out the user so they can log in fresh
                return firebase.auth().signOut();
            })
            .then(() => {
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            })
            .catch((error) => {
                console.error("Registration error:", error);
                console.error("Error code:", error.code);
                console.error("Error message:", error.message);
                errorDiv.textContent = getReadableErrorMessage(error.code);
                errorDiv.style.display = 'block';
                // Reset button
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            });
    });
}

// Handle Forgot Password
if (document.getElementById('forgotPasswordForm')) {
    document.getElementById('forgotPasswordForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value;
        const errorDiv = this.querySelector('.error-message');
        const successDiv = this.querySelector('.success-message');

        // Clear previous messages
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';

        firebase.auth().sendPasswordResetEmail(email)
            .then(() => {
                successDiv.textContent = 'Password reset email sent! Check your inbox.';
                successDiv.style.display = 'block';
            })
            .catch((error) => {
                errorDiv.textContent = getReadableErrorMessage(error.code);
                errorDiv.style.display = 'block';
            });
    });
}

// Helper function to convert Firebase error codes to readable messages
function getReadableErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'This email is already registered. Please try logging in or use a different email.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/operation-not-allowed':
            return 'Email/password accounts are not enabled. Please contact support.';
        case 'auth/weak-password':
            return 'Please choose a stronger password (at least 6 characters).';
        case 'auth/user-disabled':
            return 'This account has been disabled. Please contact support.';
        case 'auth/user-not-found':
            return 'No account found with this email. Please register first.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        default:
            return 'An error occurred. Please try again.';
    }
}

// Check Authentication State
firebase.auth().onAuthStateChanged((user) => {
    const currentPage = window.location.pathname;
    if (user) {
        // User is signed in
        if (currentPage.includes('index.html') || 
            currentPage.includes('register.html') || 
            currentPage.includes('forgot-password.html')) {
            window.location.href = 'home.html';
        }
    } else {
        // No user is signed in
        if (currentPage.includes('home.html')) {
            window.location.href = 'index.html';
        }
    }
}); 
