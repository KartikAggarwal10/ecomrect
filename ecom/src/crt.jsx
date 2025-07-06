import { useState,useEffect } from 'react'
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from 'react-router-dom';
import Ordsd from './ordersnd';
import styles from './Crtprt.module.css';
function Crtprt() {
  const[prod,stprod] = useState([]);
  const[ctxd,sctxd] = useState(0);
  const[sum,stsum] = useState(0);
  const[ShowOrder,setShowOrder] = useState(null)
  function tots(x){
       stsum(sum+x);
  }
 
  function ch(e){
    sctxd(e.target.value)
  } 
 // runs only when prod or user changes
       const count = useSelector((state)=>state.user.nme)
         useEffect(() => {
  const x = prod.find((u) => u.user === count);
  if (x && x.items) {
    const total = x.items.reduce((acc, item) => {
      const priceAfterDiscount = item.price - (item.price * item.discount) / 100;
      return acc + item.count * priceAfterDiscount;
    }, 0);
    stsum(total);
  } else {
    stsum(0); // in case user has no items
  }
}, [prod, count, ctxd]);
     const upd = async (v, u) => {
  const formData = new FormData();
  formData.append("user", v.user);
  formData.append("itemId", u._id); // ✅ pass item's _id
  formData.append("newCount", ctxd);

  const res = await fetch("http://localhost:5000/api/crtupd", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  console.log(data);
  fgfg();
};
 const fgfg = async()=>{
  fetch("http://localhost:5000/api/crt")
    .then((res) => res.json())
    .then((dt) => stprod(dt))
    .catch((err) => console.error("Fetch error:", err));
 }
 useEffect(() => {
  fgfg();
}, []);
    const rem = async (v,u) => {
  const formData = new FormData();
   formData.append("user", v.user)
  formData.append("itemId", u._id);

  const res = await fetch("http://localhost:5000/api/crtrem", {
    method: "POST",
    body: formData,
   } );

  const data = await res.json();
  console.log(data);
  fgfg();
};
const x = prod.find((u)=>u.user===count)
    return (
    <div className={styles.cartcontainer}>
      {x &&
        x.items.map((y, i) => (
          <div className={styles.cartitem} key={i}>
            <img
              className={styles.productimg}
              src={"http://localhost:5000/" + y.img.replace(/\\/g, "/")}
              alt=""
            />
            <div className={styles.productdetails}>
              <h3>{y.nme}</h3>
              <p>Qty: {y.count}</p>
              <p>Price: ₹{y.price}</p>
              <p>Discount: {y.discount}%</p>
            </div>
            <div className={styles.cartactions}>
              <input
                type="number"
                placeholder="Edit quantity"
                onChange={ch}
                className={styles.qtyinput}
              />
              <button onClick={() => upd(x, y)} className={styles.updatebtn}>Update</button>
              <button onClick={() => rem(x, y)} className={styles.removebtn}>Remove</button>
               <button onClick={() => setShowOrder(y)} className={styles.showbtn}>Show Order</button>
            </div>
          </div>
        ))}
      {ShowOrder && <Ordsd dt={ShowOrder} />}
      <div className={styles.totalsection}>
        <h2>Total: ₹{sum.toFixed(2)}</h2>
      </div>
    </div>
  );

}
export default Crtprt;

