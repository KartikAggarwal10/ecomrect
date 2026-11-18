import { useState } from 'react';
import styles from "./Prodd.module.css";
import { apiFetch } from './api';

function Proddd() {
  const [form, setForm] = useState({
    name: "",
    stock: "",
    price: "",
    discount: "0",
    description: "",
  });
  const [categories, setCategories] = useState([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const addCategory = () => {
    const value = categoryInput.trim();
    if (!value || categories.includes(value) || categories.length >= 10) return;
    setCategories((current) => [...current, value]);
    setCategoryInput("");
  };

  const removeCategory = (category) => {
    setCategories((current) => current.filter((item) => item !== category));
  };

  const handleCategoryKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addCategory();
    }
  };

  const handleImageChange = (event) => {
    const selectedImages = Array.from(event.target.files || []);
    if (selectedImages.length > 5) {
      setStatus("Please select a maximum of 5 images.");
      event.target.value = "";
      return;
    }
    setImages(selectedImages);
    setStatus("");
  };

  const sub = async () => {
    if (!form.name.trim() || !form.stock || !form.price || !categories.length || !images.length) {
      setStatus("Name, stock, price, at least one category, and one image are required.");
      return;
    }

    const formData = new FormData();
    formData.append("nme", form.name.trim());
    formData.append("ctgry", JSON.stringify(categories));
    formData.append("count", form.stock);
    formData.append("price", form.price);
    formData.append("discount", form.discount || "0");
    formData.append("description", form.description.trim());
    images.forEach((image) => formData.append("img", image));

    setSubmitting(true);
    setStatus("");
    try {
      const res = await apiFetch(`/api/product/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to add product");
      setStatus("Product added successfully.");
      setForm({ name: "", stock: "", price: "", discount: "0", description: "" });
      setCategories([]);
      setImages([]);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeading}>
        <span>PRODUCT STUDIO</span>
        <h1>Add a product</h1>
        <p>Upload up to five views and describe the product in your own words.</p>
      </div>
      <label>
        Product name
        <input name="name" value={form.name} type="text" placeholder="e.g. Field headphones" onChange={updateField} className={styles.inputField} />
      </label>
      <div className={styles.fieldRow}>
        <label>
          Stock
          <input name="stock" value={form.stock} type="number" min="0" placeholder="0" onChange={updateField} className={styles.inputField} />
        </label>
        <label>
          Price
          <input name="price" value={form.price} type="number" min="0" step="0.01" placeholder="0.00" onChange={updateField} className={styles.inputField} />
        </label>
        <label>
          Discount
          <input name="discount" value={form.discount} type="number" min="0" max="100" placeholder="0" onChange={updateField} className={styles.inputField} />
        </label>
      </div>
      <label>
        Categories
        <div className={styles.categoryInput}>
          <input
            value={categoryInput}
            type="text"
            placeholder="Type a category and press Enter"
            onChange={(event) => setCategoryInput(event.target.value)}
            onKeyDown={handleCategoryKeyDown}
            className={styles.inputField}
          />
          <button type="button" onClick={addCategory} className={styles.addCategoryButton}>Add</button>
        </div>
      </label>
      <div className={styles.categoryList}>
        {categories.map((category) => (
          <span key={category} className={styles.categoryTag}>
            {category}
            <button type="button" onClick={() => removeCategory(category)} aria-label={`Remove ${category}`}>×</button>
          </span>
        ))}
      </div>
      <label>
        Product images <span className={styles.helpText}>(1–5 images)</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImageChange} className={styles.fileInput} />
      </label>
      {images.length > 0 && <p className={styles.fileSummary}>{images.length} image{images.length === 1 ? "" : "s"} selected</p>}
      <label>
        Description
        <textarea name="description" value={form.description} placeholder="What makes this product useful?" onChange={updateField} className={styles.textarea} rows="4" />
      </label>
      {status && <p className={styles.status} role="status">{status}</p>}
      <button type="button" onClick={sub} disabled={submitting} className={styles.button}>
        {submitting ? "Uploading…" : "Submit product"}
      </button>
    </div>
  );
}

export default Proddd;
