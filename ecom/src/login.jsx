import { useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setuser } from './userdt';
import styles from "./login.module.css";
import { Link } from 'react-router-dom';
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
    console.log("nme : " + nme + " password : " + psw)
    fetch(`http://localhost:5000/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        emil: nme,
        psswrd: psw,
      }),
    })
      .then((res) => res.json())
      .then((dt) => {
        if (dt.success && dt.user) {
          const r = dt.user.email;
          const dm = dt.user.isAdmin;
          const user_name = dt.user.name;
          dispatch(setuser({ nme, psw, r, dm, user_name }));

          if (dm) {
            setx(2);
            navigate("/uptpro");
          } else {
            setx(1);
            navigate("/pro");
          }
        } else {
          alert(dt.error || "Invalid credentials");
        }
      })
      .catch((err) => {
        console.error("Login error:", err);
        alert("Server error");
      });
  }

  return (
    <div className={styles.ll} style={{ height: window.innerHeight }}>
      <div>
        <div className={styles.lp}>LOGIN</div>
        <div className={styles.mn}>
          <input type="email" placeholder='User email' onChange={nm} />
          <div className={styles.cls}></div>
          <input type="password" placeholder='Password' onChange={ps} className={styles.cls3} />
          <div className={styles.cls2}></div>
          <button onClick={mtc}>Submit</button>
          <div className={styles.tt}>{x > 0 ? `Welcome!` : null}</div>
          <Link to="/signup" >signup</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
