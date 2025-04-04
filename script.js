// Firebase Configuration
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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

let currentUserCart = null; // To store current cart reference

// Check if user is authenticated
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        console.log("User is signed in:", user.displayName);
        // Update welcome message with user's name
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = user.displayName || user.email.split('@')[0];
        }
        // Load user's cart data
        initializeUserCart(user.uid);
        setupSignOut();
    } else {
        // No user is signed in, redirect to login
        window.location.href = 'index.html';
    }
});

// Function to initialize user's cart
function initializeUserCart(userId) {
    console.log("Initializing cart for user:", userId);
    
    // Create reference to user's cart
    const userCartRef = firebase.database().ref(`users/${userId}/cart`);
    currentUserCart = userCartRef; // Store reference for later use
    
    // Check if cart exists
    userCartRef.once("value")
        .then((snapshot) => {
            if (!snapshot.exists()) {
                // Create new cart if doesn't exist
                return userCartRef.set({
                    items: [],
                    totalItems: 0,
                    totalAmount: 0,
                    lastUpdated: firebase.database.ServerValue.TIMESTAMP
                });
            }
        })
        .then(() => {
            // Start listening to cart changes
            loadUserCart(userId);
        })
        .catch((error) => {
            console.error("Error initializing cart:", error);
            updateConnectionStatus("error", "Error initializing cart");
        });
}

// Function to load user's cart data
function loadUserCart(userId) {
    console.log("Loading cart for user:", userId);
    
    if (!currentUserCart) {
        currentUserCart = firebase.database().ref(`users/${userId}/cart`);
    }
    
    // Listen to the user's cart data
    currentUserCart.on("value", (snapshot) => {
        const data = snapshot.val();
        console.log("User cart data:", data);
        
        if (data) {
            updateCartTable(data);
            updateConnectionStatus("connected", "Cart synchronized");
        }
    }, (error) => {
        console.error("Error loading cart:", error);
        updateConnectionStatus("error", "Error loading cart data");
    });
}

function updateCartTable(data) {
    let cartTable = document.getElementById("cartTable");
    cartTable.innerHTML = ""; // Clear previous data

    let totalItems = 0;
    let totalAmount = 0;

    if (data.items && Array.isArray(data.items)) {
        data.items.forEach((item, index) => {
            if (item) {  // Check if item exists
                let row = document.createElement("tr");
                row.setAttribute('data-item', item.name);
                row.setAttribute('data-index', index);
                
                // Calculate item total
                const quantity = parseInt(item.quantity) || 0;
                const unitPrice = parseFloat(item.unitPrice) || 0;
                const itemTotal = quantity * unitPrice;
                
                totalItems += quantity;
                totalAmount += itemTotal;

                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>${quantity}</td>
                    <td>${unitPrice.toFixed(2)} INR</td>
                    <td>${quantity} × ${unitPrice.toFixed(2)} = ${itemTotal.toFixed(2)} INR</td>
                `;

                cartTable.appendChild(row);
            }
        });
    }

    // Update total items and amount
    document.getElementById("totalItems").innerText = totalItems;
    document.getElementById("totalAmount").innerText = totalAmount.toFixed(2);

    // Update the database with new totals
    if (currentUserCart) {
        currentUserCart.update({
            totalItems: totalItems,
            totalAmount: totalAmount,
            lastUpdated: firebase.database.ServerValue.TIMESTAMP
        }).catch(error => {
            console.error("Error updating cart totals:", error);
            updateConnectionStatus("error", "Error updating cart");
        });
    }
}

// Function to delete a single item
function deleteItem(index) {
    if (!currentUserCart) return;
    
    currentUserCart.child('items').once('value')
        .then((snapshot) => {
            const items = snapshot.val() || [];
            items.splice(index, 1);
            return currentUserCart.child('items').set(items);
        })
        .then(() => {
            updateConnectionStatus("connected", "Item deleted successfully");
        })
        .catch((error) => {
            console.error("Error deleting item:", error);
            updateConnectionStatus("error", "Error deleting item");
        });
}

// Function to setup sign out button
function setupSignOut() {
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', () => {
            firebase.auth().signOut().then(() => {
                window.location.href = 'index.html';
            }).catch((error) => {
                console.error('Sign Out Error:', error);
            });
        });
    }
}

// Function to update connection status
function updateConnectionStatus(status, message) {
    const statusDiv = document.getElementById("firebase-status");
    if (statusDiv) {
        if (status === "connected") {
            statusDiv.style.backgroundColor = "#d4edda";
            statusDiv.style.color = "#155724";
            statusDiv.innerHTML = "✅ " + message;
        } else if (status === "error") {
            statusDiv.style.backgroundColor = "#f8d7da";
            statusDiv.style.color = "#721c24";
            statusDiv.innerHTML = "❌ " + message;
        }
    }
}

// Function to test Firebase connection
function testFirebaseConnection() {
    console.log("Testing Firebase connection...");
    
    // Create a status indicator if it doesn't exist
    let statusIndicator = document.getElementById("firebase-status");
    if (!statusIndicator) {
        statusIndicator = document.createElement("div");
        statusIndicator.id = "firebase-status";
        statusIndicator.style.position = "fixed";
        statusIndicator.style.top = "10px";
        statusIndicator.style.right = "10px";
        statusIndicator.style.padding = "5px 10px";
        statusIndicator.style.borderRadius = "5px";
        statusIndicator.style.zIndex = "1000";
        document.body.appendChild(statusIndicator);
    }
    
    // Update status to checking
    statusIndicator.style.backgroundColor = "#fff3cd";
    statusIndicator.style.color = "#856404";
    statusIndicator.style.border = "1px solid #ffeeba";
    statusIndicator.innerHTML = "⚠️ Checking Firebase connection...";
    
    // Try to write a test value to the database
    const testRef = firebase.database().ref("connectionTest");
    testRef.set({
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        message: "Test connection"
    })
    .then(() => {
        console.log("Successfully wrote test data to Firebase");
        
        // Try to read the test data back
        return testRef.once("value");
    })
    .then((snapshot) => {
        const testData = snapshot.val();
        console.log("Successfully read test data:", testData);
        
        // Try to read the root of the database
        return firebase.database().ref("/").once("value");
    })
    .then((snapshot) => {
        const rootData = snapshot.val();
        console.log("Root data:", rootData);
        
        // If we got here, Firebase is working correctly
        console.log("Firebase connection test completed successfully");
        statusIndicator.style.backgroundColor = "#d4edda";
        statusIndicator.style.color = "#155724";
        statusIndicator.style.border = "1px solid #c3e6cb";
        statusIndicator.innerHTML = "✅ Firebase Connected";
    })
    .catch((error) => {
        console.error("Firebase test failed:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        statusIndicator.style.backgroundColor = "#f8d7da";
        statusIndicator.style.color = "#721c24";
        statusIndicator.style.border = "1px solid #f5c6cb";
        statusIndicator.innerHTML = "❌ Firebase Error: " + error.message;
    });
}

// Call the test function when the page loads
document.addEventListener("DOMContentLoaded", function() {
    // Wait a moment to ensure Firebase is initialized
    setTimeout(testFirebaseConnection, 1000);
});
