import React, { useState } from "react";
import "./AddProduct.css";
import upload_area from "../Assets/upload_area.svg";
import { backend_url } from "../../App";

const AddProduct = () => {

  const [image, setImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [productDetails, setProductDetails] = useState({
    name: "",
    description: "",
    image: "",
    category: "women",
    new_price: "",
    old_price: ""
  });

  const AddProduct = async () => {
    // Validation
    if (!image) {
      setError("Please select an image");
      return;
    }
    if (!productDetails.name || !productDetails.description) {
      setError("Please fill in all required fields");
      return;
    }
    if (!productDetails.old_price || !productDetails.new_price) {
      setError("Please enter both old and new prices");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Upload image
      let formData = new FormData();
      formData.append('product', image);

      const uploadResp = await fetch(`${backend_url}/upload`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });

      if (!uploadResp.ok) {
        throw new Error(`Upload failed: ${uploadResp.status}`);
      }

      const uploadData = await uploadResp.json();

      if (!uploadData.success) {
        throw new Error(uploadData.error || "Image upload failed");
      }

      // Add product
      const product = {
        ...productDetails,
        image: uploadData.image_url
      };

      const addResp = await fetch(`${backend_url}/addproduct`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });

      if (!addResp.ok) {
        throw new Error(`Add product failed: ${addResp.status}`);
      }

      const addData = await addResp.json();

      if (addData.success) {
        alert("Product Added Successfully!");
        // Reset form
        setProductDetails({
          name: "",
          description: "",
          image: "",
          category: "women",
          new_price: "",
          old_price: ""
        });
        setImage(false);
      } else {
        throw new Error("Failed to add product");
      }
    } catch (error) {
      console.error("Add product error:", error);
      setError(error.message || "Failed to add product. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  }

  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
    setError(""); // Clear error when user types
  }

  return (
    <div className="addproduct">
      {error && <div style={{padding: '10px', marginBottom: '10px', color: 'red', backgroundColor: '#ffe6e6', borderRadius: '5px'}}>{error}</div>}
      <div className="addproduct-itemfield">
        <p>Product title</p>
        <input type="text" name="name" value={productDetails.name} onChange={(e) => { changeHandler(e) }} placeholder="Type here" />
      </div>
      <div className="addproduct-itemfield">
        <p>Product description</p>
        <input type="text" name="description" value={productDetails.description} onChange={(e) => { changeHandler(e) }} placeholder="Type here" />
      </div>
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Price</p>
          <input type="number" name="old_price" value={productDetails.old_price} onChange={(e) => { changeHandler(e) }} placeholder="Type here" />
        </div>
        <div className="addproduct-itemfield">
          <p>Offer Price</p>
          <input type="number" name="new_price" value={productDetails.new_price} onChange={(e) => { changeHandler(e) }} placeholder="Type here" />
        </div>
      </div>
      <div className="addproduct-itemfield">
        <p>Product category</p>
        <select value={productDetails.category} name="category" className="add-product-selector" onChange={changeHandler}>
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="kid">Kid</option>
        </select>
      </div>
      <div className="addproduct-itemfield">
        <p>Product image</p>
        <label htmlFor="file-input">
          <img className="addproduct-thumbnail-img" src={!image ? upload_area : URL.createObjectURL(image)} alt="" />
        </label>
        <input onChange={(e) => { setImage(e.target.files[0]); setError(""); }} type="file" name="image" id="file-input" accept="image/*" hidden />
      </div>
      <button className="addproduct-btn" onClick={() => { AddProduct() }} disabled={loading}>
        {loading ? "Adding..." : "ADD"}
      </button>
    </div>
  );
};

export default AddProduct;
