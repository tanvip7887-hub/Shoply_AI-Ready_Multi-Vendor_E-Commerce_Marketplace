import { Link } from "react-router-dom";

import ethnicImg from "../../assets/ethnic.webp";
import westernImg from "../../assets/western.webp";
import menswearImg from "../../assets/menwear.webp";
import footwearImg from "../../assets/footwear.webp";
import homedecorImg from "../../assets/homedecor.webp";
import beautyImg from "../../assets/beauty.webp";
import accessoriesImg from "../../assets/accessories.webp";
import groceryImg from "../../assets/grocery.webp";

const MOCK_CATEGORIES = [
  { id: 1, name: "Ethnic Wear", image: ethnicImg },
  { id: 2, name: "Western Dresses", image: westernImg },
  { id: 3, name: "Menswear", image: menswearImg },
  { id: 4, name: "Footwear", image: footwearImg },
  { id: 5, name: "Home Decor", image: homedecorImg },
  { id: 6, name: "Beauty", image: beautyImg },
  { id: 7, name: "Accessories", image: accessoriesImg },
  { id: 8, name: "Grocery", image: groceryImg },
];

const CategorySection = () => {
  return (
    <section className="w-full bg-white py-8 px-4 md:px-10 lg:px-14 overflow-hidden">
      <div className="max-w-[1400px] mx-auto flex justify-center lg:justify-between items-center flex-wrap gap-4 md:gap-6">
        {MOCK_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            to={`/products?category=${encodeURIComponent(cat.name)}`}
            className="group flex flex-col items-center shrink-0 w-[100px] sm:w-[120px] md:w-[150px]"
            style={{ textDecoration: "none" }}
          >
            {/* Circle Container */}
            <div
              className="flex items-center justify-center overflow-hidden transition-transform duration-250 ease-out group-hover:scale-105 rounded-full bg-[#F9EEF7] w-[90px] h-[90px] sm:w-[120px] sm:h-[120px] md:w-[150px] md:h-[150px]"
            >
              {/* Image */}
              {cat.image ? (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-[85%] h-[85%] object-cover object-center transition-transform duration-250 ease-out group-hover:scale-105"
                />
              ) : (
                <div
                  className="w-[85%] h-[85%] bg-[#e0d4df] rounded-full"
                />
              )}
            </div>

            {/* Category Name */}
            <span
              className="mt-3 md:mt-4 text-center transition-colors duration-250 ease-out group-hover:text-[#570D48] text-sm md:text-base text-[#333333] font-normal"
            >
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;