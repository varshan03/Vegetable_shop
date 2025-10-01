// frontend/src/components/ProductModal.js
import React, { useState, useEffect } from "react";

export default function ProductModal({ show, onClose, onSave, product }) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    image: "",
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        price: product.price,
        stock: product.stock,
        image: product.image_url,
      });
    } else {
      setForm({ name: "", price: "", stock: "", image: "" });
    }
  }, [product]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit() {
    onSave(form);
  }

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{product ? "Edit Product" : "Add Product"}</h3>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
        />
        <input
          name="stock"
          placeholder="Stock"
          value={form.stock}
          onChange={handleChange}
        />
        <input
          name="image"
          placeholder="Image URL"
          value={form.image}
          onChange={handleChange}
        />

        <div className="modal-actions">
          <button onClick={handleSubmit}>
            {product ? "Update" : "Add"}
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
