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

const CATEGORIES = ["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories"];

function Closet() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState("");
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

  async function handleAdd(event) {
    event.preventDefault();
    setError("");
    try {
      await addDoc(collection(db, "clothes"), {
        ownerId: user.uid,
        name: name,
        category: category,
        price: price === "" ? null : Number(price),
        createdAt: serverTimestamp(),
      });
      setName("");
      setPrice("");
    } catch (err) {
      setError("Could not save the item (" + err.code + ").");
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
        <form onSubmit={handleAdd} className="form-row">
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
          <button type="submit">Add item</button>
        </form>
      </div>

      {error && <p className="error">{error}</p>}

      {items.length === 0 ? (
        <p className="empty">Your closet is empty. Add your first item above.</p>
      ) : (
        <div className="grid">
          {items.map((item) => (
            <div className="card item-card" key={item.id}>
              <div className="item-photo">{item.name.charAt(0).toUpperCase()}</div>
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