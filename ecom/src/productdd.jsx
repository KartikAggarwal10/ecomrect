import { useState } from 'react';
import styles from "./Prodd.module.css";

function Proddd() {
  const [nm, stnm] = useState("");
  const [ml, stml] = useState(0);
  const [ps, stps] = useState(0);
  const [isdm, stdm] = useState("");
  const [prc, stprc] = useState(0);
  const [img, setimg] = useState(null);

  function handleImageChange(e) {
    setimg(e.target.files[0]);
  }

  function chngnm(e) {
    stnm(e.target.value);
  }

  function chngml(e) {
    stml(e.target.value);
  }

  function chngps(e) {
    stps(e.target.value);
  }

  function handleChange(e) {
    stdm(e.target.value);
  }

  function disc(e) {
    stprc(e.target.value);
  }

  const sub = async () => {
    const formData = new FormData();
    formData.append("nme", nm);
    formData.append("ctgry", isdm);
    formData.append("count", ml);
    formData.append("price", ps);
    formData.append("discount", prc);
    formData.append("img", img);

    const res = await fetch("https://ecomrectbck.onrender.com/api/product", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log(data);
  };

  return (
    <div className={styles.formContainer}>
      <input type="text" placeholder="Enter name" onChange={chngnm} className={styles.inputField} />
      <input type="number" placeholder="Enter count" onChange={chngml} className={styles.inputField} />
      <input type="number" placeholder="Enter price" onChange={chngps} className={styles.inputField} />
      <input type="number" placeholder="Enter discount" onChange={disc} className={styles.inputField} />
      <input type="file" onChange={handleImageChange} className={styles.fileInput} />

      <select onChange={handleChange} className={styles.selectField}>
        <option value="elec">Electronic</option>
        <option value="digi">Digital</option>
      </select>

      <button onClick={sub} className={styles.button}>Submit Product</button>
    </div>
  );
}

export default Proddd;
