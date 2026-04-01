export function buildFakeHash({ model, serial, wallet, expiry }) {
  const raw = `${model}|${serial}|${wallet}|${expiry}`;
  let hash = 0;

  for (let i = 0; i < raw.length; i += 1) {
    hash = (Math.imul(31, hash) + raw.charCodeAt(i)) | 0;
  }

  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return (`0x${hex.repeat(8)}`).slice(0, 66);
}
