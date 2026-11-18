import { useEffect, useState } from 'react';
import styles from './Fvr.module.css';

function Fvr() {
  const [favorites, setFavorites] = useState([]);
  const [preview, setPreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    fetch(`/api/favorite/`, {method:"GET", credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Unable to load favorites");
        return res.json();
      })
      .then((data) => setFavorites(data.items || []))
      .catch((error) => console.error("Favorites fetch error:", error));
  }, []);

  const getImages = (product) => {
    if (Array.isArray(product.img)) return product.img.filter(Boolean);
    return product.img ? [product.img] : [];
  };

  const openPreview = (product) => {
    setPreview(product);
    setCurrentImage(0);
  };

  const closePreview = () => {
    setPreview(null);
    setCurrentImage(0);
  };

  const showNextImage = () => {
    const images = getImages(preview);
    setCurrentImage((index) => (index + 1) % images.length);
  };

  const showPreviousImage = () => {
    const images = getImages(preview);
    setCurrentImage((index) => (index - 1 + images.length) % images.length);
  };

  const fvrrem = async (product) => {
    const res = await fetch(`/api/favorite/remove`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: product._id }),
    });

    if (!res.ok) {
      console.error("Unable to remove favorite");
      return;
    }

    setFavorites((items) => items.filter((item) => item._id !== product._id));
    if (preview?._id === product._id) closePreview();
  };

  return (
    <div className={styles.fvrcontainer}>
      <div className={styles.fvrtitle}>Your Favorites</div>
      {favorites.length === 0 ? (
        <p className={styles.emptyState}>No favorite products yet.</p>
      ) : (
        <div className={styles.favoriteGrid}>
          {favorites.map((product) => {
            const images = getImages(product);
            return (
              <article key={product._id} className={styles.fvritem}>
                <button
                  type="button"
                  className={styles.previewButton}
                  onClick={() => openPreview(product)}
                  aria-label={`Preview ${product.nme}`}
                >
                  <img
                    src={images[0]}
                    alt={product.nme}
                    className={styles.productimg}
                  />
                  <span className={styles.imageBadge}>
                    {images.length > 1 ? `${images.length} images` : 'Preview'}
                  </span>
                </button>
                <div className={styles.productdetails}>
                  <p className={styles.category}>{product.ctgry}</p>
                  <h2>{product.nme}</h2>
                  <p>{product.description || 'No description available.'}</p>
                  <strong>₹{Number(product.price || 0).toLocaleString()}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => fvrrem(product)}
                  className={styles.removebtn}
                >
                  Remove
                </button>
              </article>
            );
          })}
        </div>
      )}

      {preview && (
        <div
          className={styles.previewOverlay}
          onClick={closePreview}
          role="dialog"
          aria-modal="true"
          aria-label={`${preview.nme} preview`}
        >
          <div className={styles.previewModal} onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className={styles.closeButton}
              onClick={closePreview}
              aria-label="Close preview"
            >
              ×
            </button>
            <div className={styles.slider}>
              {getImages(preview).length > 1 && (
                <button
                  type="button"
                  className={`${styles.sliderButton} ${styles.previousButton}`}
                  onClick={showPreviousImage}
                  aria-label="Previous image"
                >
                  ‹
                </button>
              )}
              <img
                src={getImages(preview)[currentImage]}
                alt={`${preview.nme} ${currentImage + 1}`}
                className={styles.previewImage}
              />
              {getImages(preview).length > 1 && (
                <button
                  type="button"
                  className={`${styles.sliderButton} ${styles.nextButton}`}
                  onClick={showNextImage}
                  aria-label="Next image"
                >
                  ›
                </button>
              )}
            </div>
            {getImages(preview).length > 1 && (
              <div className={styles.dots} aria-label="Image selector">
                {getImages(preview).map((image, index) => (
                  <button
                    type="button"
                    key={image}
                    className={`${styles.dot} ${index === currentImage ? styles.activeDot : ''}`}
                    onClick={() => setCurrentImage(index)}
                    aria-label={`Show image ${index + 1}`}
                  />
                ))}
              </div>
            )}
            <div className={styles.previewDetails}>
              <p className={styles.category}>{preview.ctgry}</p>
              <h2>{preview.nme}</h2>
              <p>{preview.description || 'No description available.'}</p>
              <div className={styles.priceRow}>
                <strong>₹{Number(preview.price || 0).toLocaleString()}</strong>
                <span>{Number(preview.discount || 0)}% off</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Fvr;
