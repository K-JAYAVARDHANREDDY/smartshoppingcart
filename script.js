// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBqmzftcpZvKCVq0G4oTdaGxok1ex0wbA4",
    authDomain: "smart-shopping-trolley-54aa2.firebaseapp.com",
    projectId: "smart-shopping-trolley-54aa2",
    storageBucket: "smart-shopping-trolley-54aa2.firebasestorage.app",
    messagingSenderId: "249634474105",
    appId: "1:249634474105:web:5eed2aaaececa5e0006ca8",
    measurementId: "G-LSSLKZ6Y6X"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Function to fetch shopping cart data from Firebase
function fetchCartData() {
    db.ref("shoppingCart").on("value", (snapshot) => {
        if (snapshot.exists()) {
            let data = snapshot.val();
            updateCartTable(data);
        } else {
            console.log("No data found");
        }
    });
}

// Function to update the table with the fetched data
function updateCartTable(data) {
    let cartTable = document.getElementById("cartTable");
    cartTable.innerHTML = ""; // Clear previous data

    let totalItems = 0;
    let totalAmount = 0;

    // Color mapping for items
    const itemColors = {
        'Sugar': '#ffcdd2',
        'Milk': '#b3e5fc',
        'Lays': '#fff9c4',
        'Book': '#e0e0e0'
    };

    data.items.forEach((item) => {
        let row = document.createElement("tr");
        row.setAttribute('data-item', item.name);
        
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
    });

    // Update total items and total amount
    document.getElementById("totalItems").innerText = totalItems;
    document.getElementById("totalAmount").innerText = totalAmount.toFixed(2);
}

// Call function to start fetching data
fetchCartData();

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