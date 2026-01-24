import React, { useEffect, useState } from 'react'
import Hero from '../Components/Hero/Hero'
import Popular from '../Components/Popular/Popular'
import Offers from '../Components/Offers/Offers'
import NewCollections from '../Components/NewCollections/NewCollections'
import NewsLetter from '../Components/NewsLetter/NewsLetter'
import { backend_url } from '../App'

const Shop = () => {

  const [popular, setPopular] = useState([]);
  const [newcollection, setNewCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInfo = () => { 
    setLoading(true);
    setError(null);
    
    fetch(`${backend_url}/popularinwomen`) 
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setPopular(data))
      .catch((error) => {
        console.error("Error fetching popular products:", error);
        setError("Failed to load products. Please check if the server is running.");
        setPopular([]);
      });
      
    fetch(`${backend_url}/newcollections`) 
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setNewCollection(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching new collections:", error);
        setError("Failed to load products. Please check if the server is running.");
        setNewCollection([]);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchInfo();
  }, [])


  return (
    <div>
      {error && <div style={{padding: '20px', textAlign: 'center', color: 'red', backgroundColor: '#ffe6e6'}}>{error}</div>}
      <Hero/>
      {loading ? (
        <div style={{padding: '20px', textAlign: 'center'}}>Loading products...</div>
      ) : (
        <>
          <Popular data={popular}/>
          <Offers/>
          <NewCollections data={newcollection}/>
        </>
      )}
      <NewsLetter/>
    </div>
  )
}

export default Shop
