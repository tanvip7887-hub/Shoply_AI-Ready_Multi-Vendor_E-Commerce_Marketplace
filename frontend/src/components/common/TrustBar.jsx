const items = [
  { emoji: "🔄", label: "7 Days Easy Return" },
  { emoji: "💳", label: "Cash on Delivery" },
  { emoji: "🏷️", label: "Lowest Prices" },
];

const TrustBar = () => (
  <div
    className="w-full py-3"
    style={{
      background: "linear-gradient(to right, #fce4f3, #ede7f6, #e8eaf6)",
    }}
  >
    <div className="flex items-center justify-center divide-x divide-pink-200">
      {items.map(({ emoji, label }) => (
        <div
          key={label}
          className="flex items-center gap-2 px-10 text-[13px] text-gray-600 font-medium"
        >
          <span className="text-[15px]">{emoji}</span>
          <span>{label}</span>
        </div>
      ))}
    </div>
  </div>
);

export default TrustBar;