import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from './login';
import Signup from './signup';
import Nvbr from "./Nvbr";
import Nvbrfordm from "./fordmin";
import Proddd from "./productdd";
import Products from "./product";
import Updte from "./updteprod";
import Crtprt from "./crt";
import Fvr from "./fvr";
import Ordsd from "./ordersnd";
import Postorders from "./post-orders-user";
import OdrSt from "./order-st-dmn";
import { useEffect } from "react";

function App() {
  const isLoggedIn = useSelector((state) => state.user.isLoggedin);
  const dm = useSelector((st)=>st.user.dm);
  const nv = useNavigate();
   
  return (
    <>
      {/* Show navbars only if logged in */}
      {isLoggedIn && (
        <>
      {(dm)?<Nvbrfordm />:<Nvbr />  }
          
          
        </>
      )}

      <Routes>
        {/* Always allow login and signup */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes */}
        {isLoggedIn ? (
          <>
            <Route path="/orderbuy" element={<Ordsd />} />
            <Route path="/crt" element={<Crtprt />} />
            <Route path="/fvrite" element={<Fvr />} />
            <Route path="/orderdmst" element={<OdrSt />} />
            <Route path="/ordersmdebyusers" element={<Postorders />} />
            <Route path="/pro" element={<Products />} />
            <Route path="/productdd" element={<Proddd />} />
            <Route path="/uptpro" element={<Updte />} />
          </>
        ) : (
          // Redirect any other route to login if not logged in
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </>
  );
}

export default App;
