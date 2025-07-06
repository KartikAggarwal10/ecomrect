import { useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setuser } from './userdt';
import styles from "./login.module.css";

function Login() {
  const [x, setx] = useState(0);
  const [nme, stnme] = useState("");
  const [psw, stpsw] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function nm(e) {
    stnme(e.target.value);
  }

  function ps(e) {
    stpsw(e.target.value);
  }

  function mtc() {
    fetch("http://localhost:5000/api/user")
      .then((res) => res.json())
      .then((dt) => {
        const k = dt.find((u) => u.nme === nme && u.psswrd === psw);
        if (k) {
          const r = k.emil;
          const dm = k.isdm;
          dispatch(setuser({ nme, psw, r ,dm}));

          if (k.isdm) {
            setx(2);
             navigate("/uptpro");
          } else {
            setx(1);
            navigate("/pro");
          }

          // ✅ Navigate after successful login
         
        } else {
          alert("Invalid credentials");
        }
      })
      .catch(err => {
        console.error("Login error:", err);
        alert("Server error");
      });
  }

  return (
    <div className={styles.ll} style={{ height: window.innerHeight }}>
      <div>
        <div className={styles.lp}>LOGIN</div>
        <div className={styles.mn}>
          <input type="text" placeholder='User name' onChange={nm} />
          <div className={styles.cls}></div>
          <input type="password" placeholder='Password' onChange={ps} className={styles.cls3} />
          <div className={styles.cls2}></div>
          <button onClick={mtc}>Submit</button>
          <div className={styles.tt}>{x > 0 ? `Welcome!` : null}</div>
        </div>
      </div>
    </div>
  );
}

export default Login;
