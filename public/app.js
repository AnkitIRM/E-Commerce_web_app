// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, set, get, child, push } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";


// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDXpS114DBryPqoYj4UJmblfafg4U0j2-A",
    authDomain: "smartcartggv.firebaseapp.com",
    databaseURL: "https://smartcartggv-default-rtdb.firebaseio.com",
    projectId: "smartcartggv",
    storageBucket: "smartcartggv.firebasestorage.app",
    messagingSenderId: "926425111096",
    appId: "1:926425111096:web:d5f6a278121ed18c1664cd",
    measurementId: "G-ERHVQCEGW5"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);


document.getElementById('signupBtn').addEventListener('click', signUp);
document.getElementById('signinBtn').addEventListener('click', signIn);
document.getElementById('signout').addEventListener('click', signOutUser);
document.getElementById('checkoutBtn').addEventListener('click', checkout);

document.getElementById("popup").addEventListener("click", function () {
    document.getElementById("logincontainer").style.display = "block";


    // javascript for login menu pop up
    // let signupBtn = document.getElementById("signupBtn");
    // let signinBtn = document.getElementById("signinBtn");

    // let title = document.getElementById("title");

    // signinBtn.onclick = function () {

    //     title.innerHTML = "Sign In";
    //     signupBtn.classList.add("disable");
    //     signinBtn.classList.remove("disable");
    // };

    // signupBtn.onclick = function () {

    //     title.innerHTML = "Sign Up";
    //     signupBtn.classList.remove("disable");
    //     signinBtn.classList.add("disable");
    // };
});


document.getElementById("closepop").addEventListener("click", function () {
    document.getElementById("logincontainer").style.display = "none";
});






// Sign Up
function signUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            alert("Sign Up Successful");
            document.getElementById("logincontainer").style.display = "none";
        })
        .catch(error => alert(error.message));
}

// Sign In
function signIn() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            alert("Sign In Successful");
            document.getElementById("logincontainer").style.display = "none";
            renderCart(); // Load cart after sign in
        })
        .catch(error => alert(error.message));
}

// Sign Out
function signOutUser() {
    signOut(auth).then(() => {
        document.getElementById('cart').innerHTML = "<p>Please sign in to see your cart.</p>";

        alert("Signed Out Successfully")
    });
}

function addProduct(name, price, imageUrl) {
    const db = getDatabase();
    const productsRef = ref(db, 'products');
    const newProductRef = push(productsRef); // Generates a unique key for each product

    set(newProductRef, {
        name: name,
        price: price,
        imageUrl: imageUrl
    }).then(() => {
        alert("Product added successfully!");
    }).catch((error) => {
        console.error("Error adding product:", error);
    });
}

// addProduct("Men's Casual Shirt", 25.99, "https://images.unsplash.com/photo-1600180758890-6c0e2e7e3ab7?fit=crop&w=600&h=900");



function saveCartToLocalStorage(userId) {
    localStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
}

function loadCartFromLocalStorage(userId) {
    const savedCart = localStorage.getItem(`cart_${userId}`);
    return savedCart ? JSON.parse(savedCart) : [];
}





// Cart

let cart = [];
window.addToCart = function (id, name, price, imageUrl) {
    const user = auth.currentUser;
    if (!user) {
        alert("Please sign in to add items to the cart.");
        document.getElementById("logincontainer").style.display = "block";
        return;
    }




    cart.push({ id, name, price, imageUrl });
    saveCartToLocalStorage(user.uid);
    renderCart();
}







// Load Products
function loadProducts() {
    const productsDiv = document.getElementById('products');
    const dbRef = ref(database, 'products');

    return get(dbRef).then(snapshot => {
        productsDiv.innerHTML = '';
        snapshot.forEach(childSnapshot => {
            const product = childSnapshot.val();
            const productId = childSnapshot.key;
            const productElement = document.createElement('div');
            productElement.classList.add('product');
            productElement.innerHTML = `
                <img src="${product.imageUrl}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>Price: ₹${product.price}</p>
                <button onclick="addToCart('${productId}', '${product.name}', ${product.price}, '${product.imageUrl}')">Add to Cart</button>
            `;
            productsDiv.appendChild(productElement);
        });
    }).catch(error => console.error("Error loading products:", error));
}


window.renderCart = function () {
    const user = auth.currentUser;
    const cartDiv = document.getElementById('cart');
    cartDiv.innerHTML = '';
    if (!user) {
        document.getElementById('cart').innerHTML = "<p>Please sign in to see your cart.</p>";
        return;
    }

    cart = loadCartFromLocalStorage(user.uid); // Load cart from local storage
    if (cart.length === 0) {
        cartDiv.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }



    let total = 0;
    cart.forEach((item, index) => {
        total += item.price;
        cartDiv.innerHTML += `
            <div class="cart-item">
                <img src="${item.imageUrl}" alt="${item.name}">
                <p>${item.name} - $${item.price}</p>
                <button onclick="removeFromCart(${index})">Remove</button>
            </div>
        `;
    });
    cartDiv.innerHTML += `<p><strong>Total: $${total.toFixed(2)}</strong></p>`;
}

