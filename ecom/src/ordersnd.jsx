import { useState } from 'react';
import { useSelector } from "react-redux";
import styles from "./Ordsd.module.css";

function Ordsd(props) {
  const [drs, stdrs] = useState("");
  const [success, setSuccess] = useState(false); // ✅ success flag

  const nm = useSelector((st) => st.user.nme);
  const ml = useSelector((st) => st.user.mil);

  function set(e) {
    stdrs(e.target.value);
  }

  const setdn = async () => {
    const formdt = new FormData();
    formdt.append("user", nm);
    formdt.append("item", props.dt.nme);
    formdt.append("unt", props.dt.count);
    formdt.append("sttus", false);

    const qty = props.dt.count;
    const unitPrice = props.dt.price;
    const discount = props.dt.discount;
    const finalPrice = qty * (unitPrice - (unitPrice * discount / 100));
    formdt.append("price", finalPrice.toFixed(2));
    formdt.append("count", props.dt.count);
    formdt.append("itemid", props.dt._id);
    formdt.append("ddrss", drs);

    const res = await fetch("https://ecomrectbck.onrender.com/api/rdr", {
      method: "POST",
      body: formdt,
    });

    const data = await res.json();
    console.log(data);
    
    setSuccess(true); // ✅ show success message

    setTimeout(() => {
      setSuccess(false); // ✅ hide it after 3s
    }, 3000);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.orderContainer}>
        {success && (
          <div className={styles.successMessage}>
            ✅ Order placed successfully!
          </div>
        )}
        <input
          type="text"
          placeholder="Enter delivery address"
          onChange={set}
          className={styles.inputBox}
        />
        <button onClick={setdn} className={styles.orderButton}>
          Place Order
        </button>
      </div>
    </div>
  );
}

export default Ordsd;
