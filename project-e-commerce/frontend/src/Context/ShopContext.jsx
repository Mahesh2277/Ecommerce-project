import React, { createContext, useEffect, useState } from "react";
import { backend_url } from "../App";

export const ShopContext = createContext(null);

const ShopContextProvider = (props) => {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getDefaultCart = () => {
    let cart = {};
    for (let i = 0; i < 300; i++) {
      cart[i] = 0;
    }
    return cart;
  };

  const [cartItems, setCartItems] = useState(getDefaultCart());

  useEffect(() => {
    // Fetch all products
    fetch(`${backend_url}/allproducts`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
        setError(null);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please check if the server is running.");
        setLoading(false);
        // Set empty array as fallback
        setProducts([]);
      });

    // Fetch cart data if user is logged in
    if (localStorage.getItem("auth-token")) {
      fetch(`${backend_url}/getcart`, {
        method: 'POST',
        headers: {
          Accept: 'application/form-data',
          'auth-token': `${localStorage.getItem("auth-token")}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(),
      })
        .then((resp) => {
          if (!resp.ok) {
            throw new Error(`Server error: ${resp.status}`);
          }
          return resp.json();
        })
        .then((data) => { 
          setCartItems(data || getDefaultCart());
        })
        .catch((error) => {
          console.error("Error fetching cart:", error);
          // Keep default cart on error
        });
    }
  }, [])

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        try {
          let itemInfo = products.find((product) => product.id === Number(item));
          if (itemInfo && itemInfo.new_price) {
            totalAmount += cartItems[item] * itemInfo.new_price;
          }
        } catch (error) {
          console.error("Error calculating cart amount:", error);
        }
      }
    }
    return totalAmount;
  };

  const getTotalCartItems = () => {
    let totalItem = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        try {
          let itemInfo = products.find((product) => product.id === Number(item));
          totalItem += itemInfo ? cartItems[item] : 0;
        } catch (error) {
          console.error("Error calculating cart items:", error);
        }
      }
    }
    return totalItem;
  };

  const addToCart = (itemId) => {
    if (!localStorage.getItem("auth-token")) {
      alert("Please Login");
      return;
    }
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    if (localStorage.getItem("auth-token")) {
      fetch(`${backend_url}/addtocart`, {
        method: 'POST',
        headers: {
          Accept: 'application/form-data',
          'auth-token': `${localStorage.getItem("auth-token")}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "itemId": itemId }),
      })
        .then((resp) => {
          if (!resp.ok) {
            throw new Error(`Server error: ${resp.status}`);
          }
          return resp.text();
        })
        .catch((error) => {
          console.error("Error adding to cart:", error);
          alert("Failed to add item to cart. Please try again.");
          // Revert the cart change
          setCartItems((prev) => ({ ...prev, [itemId]: Math.max(0, prev[itemId] - 1) }));
        });
    }
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    if (localStorage.getItem("auth-token")) {
      fetch(`${backend_url}/removefromcart`, {
        method: 'POST',
        headers: {
          Accept: 'application/form-data',
          'auth-token': `${localStorage.getItem("auth-token")}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "itemId": itemId }),
      })
        .then((resp) => {
          if (!resp.ok) {
            throw new Error(`Server error: ${resp.status}`);
          }
          return resp.text();
        })
        .catch((error) => {
          console.error("Error removing from cart:", error);
          alert("Failed to remove item from cart. Please try again.");
          // Revert the cart change
          setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        });
    }
  };

  const contextValue = { products, getTotalCartItems, cartItems, addToCart, removeFromCart, getTotalCartAmount, loading, error };
  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
