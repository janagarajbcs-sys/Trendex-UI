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
            src="https://iframe.mediadelivery.net/play/615839/b4c25acb-c8ac-4e0b-8f7a-8176fcf6cd8e"
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
      <div className="buttons-container" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link className="btn" to="/bot">
          Trading Strategies
        </Link>

        <Link className="btn" to="/sharing">
          Share & Earn
        </Link>

        <Link className="btn secondary" to="/sharing/cashback">
          Cashback Offer
        </Link>

        <Link className="btn" to="/#join-business" style={{ background: '#22C55E' }}>
          Join/Subscribe Now →
        </Link>
      </div>
    </div>
  );
}