async function test() {
  try {
    const res = await fetch('http://localhost:4000/api/suppliers?q=d&limit=20');
    console.log("Status:", res.status);
    const data = await res.text();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}
test();
