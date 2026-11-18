import { useEffect, useMemo, useState } from 'react';
import { useSelector } from "react-redux";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./Ordsd.module.css";
import { apiFetch } from './api';

const INITIAL_LOCATION = { lat: 28.6139, lng: 77.209 };
const markerIcon = L.divIcon({
  className: styles.mapPin,
  html: '<span class="pinCore"></span>',
  iconSize: [34, 42],
  iconAnchor: [17, 42],
});

function MapViewport({ location }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([location.lat, location.lng], Math.max(map.getZoom(), 15), {
      duration: 0.7,
    });
  }, [location, map]);

  return null;
}

function MapClickHandler({ onMove }) {
  useMapEvents({
    click(event) {
      onMove({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });

  return null;
}

function Ordsd(props) {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState(INITIAL_LOCATION);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [notice, setNotice] = useState("");
  const [success, setSuccess] = useState(false);

  const nm = useSelector((st) => st.user.nme);

  const mapCenter = useMemo(() => [location.lat, location.lng], [location]);

  const reverseGeocode = async (nextLocation) => {
    setIsResolving(true);
    setLocation(nextLocation);
    setLocationConfirmed(false);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${nextLocation.lat}&lon=${nextLocation.lng}`
      );
      if (!response.ok) throw new Error("Could not resolve this location");
      const data = await response.json();
      setSelectedAddress(data.display_name || `${nextLocation.lat.toFixed(5)}, ${nextLocation.lng.toFixed(5)}`);
      setSearch(data.display_name || "");
    } catch {
      setSelectedAddress(`${nextLocation.lat.toFixed(5)}, ${nextLocation.lng.toFixed(5)}`);
      setSearch("");
      setNotice("We found the spot, but could not load its street address.");
    } finally {
      setIsResolving(false);
    }
  };

  const searchLocation = async (event) => {
    event.preventDefault();
    if (!search.trim()) return;
    setIsSearching(true);
    setNotice("");
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(search)}`
      );
      if (!response.ok) throw new Error("Search failed");
      const results = await response.json();
      if (!results.length) {
        setNotice("No location found. Try a nearby landmark, street, or postcode.");
        return;
      }
      const result = results[0];
      const nextLocation = { lat: Number(result.lat), lng: Number(result.lon) };
      setLocation(nextLocation);
      setSelectedAddress(result.display_name);
      setSearch(result.display_name);
      setLocationConfirmed(false);
    } catch {
      setNotice("Location search is unavailable right now. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setNotice("Your browser does not support location access.");
      return;
    }
    setNotice("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => reverseGeocode({ lat: coords.latitude, lng: coords.longitude }),
      () => setNotice("Location access was declined. Search for your address instead.")
    );
  }

  const setdn = async () => {
    if (!locationConfirmed || !selectedAddress) {
      setNotice("Confirm the pin location before placing your order.");
      return;
    }
    const formdt = new FormData();
    formdt.append("user", nm);
    formdt.append("item", props.dt.nme);
    formdt.append("unt", props.dt.cartCount);
    formdt.append("sttus", false);

    const qty = props.dt.cartCount;
    const unitPrice = props.dt.price;
    const discount = props.dt.discount;
    const finalPrice = qty * (unitPrice - (unitPrice * discount / 100));
    formdt.append("price", finalPrice.toFixed(2));
    formdt.append("count", props.dt.cartCount);
    formdt.append("itemid", props.dt._id);
    formdt.append("ddrss", selectedAddress);
    formdt.append("latitude", location.lat.toString());
    formdt.append("longitude", location.lng.toString());

    try {
      const res = await apiFetch(`/api/order/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: props.dt._id, quantity: Number(props.dt.cartCount), ddrss: selectedAddress }),
      });
      if (!res.ok) throw new Error("Order request failed");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setNotice("We could not place your order. Please try again.");
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.orderContainer}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>DELIVERY POINT</p>
            <h2>Where should we bring it?</h2>
            <p className={styles.helper}>Search your address, then fine-tune the pin on the map.</p>
          </div>
          <span className={styles.stepBadge}><button onClick={() => props.onClose(false)}>X</button></span>
        </div>

        {success && <div className={styles.successMessage}>Order placed successfully.</div>}

        <form className={styles.searchRow} onSubmit={searchLocation}>
          <span className={styles.searchIcon} aria-hidden="true">⌕</span>
          <input
            type="search"
            value={search}
            placeholder="Search street, landmark or postcode"
            onChange={(event) => {
              setSearch(event.target.value);
              setLocationConfirmed(false);
            }}
            className={styles.inputBox}
            aria-label="Search delivery address"
          />
          <button type="submit" className={styles.searchButton} disabled={isSearching}>
            {isSearching ? "..." : "Find"}
          </button>
        </form>

        <div className={styles.mapShell}>
          <MapContainer center={mapCenter} zoom={13} scrollWheelZoom className={styles.map}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapViewport location={location} />
            <MapClickHandler onMove={reverseGeocode} />
            <Marker
              position={mapCenter}
              icon={markerIcon}
              draggable
              eventHandlers={{
                dragend: (event) => {
                  const marker = event.target;
                  const next = marker.getLatLng();
                  reverseGeocode({ lat: next.lat, lng: next.lng });
                },
              }}
            />
          </MapContainer>
          <button type="button" className={styles.locateButton} onClick={useCurrentLocation}>
            <span aria-hidden="true">◎</span> Use my location
          </button>
          <div className={styles.mapHint}>Drag the pin to your doorstep</div>
        </div>

        <div className={styles.selectedLocation}>
          <div className={styles.locationMarker} aria-hidden="true">●</div>
          <div>
            <p className={styles.locationLabel}>SELECTED LOCATION</p>
            <p className={styles.addressText}>
              {isResolving ? "Finding the address..." : selectedAddress || "Search or tap the map to choose a location"}
            </p>
          </div>
        </div>

        {notice && <p className={styles.notice} role="alert">{notice}</p>}

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.confirmButton} ${locationConfirmed ? styles.confirmed : ""}`}
            onClick={() => {
              if (selectedAddress) {
                setLocationConfirmed(true);
                setNotice("");
              } else {
                setNotice("Choose a location on the map first.");
              }
            }}
            disabled={isResolving}
          >
            {locationConfirmed ? "Location confirmed" : "Confirm this location"}
          </button>
          <button onClick={setdn} className={styles.orderButton} disabled={!locationConfirmed}>
            Place order <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Ordsd;
