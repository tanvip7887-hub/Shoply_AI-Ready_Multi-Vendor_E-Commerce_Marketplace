const variants = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 active:scale-[0.98]",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 active:scale-[0.98]",
  danger: "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]",
};

const Button = ({ children, variant = "primary", isLoading, className = "", ...props }) => {
  return (
    <button
      className={`px-4 py-2 rounded-md font-medium transition-base disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
};

export default Button;