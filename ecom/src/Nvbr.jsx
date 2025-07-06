import { Link } from "react-router-dom";
import styles from "./Nvbr.module.css";

function Nvbr() {
  return (
    <nav className={styles.navbar}>
     <Link to="/pro">Products</Link>
      <Link to="/crt">Cart</Link>
      <Link to="/fvrite">Favorites</Link>
      <Link to="/ordersmdebyusers">Orders</Link>
        <Link to="/login">Login</Link>
      <Link to="/signup">Signup</Link>
    </nav>
  );
}

export default Nvbr;
