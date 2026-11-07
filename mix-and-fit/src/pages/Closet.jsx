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
import { uploadImage, thumbnail } from "../cloudinary";

const CATEGORIES = ["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories"];
const MAX_MB = 5;

function Closet() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState("");
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
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

  function handleFileChange(event) {
    const chosen = event.target.files[0];
    setError("");
    if (!chosen) {
      setFile(null);
      return;
    }
    if (!chosen.type.startsWith("image/")) {
      setError("Please choose an image file.");
      setFile(null);
      setFileKey(fileKey + 1);
      return;
    }
    if (chosen.size > MAX_MB * 1024 * 1024) {
      setError("The photo is too big (maximum " + MAX_MB + " MB).");
      setFile(null);
      setFileKey(fileKey + 1);
      return;
    }
    setFile(chosen);
  }

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
        price: price === "" ? null : Number(price),
        imageURL: imageURL,
        createdAt: serverTimestamp(),
      });
      setName("");
      setPrice("");
      setFile(null);
      setFileKey(fileKey + 1);
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
            />
            <button type="submit" disabled={uploading}>
              {uploading ? "Saving..." : "Add item"}
            </button>
          </div>
          <div className="spaced">
            <label className="muted">Photo (optional, max {MAX_MB} MB)</label>
            <input
              key={fileKey}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </form>
      </div>

      {error && <p className="error">{error}</p>}

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
                {item.price !== null && item.price !== undefined && (
                  <p className="price">{item.price}</p>
                )}
                <button
                  className="btn-ghost btn-small"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Closet;