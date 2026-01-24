import React, { useEffect, useState } from "react";
import "./ListProduct.css";
import cross_icon from '../Assets/cross_icon.png'
import { backend_url, currency } from "../../App";

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInfo = () => {
    setLoading(true);
    setError(null);
    
    fetch(`${backend_url}/allproducts`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setAllProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please check if the server is running.");
        setAllProducts([]);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchInfo();
  }, [])

  const removeProduct = async (id) => {
    if (!window.confirm("Are you sure you want to remove this product?")) {
      return;
    }

    try {
      const resp = await fetch(`${backend_url}/removeproduct`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id }),
      });

      if (!resp.ok) {
        throw new Error(`Server error: ${resp.status}`);
      }

      const data = await resp.json();
      
      if (data.success) {
        alert("Product removed successfully");
        fetchInfo(); // Refresh the list
      } else {
        alert("Failed to remove product");
      }
    } catch (error) {
      console.error("Remove product error:", error);
      alert("Failed to connect to server. Please make sure the server is running.");
    }
  }

  return (
    <div className="listproduct">
      <h1>All Products List</h1>
      {error && <div style={{padding: '10px', marginBottom: '10px', color: 'red', backgroundColor: '#ffe6e6', borderRadius: '5px'}}>{error}</div>}
      <div className="listproduct-format-main">
        <p>Products</p> <p>Title</p> <p>Old Price</p> <p>New Price</p> <p>Category</p> <p>Remove</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {loading ? (
          <div style={{padding: '20px', textAlign: 'center'}}>Loading products...</div>
        ) : allproducts.length === 0 ? (
          <div style={{padding: '20px', textAlign: 'center'}}>No products found</div>
        ) : (
          allproducts.map((e, index) => (
            <div key={index}>
              <div className="listproduct-format-main listproduct-format">
                <img className="listproduct-product-icon" src={backend_url + e.image} alt="" />
                <p className="cartitems-product-title">{e.name}</p>
                <p>{currency}{e.old_price}</p>
                <p>{currency}{e.new_price}</p>
                <p>{e.category}</p>
                <img className="listproduct-remove-icon" onClick={() => { removeProduct(e.id) }} src={cross_icon} alt="" />
              </div>
              <hr />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ListProduct;
