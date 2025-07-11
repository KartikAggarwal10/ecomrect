import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './Fvr.module.css';

function Fvr() {
  const [prec, setprc] = useState([]);
  const who = useSelector((st) => st.user.nme);

  useEffect(() => {
    fetch("https://ecomrectbck.onrender.com/api/fvr")
      .then((res) => res.json())
      .then((dt) => setprc(dt));
  }, []);

  const x = prec.find((g) => g.user === who);

  const fvrrem = async (x, u) => {
    const formdt = new FormData();
    formdt.append("user", x.user);
    formdt.append("id", u._id);

    const res = await fetch("https://ecomrectbck.onrender.com/api/fvrrem", {
      method: "POST",
      body: formdt,
    });

    const data = await res.json();
    console.log(data);
  };

  return (
    <div className={styles.fvrcontainer}>
      <div className={styles.fvrtitle}>Your Favorites</div>
      {x &&
        x.items.map((u, i) => (
          <div key={i} className={styles.fvritem}>
            <img
              src={"http://localhost:5000/" + u.img.replace(/\\/g, "/")}
              alt={u.nme}
              className={styles.productimg}
            />
            <div className={styles.productdetails}>
              <div><strong>Name:</strong> {u.nme}</div>
              <div><strong>Category:</strong> {u.ctgry}</div>
              <div><strong>Price:</strong> ₹{u.price}</div>
              <div><strong>Discount:</strong> {u.discount}%</div>
            </div>
            <div className={styles.fvractions}>
              <button onClick={() => fvrrem(x, u)} className={styles.removebtn}>
                Remove
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}

export default Fvr;
