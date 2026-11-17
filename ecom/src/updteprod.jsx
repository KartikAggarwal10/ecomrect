import { useState } from 'react';
import styles from './upd.module.css';

function Updte({props,onClose}) {
  const [prec, setprc] = useState(props.price ?? 0);
  const [stk, setstk] = useState(props.count ?? 0);
  const [dis, stdis] = useState(props.discount ?? 0);
  const [nm, stnm] = useState(props.description ?? 0);
  function close() {
    onClose(false);
  }
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
    const res = await fetch("http://localhost:5000/product/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials:"include",
      body: JSON.stringify({
        _id : props._id,
        desc : nm,
        dis: Number(dis),
        stk: Number(stk),
        prec: Number(prec)
      }),
    });
    const data = await res.json();
    if(data.success === true) {
      close()
    }
    if (res.ok) console.log("done");
  }

  return (

    <div className={styles.updateContainer}>
      <button onClick={close}>X</button>
      <input
        type="text"
        placeholder='change description'
        onChange={chngnme}
        className={styles.updateInput}
        value={nm}
      />
      <input
        type="number"
        placeholder='Enter price to update'
        onChange={chngprc}
        className={styles.updateInput}
        value={prec}
      />
      <input
        type="number"
        placeholder='Enter stock to update'
        onChange={chngstl}
        className={styles.updateInput}
        value={stk}
      />
      <input
        type="number"
        placeholder='Enter discount to update'
        onChange={chngdis}
        className={styles.updateInput}
        value={dis}
      />
      <button onClick={sub} className={styles.updateButton}>Update Product</button>
    </div>
  );
}

export default Updte;
