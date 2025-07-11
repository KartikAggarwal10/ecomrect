import { useState } from 'react';
import styles from './upd.module.css';

function Updte() {
  const [prec, setprc] = useState(0);
  const [stk, setstk] = useState(0);
  const [dis, stdis] = useState(0);
  const [nm, stnm] = useState("");

  function chngprc(e) {
    setprc(e.target.value);
  }

  function chngdis(e) {
    stdis(e.target.value);
  }

  function chngnme(e) {
    stnm(e.target.value);
  }

  function chngstl(e) {
    setstk(e.target.value);
  }

  const sub = async () => {
    const res = await fetch("https://ecomrectbck.onrender.com/api/upprod", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nm,
        dis: Number(dis),
        stk: Number(stk),
        prec: Number(prec)
      }),
    });
    if (res.ok) console.log("done");
  }

  return (
    <div className={styles.updateContainer}>
      <input
        type="text"
        placeholder='Enter product name'
        onChange={chngnme}
        className={styles.updateInput}
      />
      <input
        type="number"
        placeholder='Enter price to update'
        onChange={chngprc}
        className={styles.updateInput}
      />
      <input
        type="number"
        placeholder='Enter stock to update'
        onChange={chngstl}
        className={styles.updateInput}
      />
      <input
        type="number"
        placeholder='Enter discount to update'
        onChange={chngdis}
        className={styles.updateInput}
      />
      <button onClick={sub} className={styles.updateButton}>Update Product</button>
    </div>
  );
}

export default Updte;
