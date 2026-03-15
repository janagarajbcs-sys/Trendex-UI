import { Link } from "react-router-dom";
import "./video.css";

export default function Video() {
  return (
    <div className="video-page-container">

      {/* Video Container */}
      <div className="video-section-wrapper">
        {/* Title inside video section */}
        <h1 className="video-title">
          Plan Presentation
        </h1>

        {/* Responsive Video */}
        <div className="video-container">
          <iframe
            src="https://iframe.mediadelivery.net/play/615839/9b655ee4-cf57-4122-8cdd-e9e946719f7d"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen
            className="video-iframe"
          ></iframe>
        </div>

        <p className="video-note">
          Please Watch this full video to understand how to earn in Tamil Language
        </p>

      </div>

      {/* Buttons */}
      <div className="buttons-container">
        <Link className="btn" to="/bot">
          Trading Strategies
        </Link>

        <Link className="btn" to="/sharing">
          Share & Earn
        </Link>

        <Link className="btn secondary" to="/sharing/cashback">
          Cashback Offer
        </Link>
      </div>
    </div>
  );
}