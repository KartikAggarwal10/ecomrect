import { useEffect, useState } from 'react';
import styles from "./OdrSt.module.css";

function OdrSt() {
  const [oders, storders] = useState([]);

  function xc() {
    fetch("https://ecomrectbck.onrender.com/orders")
      .then((res) => res.json())
      .then((dt) => storders(dt));
  }

  useEffect(() => {
    xc();
  }, []);

  const chng = async (g, h) => {
    const fd = new FormData();
    fd.append("user", h.user);
    fd.append("itemid", g._id);
    fd.append("sttus", (!g.sttus).toString());

    const res = await fetch("https://ecomrectbck.onrender.com/api/ordersdmin", {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    console.log(data);
    xc(); // refresh after change
  };

  return (
    <div className={styles.orderContainer}>
      {oders.map((u, i) => (
        <div key={i} className={styles.orderCard}>
          <div className={styles.userLabel}>User: {u.user}</div>
          {u.items.map((x, j) => (
            <div key={j} className={styles.itemRow}>
              <span className={styles.status}>Status: {x.sttus ? "✅ Delivered" : "❌ Pending"}</span>
              <span>Item: {x.item}</span>
              <span>Qty: {x.unt}</span>
              <span>Address: {x.ddrss}</span>
              <button className={styles.button} onClick={() => chng(x, u)}>
                Toggle Status
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default OdrSt;
