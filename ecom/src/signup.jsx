import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Signup.module.css';

function Signup() {
  const [nm, stnm] = useState("");
  const [ml, stml] = useState("");
  const [ps, stps] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sub = async () => {
    setError("");
    setLoading(true);
    try {
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

      if (!res.ok) {
        setError(data.error || "Signup failed. Please try again.");
        return;
      }

      // Success — redirect to login
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <input type="text" placeholder="Enter name" onChange={(e) => stnm(e.target.value)} className={styles.input} />
      <input type="text" placeholder="Enter email" onChange={(e) => stml(e.target.value)} className={styles.input} />
      <input type="password" placeholder="Enter password" onChange={(e) => stps(e.target.value)} className={styles.input} />
      {error && <p style={{ color: "red", margin: "8px 0" }}>{error}</p>}
      <button onClick={sub} className={styles.button} disabled={loading}>
        {loading ? "Signing up..." : "Signup"}
      </button>
    </div>
  );
}

export default Signup;
