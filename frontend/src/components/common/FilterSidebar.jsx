import Skeleton from "../ui/Skeleton.jsx";

const FilterSidebar = ({ categories, brands, filters, onChange, isLoading }) => {
  const handleCategory = (id) => onChange({ categoryId: filters.categoryId === String(id) ? "" : id });
  const handleBrand = (id) => onChange({ brandId: filters.brandId === String(id) ? "" : id });

  return (
    <aside className="w-56 shrink-0 space-y-6">
      <div>
        <h3 className="font-semibold text-sm mb-2">Category</h3>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
          </div>
        ) : (
          <ul className="space-y-1.5">
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => handleCategory(cat.id)}
                  className={`text-sm text-left w-full transition-base hover:text-brand-600 ${
                    filters.categoryId === String(cat.id) ? "text-brand-600 font-semibold" : "text-gray-600"
                  }`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-2">Brand</h3>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
          </div>
        ) : (
          <ul className="space-y-1.5">
            {brands.map((brand) => (
              <li key={brand.id}>
                <button
                  onClick={() => handleBrand(brand.id)}
                  className={`text-sm text-left w-full transition-base hover:text-brand-600 ${
                    filters.brandId === String(brand.id) ? "text-brand-600 font-semibold" : "text-gray-600"
                  }`}
                >
                  {brand.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-2">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={filters.minPrice}
            onBlur={(e) => onChange({ minPrice: e.target.value })}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            defaultValue={filters.maxPrice}
            onBlur={(e) => onChange({ maxPrice: e.target.value })}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          />
        </div>
      </div>

      <button
        onClick={() => onChange({ categoryId: "", brandId: "", minPrice: "", maxPrice: "" }, true)}
        className="text-sm text-brand-600 font-medium hover:underline"
      >
        Clear all filters
      </button>
    </aside>
  );
};

export default FilterSidebar;