import { useCallback, useEffect, useRef, useState } from 'react';
import styles from "./product.module.css";
import ProductDetailOverlay from './components/productDetailOverlay';
import { apiFetch } from './api';

function Products() {
  const [pro, stpro] = useState([]);
  const [ct, stct] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("interest");
  const loadMoreRef = useRef(null);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const[load_product,set_load_product] = useState(false);
  const[product_to_load,set_product_to_load] = useState({})
  function chn(e) {
    setSearchInput(e.target.value);
  }
  const loadProducts = useCallback(async (nextPage, replace = false) => {
    if (loadingRef.current || (!replace && !hasMoreRef.current)) return;

    loadingRef.current = true;
    setLoading(true);
    const params = new URLSearchParams({
      page: String(nextPage),
      limit: "10",
      sort: sortBy,
    });
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (category) params.set("category", category);

    try {
      const res = await apiFetch(`/api/product/?${params}`, {
        method:"GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Unable to load products");
      const data = await res.json();
      stpro((current) => replace ? data.products : [...current, ...data.products]);
      setPage(nextPage);
      hasMoreRef.current = data.hasMore;
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Product fetch error:", error);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [category, searchQuery, sortBy]);

  useEffect(() => {
    stpro([]);
    setPage(1);
    hasMoreRef.current = true;
    setHasMore(true);
    loadProducts(1, true);
  }, [category, searchQuery, sortBy, loadProducts]);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadProducts(page + 1);
    }, { rootMargin: "240px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [loadProducts, page]);

  function chng(e) {
    stct(e.target.value);
  }

  function changeCategory(e) {
    setCategory(e.target.value);
  }

  const tocrt = async (u) => {
    const res = await apiFetch(`/api/cart/`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: u._id, quantity: Number(ct) || 1 }),
    });

    if (!res.ok) console.error("Unable to add product to cart");
  };

  const ddfv = async (u) => {
    const res = await apiFetch(`/api/favorite/`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: u._id }),
    });

    if (!res.ok) {
      console.error("Unable to add favorite");
    }
  };

  function settofind() {
    setSearchQuery(searchInput);
  }

  function sort() {
    setSortBy((current) => current === "priceAsc" ? "priceDesc" : "priceAsc");
  }

  const productImage = (item) =>
    Array.isArray(item.img) ? item.img[0] : item.img;

  const productCategory = (item) =>
    Array.isArray(item.ctgry) ? item.ctgry.join(", ") : item.ctgry;
  return (
    <>
    {
      load_product && <ProductDetailOverlay product={product_to_load} isOpen = {load_product}
  onClose = {set_load_product} />
    }
      <div className={styles.pageHeader}>Products</div>

      <div className={styles.controls}>
        <input type="text" placeholder="Enter name" onChange={chn} />
        <select id="fruit" name="fruit" onChange={changeCategory}>
          <option value="">All categories</option>
          <option value="electronic">Electronic</option>
          <option value="digi">Digital</option>
        </select>
        <button onClick={settofind}>Search</button>
        <button onClick={sort}>Sort by price</button>
      </div>

      <div className={styles.lldx}>
        {pro.map((u) => (
          <div key={u._id} className={styles.prt}>
            <img
              src={productImage(u)}
              alt=""
              width="140"
              onClick={() => {set_load_product(true) , set_product_to_load(u)}}
            />
            <div className={styles.trt}>
              <button onClick={() => ddfv(u)}>Add to Favorites</button>
            </div>
            <div className={styles.up}>
              Name: {u.nme}
              <br />
              Category: {productCategory(u)}
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
      <div ref={loadMoreRef} className={styles.paginationStatus}>
        {loading && "Loading more products…"}
        {!loading && !hasMore && pro.length > 0 && "You have reached the end."}
      </div>
    </>
  );
}

export default Products;
