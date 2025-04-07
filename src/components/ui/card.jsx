export const Card = ({ children, className = '' }) => (
    <div className={`rounded-xl shadow p-4 bg-white ${className}`}>{children}</div>
  );
  
  export const CardContent = ({ children, className = '' }) => (
    <div className={`space-y-4 ${className}`}>{children}</div>
  );
  