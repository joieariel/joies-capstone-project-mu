import "./LoadingSpinner.css";

const LoadingSpinner = ({ size = "medium", text }) => {
  const sizeClass = `spinner-${size}`;

  return (
    <div className="spinner-container">
      <div className={`spinner ${sizeClass}`}></div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
