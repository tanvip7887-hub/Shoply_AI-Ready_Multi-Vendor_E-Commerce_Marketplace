import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Button from "../components/ui/Button.jsx";
import sellerImage from "../assets/seller_page.png";

const stats = [
    { prefix: "Lakhs of", desc: "Sellers trust Meesho to sell online" },
    { prefix: "Crores of", desc: "Customers buying across India" },
    { prefix: "Thousands of", desc: "Serviceable pincodes across India — we deliver everywhere." },
    { prefix: "Hundreds of", desc: "Categories to sell online" },
];

const steps = [
    {
        num: 1,
        title: "Create Account",
        body: (
            <>
                All you need is:
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                    <li>GSTIN (for GST sellers) or Enrolment ID / UIN (for non-GST sellers)</li>
                    <li>Bank Account</li>
                </ul>
            </>
        ),
    },
    { num: 2, title: "List Products", body: "List the products you want to sell in your supplier panel" },
    { num: 3, title: "Get Orders", body: "Start getting orders from crores of Indians actively shopping on our platform." },
    { num: 4, title: "Affordable Shipping", body: "Enjoy affordable shipping to customers across India" },
    { num: 5, title: "Receive Payments", body: "Payments are deposited directly to your bank account following a 7-day payment cycle from order delivery." },
];

const navLinks = ["Sell Online", "How it works", "Pricing & Commission", "Shipping & Returns", "Grow Business", "Don't have GST?"];

const BecomeSellerPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    const scrollToSection = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    const handleStartSelling = () => {
        if (isAuthenticated && user?.role === "SELLER") {
            navigate("/seller/products");
        } else if (isAuthenticated) {
            // Logged in as customer — seller application form isn't built yet.
            navigate("/seller/apply");
        } else {
            navigate("/register");
        }
    };

    return (
        <div>
            {/* Marketing-page header — intentionally separate from the shop Navbar,
          since this is a landing page for prospective sellers, not shoppers. */}
            <header className="border-b border-gray-200 bg-white">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/sell-on-meesho" className="text-2xl font-extrabold text-brand-600">
                        shoply
                    </Link>
                    <nav className="hidden lg:flex items-center gap-7 text-sm text-gray-700">
                        <button onClick={() => scrollToSection("hero")} className="hover:text-brand-600 transition-base whitespace-nowrap">
                            Sell Online
                        </button>
                        <button onClick={() => scrollToSection("how-it-works")} className="hover:text-brand-600 transition-base whitespace-nowrap">
                            How it works
                        </button>
                        {navLinks.slice(2).map((link) => (
                            <span key={link} className="hover:text-brand-600 transition-base cursor-pointer whitespace-nowrap">
                                {link}
                            </span>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            onClick={handleStartSelling}
                            className="bg-brand-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-brand-700 transition-base"
                        >
                            Start Selling
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section id="hero" className="bg-brand-50">
                <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                            Sell online to Crores of Customers at{" "}
                            <span className="text-brand-600">0% Commission</span>
                        </h1>
                        <p className="text-gray-600 mt-4 text-lg">
                            Become a Meesho seller and grow your business across India
                        </p>

                        <Button onClick={handleStartSelling} className="mt-8 !px-8 !py-3 text-base">
                            Start Selling
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="aspect-square rounded-full bg-brand-100 overflow-hidden flex items-end justify-center">
                            <img
                                src={sellerImage}
                                alt="Become a Meesho seller"
                                className="max-h-full w-auto object-contain"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {stats.map((stat) => (
                        <div key={stat.prefix} className="bg-gray-50 rounded-xl p-7">
                            <h3 className="text-xl font-extrabold text-brand-600 mb-2">{stat.prefix}</h3>
                            <p className="text-lg font-extrabold text-gray-900 leading-snug">{stat.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How it works */}
            <section id="how-it-works" className="bg-brand-50 py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-10">How it works</h2>

                    <div className="bg-white rounded-2xl p-10 shadow-sm">

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-4">
                            {steps.map((step, i) => (
                                <div key={step.num} className="relative">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold shrink-0">
                                            {step.num}
                                        </div>
                                        {i < steps.length - 1 && (
                                            <div className="hidden md:block flex-1 h-0.5 bg-brand-300 ml-2" />
                                        )}
                                    </div>
                                    <h3 className="font-bold text-gray-900 mt-4 mb-2">{step.title}</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">{step.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BecomeSellerPage;