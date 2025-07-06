import { Link } from "react-router-dom";
import styles from "./frdm.module.css";

function Nvbrfordm() {
  return (
    <nav className={styles.adminNavbar}>
      <Link to="/login">Login</Link>
      <Link to="/signup">Signup</Link>
      <Link to="/orderdmst">Check Orders</Link>
      <Link to="/productdd">Add Product</Link>
      <Link to="/uptpro">Update Product</Link>
    </nav>
  );
}

export default Nvbrfordm;
