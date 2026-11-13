// Change the currency here and it changes everywhere in the app
export const CURRENCY = "RON";

export const SOURCES = [
  "Second-hand (e.g. Vinted)",
  "Store / mall",
  "Online shop",
  "Gift",
  "Other",
];

export function formatPrice(value) {
  return value.toFixed(2) + " " + CURRENCY;
}