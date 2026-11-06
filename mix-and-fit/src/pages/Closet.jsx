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

      <form onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Item name (e.g. Pink blazer)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <br />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <br />
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Price paid (optional)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <br />
        <button type="submit">Add item</button>
      </form>

      {error && <p>{error}</p>}

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name} ({item.category})
            {item.price !== null && item.price !== undefined && " - " + item.price}
            <button onClick={() => handleDelete(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Closet;