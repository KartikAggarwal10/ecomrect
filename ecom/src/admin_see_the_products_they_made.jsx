import { useEffect,useState } from "react";
import { Navigate } from "react-router-dom";
import Updte from "./updteprod";
import { apiFetch } from './api';

export default function DisplayAdmin_Products() {
    const[products,set_products] = useState([])
    const[navigate,setNavigate] = useState(false)
    const[productToChange,setProductToChange] = useState({})
    const do_work = async() => {
        const res = await apiFetch(`/api/product/give_products_made_by_admin`, {
      method: "GET",
      credentials:"include",
    });
    const data = await res.json();
    console.log( data.produts)
    set_products(data.produts);
  }
  useEffect(() => {
    do_work() 
  },[])
    return(
        <div>
            show products  {products.length}
            {
                navigate && <Updte props = {productToChange} onClose={setNavigate}/>
            }
            {
                !navigate && products.map((product,i) => (
                    <div key={i}>
                        <img src = {product.img[0]} />  {product.nme}
                         <button onClick={() =>{ setNavigate(true) ; setProductToChange(product)}}>edit</button>
                    </div>
                ))
            }
        </div>
    )
}