async function test() {
  try {
    const res = await fetch('http://localhost:4000/api/purchase-returns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplierId: 1,
        returnDate: '2026-05-15',
        grandTotal: 100,
        items: [
          {
            productId: 1,
            quantity: 1,
            unit: 'Bag',
            purchasePrice: 100,
            totalAmount: 100,
            expiryDate: ""
          }
        ]
      })
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log(text);
  } catch (e) {
    console.error(e);
  }
}
test();
