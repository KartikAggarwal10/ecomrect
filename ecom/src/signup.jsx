import { Routes, Route, useActionData } from "react-router-dom";
import { useState } from 'react'
 function Signup() {
const[nm,stnm] = useState("");
const[ml,stml] = useState("");
const[ps,stps] = useState("");
const[isdm,stdm] = useState(false);
function chngnm(e){
   stnm(e.target.value)
}
function chngml(e){
   stml(e.target.value)
}
function chngps(e){
   stps(e.target.value)
}
function handleChange(e){
  console.log(e.target.value);
    stdm(e.target.value==="dmin");  
}
        const sub = async () => {
    const res = await fetch("https://ecomrectbck.onrender.com/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({  nme:nm,
  psswrd:ps,
  emil:ml,
  isdm:isdm }),
    });
    const data = await res.json();
  
  };
  return (
    <>
       <input type="text"placeholder="enter nme" onChange={chngnm}/>
       <input type="text" placeholder="enter emil" onChange={chngml} />
       <input type="text" placeholder="enter pssword" onChange={chngps}/>
         <select onChange={handleChange}>
        <option value="user">user</option>
        <option value="dmin">dmin</option>
      </select>
      <button onClick={sub}></button>
    </>
  )
}

export default Signup
