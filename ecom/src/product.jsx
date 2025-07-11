import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import styles from "./product.module.css";

function Products() {
  const [pro, stpro] = useState([]);
  const [ct, stct] = useState(0);
  const [nmeprod, stnmeprod] = useState("");
  const count = useSelector((state) => state.user.nme);

  function chn(e) {
    stnmeprod(e.target.value);
  }
  useEffect (()=>{
 fetch("https://ecomrectbck.onrender.com/api/product")
    .then((res) => res.json())
    .then((dt) => {
      stpro(dt);
    });
  },[])
  

  function chng(e) {
    stct(e.target.value);
  }

  const tocrt = async (u) => {
    const formData = new FormData();
    formData.append("user", count);
    formData.append("nme", u.nme);
    formData.append("ctgry", u.ctgry);
    formData.append("count", ct);
    formData.append("price", u.price);
    formData.append("discount", u.discount);
    formData.append("img", u.img);

    const res = await fetch("https://ecomrectbck.onrender.com/api/crt", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log(data);
  };

  const ddfv = async (u) => {
    const formData = new FormData();
    formData.append("user", count);
    formData.append("nme", u.nme);
    formData.append("ctgry", u.ctgry);
    formData.append("price", u.price);
    formData.append("discount", u.discount);
    formData.append("img", u.img);

    const res = await fetch("https://ecomrectbck.onrender.com/api/fvr", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log(data);
  };

  function settofind() {
    const fg = pro.filter((u) => u.nme.includes(nmeprod));
    stpro(fg);
  }

  function sort() {
    const bh = [...pro].sort((u, v) => u.price - v.price);
    stpro(bh);
  }
  return (
    <>
      <div className={styles.pageHeader}>Products</div>

      <div className={styles.controls}>
        <input type="text" placeholder="Enter name" onChange={chn} />
        <select id="fruit" name="fruit" onChange={chn}>
          <option value="electronic">Electronic</option>
          <option value="digi">Digital</option>
        </select>
        <button onClick={settofind}>Search</button>
        <button onClick={sort}>Sort by price</button>
      </div>

      <div className={styles.lldx}>
        {pro.map((u, i) => (
          <div key={i} className={styles.prt}>
            <img
              src={"http://localhost:5000/" + u.img.replace("\\", "/")}
              alt=""
              width="140"
            />
            <div className={styles.trt}>
              <button onClick={() => ddfv(u)}>Add to Favorites</button>
            </div>
            <div className={styles.up}>
              Name: {u.nme}
              <br />
              Category: {u.ctgry}
            </div>
            <div className={styles.hd}>Discount: {u.discount}%</div>

            <div>
              <a className={styles.cart} href="#" onClick={() => tocrt(u)}>
                <span className={styles.price}>
                  ₹{Number(u.price).toLocaleString()}
                </span>
                <span className={styles.txt}>Add to Cart</span>
              </a>
              <input
                type="number"
                placeholder="Quantity"
                onChange={chng}
                className={styles.inp}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Products;
