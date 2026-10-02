import { Link } from "react-router-dom";
import goldBannerBg from "../../assets/gold.webp";
import lehengasImg from "../../assets/lehengas.webp";
import menImg from "../../assets/men.webp";
import sareesImg from "../../assets/sarees.webp";
import jewelleryImg from "../../assets/jewellery.webp";

const GOLD_ITEMS = [
  { id: 1, title: "Lehengas", image: lehengasImg, link: "/products?category=Lehengas" },
  { id: 2, title: "Menwear", image: menImg, link: "/products?category=Menswear" },
  { id: 3, title: "Sarees", image: sareesImg, link: "/products?category=Sarees" },
  { id: 4, title: "Jewellery", image: jewelleryImg, link: "/products?category=Jewellery" },
];

const GoldBanner = () => {
  return (
    <section className="w-full bg-[#3c1e19]">
      <div className="relative w-full max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-end min-h-[400px] py-10 px-4 md:px-16 overflow-hidden">
        {/* Background Image (Left side banner content) */}
        <div className="absolute inset-0 z-0">
          <img
            src={goldBannerBg}
            alt="Meesho Gold"
            className="w-full h-full object-cover object-left"
          />
        </div>

        {/* Right side Grid for 4 items */}
        <div className="relative z-10 grid grid-cols-2 gap-x-8 gap-y-10 ml-auto mt-40 md:mt-0 md:mr-10">
          {GOLD_ITEMS.map((item) => (
            <Link
              key={item.id}
              to={item.link}
              className="group relative flex flex-col items-center overflow-hidden transition-transform duration-300 hover:scale-105 w-[120px] md:w-[140px]"
              style={{
                borderRadius: "100px 100px 8px 8px", // Arch shape
                border: "1.5px solid #d4af37", // Gold border
                aspectRatio: "3/4",
                backgroundColor: "rgba(0,0,0,0.1)",
              }}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover object-top"
              />
              
              {/* Dark gradient overlay at the bottom for text readability */}
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/90 to-transparent flex items-end justify-center pb-3">
                <span className="text-[#fde08b] font-medium tracking-wide text-[14px]">
                  {item.title}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GoldBanner;
