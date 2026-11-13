import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { formatPrice } from "../config";

function PriceEditor({ item, onError }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  const hasPrice = item.price !== null && item.price !== undefined;

  function startEditing() {
    setValue(hasPrice ? String(item.price) : "");
    setEditing(true);
  }

  async function save(event) {
    event.preventDefault();
    const number = Number(value);
    if (value === "" || Number.isNaN(number) || number < 0) {
      onError("Please enter a valid price (0 or more).");
      return;
    }
    onError("");
    setSaving(true);
    try {
      await updateDoc(doc(db, "clothes", item.id), { price: number });
      setEditing(false);
    } catch (err) {
      onError("Could not save the price (" + err.code + ").");
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <form onSubmit={save} className="price-edit">
        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
        <button type="submit" className="btn-small" disabled={saving}>
          Save
        </button>
        <button
          type="button"
          className="btn-ghost btn-small"
          onClick={() => setEditing(false)}
        >
          Cancel
        </button>
      </form>
    );
  }

  return (
    <div>
      {hasPrice ? (
        <p className="price">{formatPrice(item.price)}</p>
      ) : (
        <p className="price muted">Price unknown</p>
      )}
      <button type="button" className="btn-ghost btn-small" onClick={startEditing}>
        {hasPrice ? "Change price" : "Add price"}
      </button>
    </div>
  );
}

export default PriceEditor;