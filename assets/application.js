// Put your application javascript here

document.addEventListener('DOMContentLoaded', () => {
    const addToCartButtons = document.querySelectorAll('#cart-btn'); // get all buttons
    const cartCountElement = document.getElementById('cartCount'); // get the cart count badge
    const wishCountElement = document.getElementById('wishCount'); // get the wishlist count badge

    // Helper function to update cart count
    async function updateCartCount() {
        try {
            const response = await fetch('/cart.js');
            if (!response.ok) throw new Error('Failed to fetch cart');

            const cart = await response.json();
            if (cartCountElement) {
                cartCountElement.innerText = cart.item_count;
            }
        } catch (error) {
            console.error('Cart count update error:', error);
        }
    }

    // Helper functions for wishlist
    function getWishlist() {
        let wishlist = localStorage.getItem('wishlist');
        return wishlist ? JSON.parse(wishlist) : [];
    }

    function setWishlist(list) {
        localStorage.setItem('wishlist', JSON.stringify(list));
    }

    function updateWishlistCounter() {
        const wishlistItems = getWishlist();
        if (wishCountElement) {
            wishCountElement.textContent = wishlistItems.length > 0 ? wishlistItems.length : '';
        }
    }

    // Add to Cart button logic
    addToCartButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const btn = event.currentTarget; // safer than event.target
            const originalText = btn.innerHTML;
            const variantId = btn.getAttribute('data-var');

            btn.innerHTML = "Adding...";
            btn.disabled = true;
            try {
                const response = await fetch('/cart/add.js', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        id: variantId,
                        quantity: 1
                    })
                });
                if (!response.ok) throw new Error('Network response was not ok');
                btn.innerText = 'Added';

                // 🎯 Immediately update cart counter after successful add
                await updateCartCount();

            } catch (err) {
                console.error('Cart error:', err);
                btn.innerText = 'Error';
            } finally {
                // Restore original text after delay
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }, 1500);
            }
        });
    });

    // Wishlist button logic
    const currentWishlist = getWishlist();
    document.querySelectorAll('#wishlist').forEach((btn) => {
        const productId = btn.getAttribute('data-var');

        if (currentWishlist.includes(productId)) {
            btn.classList.replace('text-gray-700', 'text-red-400');
            btn.classList.remove('hover:text-white');
        }

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const Id = btn.getAttribute('data-var');
            let wishlist = getWishlist();

            if (wishlist.includes(Id)) {
                wishlist = wishlist.filter(id => id !== Id);
                btn.classList.replace('text-red-400', 'text-gray-700');
                btn.classList.add('hover:text-white');
            } else {
                wishlist.push(Id);
                btn.classList.replace('text-gray-700', 'text-red-400');
                btn.classList.remove('hover:text-white');
            }

            setWishlist(wishlist);
            updateWishlistCounter();
        });
    });

    // 🔥 Always update wishlist counter on page load
    updateWishlistCounter();
});
