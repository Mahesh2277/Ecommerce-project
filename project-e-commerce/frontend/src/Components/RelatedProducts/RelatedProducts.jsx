import React, { useEffect, useState } from 'react'
import './RelatedProducts.css'
import Item from '../Item/Item'
import { backend_url } from '../../App';

const RelatedProducts = ({category,id}) => {

  const [related,setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(()=>{
    if (!category) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    fetch(`${backend_url}/relatedproducts`,{
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({category:category}),
      })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setRelated(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching related products:", error);
        setError("Failed to load related products.");
        setRelated([]);
        setLoading(false);
      });
  },[category])

  return (
    <div className='relatedproducts'>
      <h1>Related Products</h1>
      <hr />
      {error && <div style={{padding: '10px', color: 'red', backgroundColor: '#ffe6e6'}}>{error}</div>}
      <div className="relatedproducts-item">
        {loading ? (
          <div style={{padding: '20px', textAlign: 'center'}}>Loading...</div>
        ) : (
          related.map((item,index)=>{
            if (id !== item.id) {
              return <Item key={index} id={item.id} name={item.name} image={item.image}  new_price={item.new_price} old_price={item.old_price}/>
            }
            return null;
          })
        )}
      </div>
    </div>
  )
}

export default RelatedProducts
