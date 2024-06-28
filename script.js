// DOM
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const productDetailsModal = document.getElementById('product-details-modal');
const productDetails = document.getElementById('product-details');
const closeModal = document.getElementById('close-modal');
const cartIcon = document.getElementById('cart-icon');
const cartDetailsModal = document.getElementById('cart-details-modal');
const closeCartModal = document.getElementById('close-cart-modal');
const cart = document.getElementById('cart');
const checkoutButton = document.getElementById('checkout-button');

let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

// Evento para realizar la búsqueda
searchForm.addEventListener('submit', event => {
    event.preventDefault();
    const query = searchInput.value;
    fetch(`https://api.mercadolibre.com/sites/MLA/search?q=${query}`)
        .then(response => response.json())
        .then(data => {
            displaySearchResults(data.results);
        })
        .catch(error => {
            console.error('Error fetching search results:', error);
        });
});

// Función para mostrar los resultados de la búsqueda
function displaySearchResults(results) {
    searchResults.innerHTML = '';
    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.classList.add('result-item');
        resultItem.innerHTML = `
            <img src="${result.thumbnail}" alt="${result.title}">
            <p>${result.title}</p>
            <p>Precio: $${result.price}</p>
            <button onclick="viewProductDetails('${result.id}')">Ver detalles</button>
        `;
        searchResults.appendChild(resultItem);
    });
}

// Función para mostrar los detalles del producto
function viewProductDetails(productId) {
    fetch(`https://api.mercadolibre.com/items/${productId}`)
        .then(response => response.json())
        .then(product => {
            fetch(`https://api.mercadolibre.com/items/${productId}/description`)
                .then(response => response.json())
                .then(description => {
                    displayProductDetails(product, description);
                    showModal();
                    initializeCarousel(); 
                })
                .catch(error => console.error('Error fetching product description:', error));
        })
        .catch(error => console.error('Error fetching product details:', error));
}

// Función para mostrar los detalles del producto en el modal
function displayProductDetails(product, description) {
    productDetails.innerHTML = `
        <h2>${product.title}</h2>
        <div class="carousel">
            ${product.pictures.map(picture => `<div><img src="${picture.url}" alt="${product.title}"></div>`).join('')}
        </div>
        <p>Precio: $${product.price}</p>
        <p>${description.plain_text || 'No hay descripción disponible.'}</p>
        <button class="add-to-cart-button" onclick="addToCart('${product.id}', '${product.title}', ${product.price})">Agregar al carrito</button>
    `;
}

// Función para inicializar el carrusel
function initializeCarousel() {
    $('.carousel').slick({
        dots: false,
        infinite: true,
        speed: 300,
        slidesToShow: 1,
        adaptiveHeight: true,
        prevArrow: '<button type="button" class="slick-prev">&#8249;</button>',
        nextArrow: '<button type="button" class="slick-next">&#8250;</button>',
        customPaging: function(slider, i) {
            return '<button type="button">' + (i + 1) + '</button>';
        }
    });
}

// Función para mostrar el modal
function showModal() {
    productDetailsModal.style.display = 'block';
}

// Función para cerrar el modal de detalles del producto
closeModal.addEventListener('click', function() {
    productDetailsModal.style.display = 'none';
});

// Función para abrir el modal del carrito
cartIcon.addEventListener('click', function() {
    displayCart(); // Mostrar el carrito al hacer clic en el ícono
    cartDetailsModal.style.display = 'block';
});

// Función para cerrar el modal del carrito
closeCartModal.addEventListener('click', function() {
    cartDetailsModal.style.display = 'none';
});

// Función para añadir productos al carrito
function addToCart(productId, productName, productPrice) {
    const existingItem = cartItems.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItems.push({ id: productId, name: productName, price: productPrice, quantity: 1 });
    }
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    displayCart();

    // Cerrar el modal de detalles del producto al agregar al carrito
    productDetailsModal.style.display = 'none';
}

// Función para mostrar el carrito
function displayCart() {
    cart.innerHTML = '';
    let totalPrice = 0;
    cartItems.forEach(item => {
        totalPrice += item.price * item.quantity;
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `
            <p>${item.name} - $${item.price} x ${item.quantity}</p>
            <div class="cart-item-buttons">
                <button onclick="updateQuantity('${item.id}', 1)">+</button>
                <button onclick="updateQuantity('${item.id}', -1)">-</button>
                <button onclick="removeFromCart('${item.id}')">Eliminar</button>
            </div>
        `;
        cart.appendChild(cartItem);
    });

    // Mostrar el total del carrito
    const totalElement = document.createElement('p');
    totalElement.innerText = `Total: $${totalPrice}`;
    cart.appendChild(totalElement);
}

// Función para actualizar la cantidad de productos en el carrito
function updateQuantity(productId, amount) {
    const item = cartItems.find(item => item.id === productId);
    if (item) {
        item.quantity += amount;
        if (item.quantity <= 0) {
            cartItems = cartItems.filter(item => item.id !== productId);
        }
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        displayCart();
    }
}

// Función para eliminar productos del carrito
function removeFromCart(productId) {
    cartItems = cartItems.filter(item => item.id !== productId);
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    displayCart();
}

// Función para finalizar la compra
checkoutButton.addEventListener('click', function() {
    if (cartItems.length > 0) {
        alert('Compra realizada con éxito.');
        cartItems = [];
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        displayCart();
        cartDetailsModal.style.display = 'none'; // Cerrar el modal del carrito al finalizar la compra
    } else {
        alert('El carrito está vacío.');
    }
});

// Mostrar el carrito al cargar la página
displayCart();

// Mostrar productos disponibles al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    fetch('https://api.mercadolibre.com/sites/MLA/search?q=ofertas')
        .then(response => response.json())
        .then(data => displaySearchResults(data.results))
        .catch(error => console.error('Error fetching initial data:', error));
});
