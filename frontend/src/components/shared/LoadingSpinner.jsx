import './LoadingSpinner.css';

function LoadingSpinner({ fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className="spinner"></div>
        <p>Đang tải...</p>
      </div>
    );
  }
  return <div className="spinner"></div>;
}

export default LoadingSpinner;
