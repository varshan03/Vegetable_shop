import React from 'react';
export default function ProductCard({p, onAdd}){
  return (
    <div className="product-card">
      <img src={p.image_url ? p.image_url : '/placeholder.png'} alt={p.name} />
      <h4>{p.name}</h4>
      <p>Price: ₹{p.price}</p>
      <p>Stock: {p.stock}</p>
      <button disabled={p.stock <= 0} onClick={()=>onAdd(p)}>Add</button>
    </div>
  );
}
