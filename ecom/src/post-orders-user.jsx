import { useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import styles from './Postorders.module.css';

function Postorders() {
  const [itemsof, stitemsof] = useState([]);
  const user = useSelector((st) => st.user.nme);

  useEffect(() => {
    fetch("https://ecomrectbck.onrender.com/orders")
      .then((res) => res.json())
      .then((dt) => stitemsof(dt));
  }, []);

  const x = itemsof.find((m) => m.user === user);

  return (
    <div className={styles.container}>
      <div className={styles.heading}>Your Placed Orders</div>
      {x && x.items.map((t, i) => (
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
