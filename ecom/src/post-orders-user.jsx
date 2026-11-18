import { useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import styles from './Postorders.module.css';
import { apiFetch } from './api';

function Postorders() {
  const [itemsof, stitemsof] = useState([]);

  useEffect(() => {
    const getOrders = async()=> {

   
    await apiFetch(`/api/order`,{
      method:"GET",
      credentials: "include"
    })
      .then((res) => res.json())
      .then((dt) => { console.log("data is : " + dt + " " + typeof dt); stitemsof(dt.items)});
     }
     getOrders()
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.heading}>Your Placed Orders {itemsof.length}  </div>
      {itemsof && itemsof.map((t, i) => (
        <div key={i} className={styles.orderCard}>
          <div className={styles.orderItem}><span className={styles.label}>Item:</span> {t.item}</div>
          <div className={styles.orderItem}><span className={styles.label}>Quantity:</span> {t.unt}</div>
          <div className={styles.orderItem}><span className={styles.label}>Status:</span> {t.sttus ? "Delivered" : "Pending"}</div>
          <div className={styles.orderItem}><span className={styles.label}>Address:</span> {t.ddrss}</div>
        </div>
      ))}
    </div>
  );
}

export default Postorders;
