import { Link } from "react-router-dom";
import "./SharingCashback.css";

export default function SharingCashback() {
  return (
    <div className="cashback-page">

      <h1 className="cashback-title">
        Cashback & Gadget Fund Offer
      </h1>

      {/* Video Card */}
      <div className="cashback-card">

        {/* Video Frame */}
        <div className="video-frame">
          <iframe
            src="https://iframe.mediadelivery.net/play/615839/b8957b74-f2a1-44bb-8d0a-2a23e1f7f600"
            loading="lazy"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        <p className="video-note">
          Please Watch this full video to get your subscription cash return back <br />to use this bot Free
        </p>

      </div>

      {/* Buttons */}
      <div className="cashback-buttons">
        <Link className="btn" to="/video">
          Plan Presentation →
        </Link>

        <Link className="btn secondary" to="/#join-business">
          Join/Subscribe Now →
        </Link>
      </div>

    </div>
  );
}