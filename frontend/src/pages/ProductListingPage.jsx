import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import { productApi } from "../api/product.api.js";
import { categoryApi } from "../api/category.api.js";
import { brandApi } from "../api/brand.api.js";
import FilterSidebar from "../components/common/FilterSidebar.jsx";
import ProductCard from "../components/ui/ProductCard.jsx";
import ProductCardSkeleton from "../components/ui/ProductCardSkeleton.jsx";
import Pagination from "../components/ui/Pagination.jsx";

const ProductListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingFilters, setLoadingFilters] = useState(true);

  const filters = {
    search: searchParams.get("search") || "",
    categoryId: searchParams.get("categoryId") || "",
    brandId: searchParams.get("brandId") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sortBy: searchParams.get("sortBy") || "newest",
    page: Number(searchParams.get("page")) || 1,
  };

  // Load filter sidebar data once — categories/brands don't change per search.
  useEffect(() => {
    Promise.all([categoryApi.getAll({ parentId: "null" }), brandApi.getAll({ isActive: "true" })])
      .then(([catRes, brandRes]) => {
        setCategories(catRes.data);
        setBrands(brandRes.data);
      })
      .finally(() => setLoadingFilters(false));
  }, []);

  // Re-fetch products whenever the URL's query params change.
  useEffect(() => {
    setLoadingProducts(true);
    const params = Object.fromEntries(
      Object.entries({
        search: filters.search || undefined,
        categoryId: filters.categoryId || undefined,
        brandId: filters.brandId || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        sortBy: filters.sortBy,
        page: filters.page,
        limit: 12,
      }).filter(([, v]) => v !== undefined)
    );

    productApi
      .getAll(params)
      .then((res) => {
        setProducts(res.data.items);
        setPagination({ page: res.data.page, totalPages: res.data.totalPages });
      })
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, [searchParams]);

  const updateFilters = (updates, replace = false) => {
    const next = replace ? {} : Object.fromEntries(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next[key] = value;
      else delete next[key];
    });
    next.page = 1; // any filter change resets pagination
    setSearchParams(next);
  };

  const handlePageChange = (page) => {
    setSearchParams({ ...Object.fromEntries(searchParams), page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {filters.search && (
        <p className="text-sm text-gray-500 mb-4">
          Showing results for <span className="font-semibold text-gray-900">"{filters.search}"</span>
        </p>
      )}

      <div className="flex gap-6">
        <FilterSidebar
          categories={categories}
          brands={brands}
          filters={filters}
          onChange={updateFilters}
          isLoading={loadingFilters}
        />

        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <SlidersHorizontal size={14} />
              {loadingProducts ? "Loading..." : `${products.length} product(s) on this page`}
            </p>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilters({ sortBy: e.target.value })}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {loadingProducts
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>

          {!loadingProducts && products.length === 0 && (
            <p className="text-center text-gray-500 py-16">No products found. Try adjusting your filters.</p>
          )}

          {!loadingProducts && (
            <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListingPage;