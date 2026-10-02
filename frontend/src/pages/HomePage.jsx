import { useEffect, useState } from "react";
import { categoryApi } from "../api/category.api.js";
import { productApi } from "../api/product.api.js";

import HeroBanner from "../components/common/HeroBanner.jsx";
import TrustBar from "../components/common/TrustBar.jsx";
import CategorySection from "../components/common/CategorySection.jsx";
import ProductCard from "../components/ui/ProductCard.jsx";
import ProductCardSkeleton from "../components/ui/ProductCardSkeleton.jsx";

// Change this filename if your image has a different name
import heroImage from "../assets/hero_banner.png";
import GoldBanner from "../components/common/GoldBanner.jsx";

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getAll({ parentId: "null" });
        setCategories(res.data || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await productApi.getAll({
          limit: 12,
          sortBy: "newest",
        });

        setProducts(res.data?.items || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchCategories();
    fetchProducts();
  }, []);

  return (
    <>
      <HeroBanner imageUrl={heroImage} />

      <TrustBar />

      <main id="shop-section">
        <CategorySection
          categories={categories}
          isLoading={loadingCategories}
        />

        <GoldBanner />

        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">
              Trending Products
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
            {loadingProducts ? (
              Array.from({ length: 12 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))
            ) : products.length > 0 ? (
              products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                No products available.
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default HomePage;