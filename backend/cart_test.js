import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_BASE = 'http://localhost:5000/api/v1';

async function request(endpoint, method = 'GET', body = null, cookie = '') {
  const headers = { 'Content-Type': 'application/json' };
  if (cookie) headers['Cookie'] = cookie;
  
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  
  const res = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await res.json();
  
  let newCookie = '';
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    newCookie = setCookie.split(';')[0];
  }
  
  return { status: res.status, data, newCookie, headers: res.headers };
}

async function runTests() {
  const timestamp = Date.now();
  const email = `carttest_${timestamp}@example.com`;
  const password = `CartTest@12345`;
  
  let cookie = '';
  
  const results = [];
  function assert(condition, message, evidence) {
    if (condition) {
      results.push({ test: message, status: 'PASS', evidence });
    } else {
      results.push({ test: message, status: 'FAIL', evidence });
      console.error(`FAILED: ${message} - ${JSON.stringify(evidence)}`);
    }
  }

  try {
    // 1. Register temporary customer
    const regRes = await request('/auth/register', 'POST', {
      name: "Cart Test",
      email,
      password,
      phone: `999${Math.floor(Math.random() * 10000000)}`
    });
    assert(regRes.status === 201, "Register temporary customer", regRes.data);

    // Verify email using Prisma
    await prisma.user.update({
      where: { email },
      data: { isEmailVerified: true }
    });

    // 2. Login
    const loginRes = await request('/auth/login', 'POST', {
      email,
      password
    });
    
    if (loginRes.newCookie) {
      cookie = loginRes.newCookie;
    }
    assert(loginRes.status === 200 && cookie, "Login and get session cookie", { status: loginRes.status, hasCookie: !!cookie });

    // Get an active approved product
    const product = await prisma.product.findFirst({
      where: { isActive: true, isDeleted: false, approvalStatus: 'APPROVED' },
      include: { inventory: true, seller: true }
    });
    
    if (!product) throw new Error("No active product found for testing");

    // 4. Add product to cart
    const addRes = await request('/cart/items', 'POST', {
      productId: product.id,
      quantity: 1
    }, cookie);
    assert(addRes.status === 201, "Add product to cart", addRes.data);

    // 6. Open /cart and Verify item appears
    let cartRes = await request('/cart', 'GET', null, cookie);
    assert(cartRes.status === 200 && cartRes.data.data.items.length === 1, "Verify item appears in cart", cartRes.data.data);

    const itemId = cartRes.data.data.items[0].id;

    // 8. Increase quantity
    const incRes = await request(`/cart/items/${itemId}`, 'PATCH', { quantity: 2 }, cookie);
    assert(incRes.status === 200 && incRes.data.data.quantity === 2, "Increase quantity", incRes.data.data);

    // 9. Decrease quantity
    const decRes = await request(`/cart/items/${itemId}`, 'PATCH', { quantity: 1 }, cookie);
    assert(decRes.status === 200 && decRes.data.data.quantity === 1, "Decrease quantity", decRes.data.data);

    // 12. Remove item
    const remRes = await request(`/cart/items/${itemId}`, 'DELETE', null, cookie);
    assert(remRes.status === 200, "Remove item", remRes.data);

    // Verify empty
    cartRes = await request('/cart', 'GET', null, cookie);
    assert(cartRes.data.data.items.length === 0, "Verify cart is empty after remove", cartRes.data.data);

    // 13. Add again
    await request('/cart/items', 'POST', { productId: product.id, quantity: 2 }, cookie);
    
    // 14. Clear cart
    const clearRes = await request('/cart', 'DELETE', null, cookie);
    assert(clearRes.status === 200, "Clear cart", clearRes.data);

    // 15. Verify empty cart
    cartRes = await request('/cart', 'GET', null, cookie);
    assert(cartRes.data.data.items.length === 0, "Verify empty cart after clear", cartRes.data.data);

    // 16. Refresh page and verify persistence (GET /cart again)
    cartRes = await request('/cart', 'GET', null, cookie);
    assert(cartRes.status === 200 && cartRes.data.data.items.length === 0, "Refresh page and verify persistence", cartRes.data.data);

    // 17. Logout
    await request('/auth/logout', 'POST', null, cookie);
    
    // 18. Login again
    const loginRes2 = await request('/auth/login', 'POST', {
      email,
      password
    });
    let cookie2 = loginRes2.newCookie;
    
    // 19. Verify cart persistence
    const cartRes2 = await request('/cart', 'GET', null, cookie2);
    assert(cartRes2.status === 200 && cartRes2.data.data.items.length === 0, "Login again and verify cart persistence", cartRes2.data.data);

    // Stock test
    const origStock = product.inventory.stock;
    const origReserved = product.inventory.reservedStock;
    const origAvailable = product.inventory.availableStock;
    
    const overStockRes = await request('/cart/items', 'POST', { productId: product.id, quantity: origAvailable + 1 }, cookie2);
    assert(overStockRes.status === 409, "Quantity greater than availableStock -> HTTP 409", overStockRes.data);
    
    // Verify inventory exactly unchanged
    const currentInv = await prisma.inventory.findUnique({ where: { id: product.inventory.id } });
    assert(
      currentInv.stock === origStock && currentInv.reservedStock === origReserved && currentInv.availableStock === origAvailable, 
      "Verify inventory values remain exactly unchanged", 
      currentInv
    );

    // Availability tests - safely change product states and revert
    // Test: Out of stock
    await prisma.inventory.update({ where: { id: product.inventory.id }, data: { stock: 0, availableStock: 0, status: 'OUT_OF_STOCK' }});
    const outOfStockRes = await request('/cart/items', 'POST', { productId: product.id, quantity: 1 }, cookie2);
    assert(outOfStockRes.status === 409, "Verify out-of-stock product is rejected", outOfStockRes.data);
    // Restore inventory
    await prisma.inventory.update({ where: { id: product.inventory.id }, data: { stock: origStock, availableStock: origAvailable, status: product.inventory.status }});

    // Test: Inactive
    await prisma.product.update({ where: { id: product.id }, data: { isActive: false }});
    const inactiveRes = await request('/cart/items', 'POST', { productId: product.id, quantity: 1 }, cookie2);
    assert(inactiveRes.status === 404, "Verify inactive product is rejected", inactiveRes.data);
    await prisma.product.update({ where: { id: product.id }, data: { isActive: true }});

    // Test: Rejected
    await prisma.product.update({ where: { id: product.id }, data: { approvalStatus: 'REJECTED' }});
    const rejectedRes = await request('/cart/items', 'POST', { productId: product.id, quantity: 1 }, cookie2);
    assert(rejectedRes.status === 404, "Verify rejected product is rejected", rejectedRes.data);
    await prisma.product.update({ where: { id: product.id }, data: { approvalStatus: 'APPROVED' }});

    // Test: Suspended Seller
    const origSellerStatus = product.seller.status;
    await prisma.seller.update({ where: { id: product.seller.id }, data: { status: 'SUSPENDED' }});
    const suspendedRes = await request('/cart/items', 'POST', { productId: product.id, quantity: 1 }, cookie2);
    assert(suspendedRes.status === 403, "Verify suspended seller rejected", suspendedRes.data);
    await prisma.seller.update({ where: { id: product.seller.id }, data: { status: origSellerStatus }});

  } catch (error) {
    console.error("Test execution failed:", error.message || error);
  } finally {
    console.log(JSON.stringify(results, null, 2));
    await prisma.$disconnect();
  }
}

runTests();
