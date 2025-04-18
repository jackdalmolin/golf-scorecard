export const Button = ({ children, ...props }) => (
    <button
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl"
      {...props}
    >
      {children}
    </button>
  );
  