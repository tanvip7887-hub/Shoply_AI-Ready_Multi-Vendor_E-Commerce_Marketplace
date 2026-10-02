import axios from "axios";

async function test() {
  const axiosClient = axios.create({ baseURL: "http://localhost:5000/api/v1", withCredentials: true });
  
  // We need to login first to get the cookie
  try {
    const res = await axiosClient.post("/auth/login", { email: "customer@example.com", password: "password123" });
    const cookie = res.headers["set-cookie"];
    
    const cartRes = await axiosClient.get("/cart", { headers: { Cookie: cookie } });
    console.log("Cart Response Data:", JSON.stringify(cartRes.data, null, 2));
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}

test();
