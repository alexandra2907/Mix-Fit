import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { uploadImage, thumbnail, lensUrl } from "../cloudinary";
import { SOURCES, formatPrice } from "../config";
import PhotoPicker from "../components/PhotoPicker";
import PriceEditor from "../components/PriceEditor";

const CATEGORIES = ["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories"];

function Closet() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState("");
  const [priceUnknown, setPriceUnknown] = useState(false);
  const [source, setSource] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const q = query(collection(db, "clothes"), where("ownerId", "==", user.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setItems(list);
      },
      () => setError("Could not load your closet.")
    );
    return unsubscribe;
  }, [user.uid]);

  const knownPrices = items.filter((i) => i.price !== null && i.price !== undefined);
  const total = knownPrices.reduce((sum, i) => sum + i.price, 0);
  const unknownCount = items.length - knownPrices.length;

  async function handleAdd(event) {
    event.preventDefault();
    setError("");
    setUploading(true);
    try {
      let imageURL = null;
      if (file) {
        imageURL = await uploadImage(file);
      }
      await addDoc(collection(db, "clothes"), {
        ownerId: user.uid,
        name: name,
        category: category,
        price: priceUnknown || price === "" ? null : Number(price),
        source: source === "" ? null : source,
        imageURL: imageURL,
        createdAt: serverTimestamp(),
      });
      setName("");
      setPrice("");
      setPriceUnknown(false);
      setSource("");
      setFile(null);
    } catch (err) {
      setError("Could not save the item: " + (err.message || err.code));
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteDoc(doc(db, "clothes", id));
    } catch (err) {
      setError("Could not delete the item (" + err.code + ").");
    }
  }

  return (
    <div>
      <h1>My closet</h1>

      <div className="card">
        <form onSubmit={handleAdd}>
          <div className="form-row">
            <input
              type="text"
              placeholder="Item name (e.g. Pink blazer)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Price paid (optional)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={priceUnknown}
            />
            <button type="submit" disabled={uploading}>
              {uploading ? "Saving..." : "Add item"}
            </button>
          </div>

          <div className="form-row2 spaced">
            <select value={source} onChange={(e) => setSource(e.target.value)}>
              <option value="">Where did you get it? (optional)</option>
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <label className="check">
              <input
                type="checkbox"
                checked={priceUnknown}
                onChange={(e) => {
                  setPriceUnknown(e.target.checked);
                  if (e.target.checked) setPrice("");
                }}
              />
              I don't remember the price
            </label>
          </div>
          {priceUnknown && (
            <p className="muted">
              No problem. Save the item with a photo, then use Find online on its
              card and add the price once you find it.
            </p>
          )}

          <div className="spaced">
            <PhotoPicker file={file} onChange={setFile} onError={setError} />
          </div>
        </form>
      </div>

      {error && <p className="error">{error}</p>}

      {items.length > 0 && (
        <div className="card summary">
          <div>
            <span className="muted">Items</span>
            <strong>{items.length}</strong>
          </div>
          <div>
            <span className="muted">Total value</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          <div>
            <span className="muted">Without price</span>
            <strong>{unknownCount}</strong>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <p className="empty">Your closet is empty. Add your first item above.</p>
      ) : (
        <div className="grid">
          {items.map((item) => (
            <div className="card item-card" key={item.id}>
              {item.imageURL ? (
                <img
                  className="item-photo-img"
                  src={thumbnail(item.imageURL)}
                  alt={item.name}
                />
              ) : (
                <div className="item-photo">{item.name.charAt(0).toUpperCase()}</div>
              )}
              <div className="item-body">
                <h3>{item.name}</h3>
                <span className="tag">{item.category}</span>
                {item.source && <p className="muted source">{item.source}</p>}
                <PriceEditor item={item} onError={setError} />
                <div className="item-actions">
                  {item.imageURL && (
                    <button
                      className="btn-ghost btn-small"
                      onClick={() =>
                        window.open(lensUrl(item.imageURL), "_blank", "noopener")
                      }
                    >
                      Find online
                    </button>
                  )}
                  <button
                    className="btn-ghost btn-small"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Closet;