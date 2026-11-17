import { useEffect, useMemo, useState } from "react";
import styles from "./ProductDetailOverlay.module.css";
const defaultImageBaseUrl = "http://localhost:5000/";

function imageUrl(image, imageBaseUrl) {
  const path = typeof image === "string" ? image : image?.url || image?.path;
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return imageBaseUrl + path.replaceAll("\\", "/").replace(/^\/+/, "");
}

function ProductDetailOverlay({
  product,
  isOpen,
  onClose,
  imageBaseUrl = defaultImageBaseUrl,
}) {
  const [activeImage, setActiveImage] = useState(0);

  const images = useMemo(() => {
    if (!product) return [];
    const storedImages = Array.isArray(product.img)
      ?  product.img
      : [product.img];

    return storedImages
  }, [ product]);

  useEffect(() => {
    setActiveImage(0);
  }, [product]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const moveImage = (direction) => {
    setActiveImage(
      (current) => (current + direction + images.length) % images.length,
    );
  };

  const name = product.nme || product.name || "Product";
  const category = product.ctgry || product.category || "Uncategorized";
  const price = Number(product.price);
  const quantity = product.count ?? product.quantity ?? "Not specified";
  const discount = product.discount ?? 0;

  return (
    <div
       className={styles.backdrop}
      role="presentation"
    >
      <section
         className={styles.panel}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
      >
        <button
          type="button"
           className={styles.close}
          onClick={() => onClose(false)}
          aria-label="Close product details"
        >
          ×
        </button>

        <div  className={styles.gallery}>
          <div  className={styles.imageStage}>
            {images.length > 0 ? (
              <img
                src={images[activeImage]}
                alt={`${name} view ${activeImage + 1}`}
                 className={styles.image}
              />
            ) : (
              <div  className={styles.noImage}>No image available</div>
            )}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                   className={{ ...styles.arrow, left: 16 }}
                  onClick={() => moveImage(-1)}
                  aria-label="Previous image"
                >
                  ←
                </button>
                <button
                  type="button"
                   className={{ ...styles.arrow, right: 16 }}
                  onClick={() => moveImage(1)}
                  aria-label="Next image"
                >
                  →
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div  className={styles.thumbnails} aria-label="Product images">
              {images.map((image, index) => (
                <button
                  type="button"
                  key={`${image}-${index}`}
                  onClick={() => setActiveImage(index)}
                   className={{
                    ...styles.thumbnail,
                    ...(index === activeImage ? styles.selectedThumbnail : {}),
                  }}
                  aria-label={`Show image ${index + 1}`}
                >
                  <img src={image} alt=""  className={styles.thumbnailImage} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div  className={styles.details}>
          <span  className={styles.eyebrow}>Product details</span>
          <h2 id="product-detail-title"  className={styles.title}>{name}</h2>
          <p  className={styles.category}>{category}</p>
          <div  className={styles.priceRow}>
            <strong  className={styles.price}>
              {Number.isFinite(price) ? `₹${price.toLocaleString()}` : "Price unavailable"}
            </strong>
            <span  className={styles.discount}>{discount}% off</span>
          </div>
          <div  className={styles.rule} />
          <dl  className={styles.specifications}>
            <div  className={styles.specification}>
              <dt>Availability</dt>
              <dd>{quantity === 0 ? "Out of stock" : "In stock"}</dd>
            </div>
            <div  className={styles.specification}>
              <dt>Quantity available</dt>
              <dd>{quantity}</dd>
            </div>
            <div  className={styles.specification}>
              <dt>Category</dt>
              <dd>{category}</dd>
            </div>
            {product.description && (
              <div  className={styles.description}>
                <dt>Description</dt>
                <dd>{product.description}</dd>
              </div>
            )}
          </dl>
        </div>
      </section>
    </div>
  );
}

export default ProductDetailOverlay;
