import { useEffect, useState } from 'react';
import styles from "./OdrSt.module.css";

function OdrSt() {
  const [oders, storders] = useState([]);
  async function xc() {
    console.log("came in order for admin");

    try {
        console.log("before fetch");

        const res = await fetch("http://localhost:5000/order/for_admin", {
            method: "GET",
            credentials: "include"
        });

        console.log("fetch completed");
        console.log("status:", res.status);

        const dt = await res.json();

        console.log("response data:",dt);

        storders(dt);

    } catch (err) {
        console.error("FETCH ERROR:", err);
    }
}

  useEffect(() => {
    xc();
  }, []);

  const chng = async (g, h) => {
    const res = await fetch("http://localhost:5000/order/admin_update", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      //body: JSON.stringify({ itemid: g._id, sttus: }),
      body:JSON.stringify({itemid : g.product_id,sttus : (!g.sttus),user : h.user})
    });

    const data = await res.json();
    console.log(data);
    storders(prev =>
  prev.map(user => ({
    ...user,
    items: user.items.map(item =>
      item.product_id === g.product_id
        ? { ...item, sttus: !item.sttus }
        : item
    )
  }))
);
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
