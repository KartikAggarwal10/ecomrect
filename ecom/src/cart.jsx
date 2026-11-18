import { useState,useEffect } from 'react'
import { useDispatch, useSelector } from "react-redux"
import Ordsd from './ordersnd';
import styles from './Crtprt.module.css';
import ProductDetailOverlay from './components/productDetailOverlay';
function Crtprt() {
  const[prod,stprod] = useState([]);
  const[ctxd,sctxd] = useState(0);
  const[sum,stsum] = useState(0);
  const[ShowOrder,setShowOrder] = useState(null);
  const[previewImages, setPreviewImages] = useState(null);
  const[currentImgIndex, setCurrentImgIndex] = useState(0);
  const[product_for_preview,setproduct_for_preview] = useState({})
  const[answer,setAnswer] = useState({})
  function tots(x){
       stsum(sum+x);
  }
 
  function ch(e){
    sctxd(e.target.value)
  } 
     const upd = async (u) => {
  const res = await fetch(`/api/cart/update`, {
    method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    body:JSON.stringify({
        itemId: u._id,
        newCount: ctxd
    })
  });
  const result = await res.json();
  if(result.success === true) {
  stprod(products => products.map((product) => product._id === u._id ? {...product, count: ctxd} : product)); 
  }
  showAnswer(
    result.success,
    result.success
        ? "Cart updated successfully"
        : "Failed to update cart"
  );
};
const showAnswer = (success, message) => {
    setAnswer({
        success,
        message
    });

    setTimeout(() => {
        setAnswer({});
    }, 1000);
};
 const fgfg = async()=>{
  fetch(`/api/cart/id`,{
    method: "GET",
      credentials: "include"
  })
    .then((res) => res.json())
    .then((dt) => {stprod(dt.items)})
    .catch((err) => console.error("Fetch error:", err));
 }
 useEffect(() => {
  fgfg();
}, []);




useEffect(() => {
  const sum_current = prod.reduce((sum,item) => {
    return sum + (
      item.cartCount*(item.price-item.price * item.discount/100)
    )
  },0)
  stsum(sum_current)
},[prod])




    const rem = async (u) => {
  const formData = new FormData();
  formData.append("itemId", u._id);
  tots(deleted_sum)
  const res = await fetch(`/api/cart/removeItem`, {
    method: "POST",
    credentials: "include",
    body: formData,
   } );

  const result = await res.json();
  if(result.success === true) {
    setAnswer({result : true,message : "item removed"});
  }
  showAnswer(
    result.success,
    result.success
        ? "Cart updated successfully"
        : "Failed to update cart"
);
  console.log(data);
  stprod(products => products.filter((product) => product._id !== u._id));
};

  const openImageSlider = (images,y) => {
    if (images && images.length > 0) {
      setPreviewImages(images);
      setCurrentImgIndex(0);
      setproduct_for_preview(y);
    }
  };

    return (
    <div className={styles.cartcontainer}>
      {/* 🖼️ Sliding Image Modal */}
      {
        previewImages && (
          <ProductDetailOverlay  product = {product_for_preview}
  isOpen = {previewImages}
  onClose = {setPreviewImages}  />
        )
      }
      {answer.message && (
    <div className={`${styles.popup} ${
        answer.success ? styles.success : styles.error
    }`}>
        <div className={styles.popupText}>
            {answer.message}
        </div>

        <div className={styles.progress}></div>
    </div>
)}
      {prod &&
        prod.map((y, i) => (
          <div className={styles.cartitem} key={i}>
            <div className={styles.imgWrapper} onClick={() => openImageSlider(Array.isArray(y.img) ? y.img : [y.img],y)}>
              <img
                className={styles.productimg}
                src={Array.isArray(y.img) ? y.img[0] : y.img}
                alt={y.nme || "Product"}
              />
              <span className={styles.imgBadge}>View</span>
            </div>
            <div className={styles.productdetails}>
              <h3>{y.nme}</h3>
              <p>Qty: {y.cartCount}</p>
              <p>Total Price: ₹{y.cartCount * (y.price - y.price * y.discount /100)}</p>
            </div>
            <div className={styles.cartactions}>
             { (y.cartCount <= y.count) ? <button onClick={() => setShowOrder(y)} className={styles.showbtn}>Show Order</button> : <spam>this amount of product is not available</spam>}
             <input
                type="number"
                placeholder="Qty"
                onChange={ch}
                className={styles.qtyinput}
              />
              <button onClick={() => upd(y)} className={styles.updatebtn}>Update</button>
              <button onClick={() => rem(y)} className={styles.removebtn}>Remove</button>
            </div>
          </div>
        ))}
      {ShowOrder && <Ordsd dt={ShowOrder} onClose={setShowOrder} />}
      <div className={styles.totalsection}>
        <h2>Total: ₹{sum.toFixed(2)}</h2>
      </div>
    </div>
  );

}
export default Crtprt;

