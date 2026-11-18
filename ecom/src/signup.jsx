import { useState } from 'react';
import styles from './Signup.module.css';

function Signup() {
  const [nm, stnm] = useState("");
  const [ml, stml] = useState("");
  const [ps, stps] = useState("");
  const [isdm, stdm] = useState(false);

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
    stdm(e.target.value === "dmin");
  }

  const sub = async () => {
    const res = await fetch(`/api/user/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nme: nm,
        psswrd: ps,
        emil: ml,
        isdm: false,
      }),
    });
    const data = await res.json();
    console.log(data);
  };

  return (
    <div className={styles.container}>
      <input type="text" placeholder="Enter name" onChange={chngnm} className={styles.input} />
      <input type="text" placeholder="Enter email" onChange={chngml} className={styles.input} />
      <input type="password" placeholder="Enter password" onChange={chngps} className={styles.input} />
      <button onClick={sub} className={styles.button}>Signup</button>
    </div>
  );
}

export default Signup;
