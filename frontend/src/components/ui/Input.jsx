const Input = ({ label, error, rightElement, ...props }) => {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        <input
          className={`w-full border rounded-lg px-3 py-2.5 pr-10 transition-base focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${error ? "border-red-500" : "border-gray-300"
            }`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;