window.removeFromCart = function (index) {

    const user = auth.currentUser;
    if (!user) return; // Don't allow removal if not signed in



    cart.splice(index, 1);
    saveCartToLocalStorage(user.uid);
    renderCart();
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    alert("Checkout successful!");
    const user = auth.currentUser;
    if (user) {
        cart = [];
        saveCartToLocalStorage(user.uid);
        renderCart();
    }

}

// Load products on page load
window.onload = function () {
    //loadProducts(); // Load products from Firebase

    loadProducts().then(() => {
        // ✅ Wait 2 seconds before applying category filter
        
            const category = getCategoryFromURL().toLowerCase();

            // Remove all active classes
            document.querySelectorAll('#select button').forEach(btn => {
                btn.classList.remove("active");
            });

            // Apply the correct filter based on category
            switch (category) {
                case "men":
                    menbtn.click();
                    break;
                case "women":
                    womenbtn.click();
                    break;
                case "kids":
                    kidbtn.click();
                    break;
                case "gadgets":
                    gadgetbtn.click();
                    break;
                default:
                    allbtn.click();
                    break;
            }
        
    });


    onAuthStateChanged(auth, (user) => {
        const userInfoDiv = document.getElementById("user-info");
        const signoutbtn = document.getElementById("signout");

        if (user) {
            userInfoDiv.textContent = `Signed in as ${user.email}`;
            signoutbtn.style.display = "block";


            renderCart(); // ✅ Load the correct cart when the user is signed in
        } else {
            userInfoDiv.textContent = ""; // Clear on sign-out
            signoutbtn.style.display = "none";
            document.getElementById('cart').innerHTML = "<p>Please sign in to see your cart.</p>";
        }
    });
    //renderCart();   // Load cart from local storage
};

// cart box pop up load
document.getElementById("cartbtn").addEventListener("click", function () {
    document.getElementById("cartcontainer").style.display = "block";

});

document.getElementById("closecart").addEventListener("click", function () {
    document.getElementById("cartcontainer").style.display = "none";

});


const allbtn = document.getElementById("allbtn");
const menbtn = document.getElementById("menbtn");
const womenbtn = document.getElementById("womenbtn");
const kidbtn = document.getElementById("kidbtn");
const gadgetbtn = document.getElementById("gadgetbtn");

allbtn.addEventListener("click", function () {
    allbtn.classList.add("active");
    menbtn.classList.remove("active");
    womenbtn.classList.remove("active");
    kidbtn.classList.remove("active");
    gadgetbtn.classList.remove("active");

    document.querySelectorAll('.product').forEach(product => {
        const heading = product.querySelector('h3');
        product.style.display = 'flex';

    });



});
menbtn.addEventListener("click", function () {
    menbtn.classList.add("active");
    allbtn.classList.remove("active");
    womenbtn.classList.remove("active");
    kidbtn.classList.remove("active");
    gadgetbtn.classList.remove("active");

    document.querySelectorAll('.product').forEach(product => {
        const heading = product.querySelector('h3');
        if (heading && heading.textContent.trim().startsWith('Men')) {
            product.style.display = 'flex';
        } else {
            product.style.display = 'none';
        }
    });


});
womenbtn.addEventListener("click", function () {
    womenbtn.classList.add("active");
    allbtn.classList.remove("active");
    menbtn.classList.remove("active");
    kidbtn.classList.remove("active");
    gadgetbtn.classList.remove("active");

    document.querySelectorAll('.product').forEach(product => {
        const heading = product.querySelector('h3');
        if (heading && heading.textContent.trim().startsWith('Women')) {
            product.style.display = 'flex';
        } else {
            product.style.display = 'none';
        }
    });


});
kidbtn.addEventListener("click", function () {
    kidbtn.classList.add("active");
    allbtn.classList.remove("active");
    menbtn.classList.remove("active");
    womenbtn.classList.remove("active");
    gadgetbtn.classList.remove("active");

    document.querySelectorAll('.product').forEach(product => {
        const heading = product.querySelector('h3');
        if (heading && heading.textContent.trim().startsWith('kids')) {
            product.style.display = 'flex';
        } else {
            product.style.display = 'none';
        }
    });


});
gadgetbtn.addEventListener("click", function () {
    gadgetbtn.classList.add("active");
    allbtn.classList.remove("active");
    menbtn.classList.remove("active");
    womenbtn.classList.remove("active");
    kidbtn.classList.remove("active");

    document.querySelectorAll('.product').forEach(product => {
        const heading = product.querySelector('h3');
        if (heading && heading.textContent.trim().startsWith('gadget')) {
            product.style.display = 'flex';
        } else {
            product.style.display = 'none';
        }
    });


});


function getCategoryFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("category") || "all";
}

