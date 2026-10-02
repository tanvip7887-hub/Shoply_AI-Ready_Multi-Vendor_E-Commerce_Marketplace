const Spinner = ({ size = 24 }) => (
  <div
    className="animate-spin rounded-full border-2 border-gray-300 border-t-brand-600"
    style={{ width: size, height: size }}
  />
);

export default Spinner;