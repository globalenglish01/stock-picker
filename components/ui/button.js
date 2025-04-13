export function Button({ children, onClick, disabled, className }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded bg-blue-500 text-white ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
      } ${className}`}
    >
      {children}
    </button>
  );
}
