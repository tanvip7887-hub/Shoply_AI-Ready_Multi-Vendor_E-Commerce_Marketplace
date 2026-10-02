const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 mt-12">
    <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
      <div>
        <h3 className="text-white font-semibold mb-3">Meesho</h3>
        <ul className="space-y-2">
          <li>About Us</li>
          <li>Careers</li>
          <li>Meesho Blog</li>
        </ul>
      </div>
      <div>
        <h3 className="text-white font-semibold mb-3">Customer Policy</h3>
        <ul className="space-y-2">
          <li>Return Policy</li>
          <li>Terms Of Use</li>
          <li>Privacy Policy</li>
        </ul>
      </div>
      <div>
        <h3 className="text-white font-semibold mb-3">Sell on Meesho</h3>
        <ul className="space-y-2">
          <li>Become a Seller</li>
          <li>Seller Support</li>
        </ul>
      </div>
      <div>
        <h3 className="text-white font-semibold mb-3">Help</h3>
        <ul className="space-y-2">
          <li>Payments</li>
          <li>Shipping</li>
          <li>FAQ</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-gray-800 text-center text-xs py-4 text-gray-500">
      © 2026 shoply — built for learning purposes
    </div>
  </footer>
);

export default Footer;