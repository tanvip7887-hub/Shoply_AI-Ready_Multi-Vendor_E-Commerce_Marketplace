import * as cartService from "../cart/cart.service.js";
import * as addressService from "../address/address.service.js";

export const getCheckoutReview = async (userId, addressId) => {
  // 1. Fetch Cart Data
  const cart = await cartService.getCart(userId);
  
  // 2. Fetch User Addresses
  const addresses = await addressService.getAddresses(userId);
  
  // 3. Determine Selected Address
  let selectedAddress = null;
  if (addressId) {
    const requested = addresses.find(a => a.id === addressId);
    if (requested) selectedAddress = requested;
  }
  
  // Fallback to default address if none provided or invalid
  if (!selectedAddress) {
    selectedAddress = addresses.find(a => a.isDefault) || addresses[0] || null;
  }
  
  // 4. Calculate pricing
  // cart.cartSubtotal is sum(effectivePrice * quantity)
  // we need to calculate raw subtotal and total discount
  
  let rawSubtotal = 0;
  let subtotal = 0; // effective subtotal
  
  for (const item of cart.items) {
    if (item.isAvailable) {
      rawSubtotal += item.product.originalPrice * item.quantity;
      subtotal += item.itemSubtotal;
    }
  }
  
  const discount = rawSubtotal - subtotal;
  const deliveryFee = 0; // V1 logic: Free delivery
  const total = subtotal + deliveryFee;
  
  // 5. Validation
  const isValid = 
    cart.items.length > 0 && 
    cart.items.every(item => item.isAvailable) && 
    selectedAddress !== null;
    
  const validationErrors = [];
  if (cart.items.length === 0) validationErrors.push("Your cart is empty.");
  if (cart.items.some(item => !item.isAvailable)) validationErrors.push("Some items in your cart are no longer available.");
  if (!selectedAddress) validationErrors.push("Please select a delivery address.");
  
  return {
    cartId: cart.cartId,
    items: cart.items,
    addresses,
    selectedAddress,
    pricing: {
      itemTotal: rawSubtotal,
      subtotal,
      discount,
      deliveryFee,
      total,
    },
    validation: {
      isValid,
      errors: validationErrors
    }
  };
};
