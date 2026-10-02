const API_BASE = "http://localhost:5000/api/v1";

function extractCookie(res) {
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) return "";
  const match = setCookie.match(/accessToken=([^;]+)/);
  return match ? `accessToken=${match[1]}` : "";
}

async function run() {
  const timestamp = Date.now();
  const customerEmail = `cust_flow_${timestamp}@test.com`;
  const password = "Password123!";

  console.log("1. Registering customer:", customerEmail);
  const regRes = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Flow Customer", email: customerEmail, password }),
  });
  const regCookie = extractCookie(regRes);
  console.log("Registration response status:", regRes.status, "Cookie obtained:", !!regCookie);

  console.log("2. Logging in as Customer...");
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: customerEmail, password }),
  });
  const customerCookie = extractCookie(loginRes);
  console.log("Customer login status:", loginRes.status, "Cookie:", !!customerCookie);

  console.log("3. Submitting Delivery Application...");
  const appRes = await fetch(`${API_BASE}/delivery-applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": customerCookie,
    },
    body: JSON.stringify({ phone: "9876501234", vehicleType: "Bike", city: "Bengaluru" }),
  });
  const appData = await appRes.json();
  console.log("Application submit status:", appRes.status, "Data:", JSON.stringify(appData, null, 2));

  console.log("4. Logging in as Admin...");
  const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@shoply.com", password: "Admin@123" }),
  });
  const adminCookie = extractCookie(adminLoginRes);
  console.log("Admin login status:", adminLoginRes.status, "Cookie:", !!adminCookie);

  console.log("5. Fetching ALL applications as Admin...");
  const getAllRes = await fetch(`${API_BASE}/delivery-applications`, {
    headers: { "Cookie": adminCookie },
  });
  const getAllData = await getAllRes.json();
  console.log("GET ALL Status:", getAllRes.status, "Count:", getAllData.data?.length);

  console.log("6. Fetching PENDING applications as Admin...");
  const getPendingRes = await fetch(`${API_BASE}/delivery-applications?status=PENDING`, {
    headers: { "Cookie": adminCookie },
  });
  const getPendingData = await getPendingRes.json();
  console.log("GET PENDING Status:", getPendingRes.status, "Count:", getPendingData.data?.length);
  console.log("Pending Applications returned:", JSON.stringify(getPendingData.data, null, 2));
}

run().catch(console.error);
