import { Link } from "react-router-dom";

export default function SharingCashback() {
  return (
    <div>
      <h1 style={{ color: "#00ddeb" }}>Cashback & Gadget Fund Offer</h1>

      <div className="card" style={{ overflow: "hidden" }}>
        <div
          className="video-frame"
          style={{
            position: "relative",
            paddingTop: "56.25%", // 16:9 ratio
          }}
        >
          <iframe
            src="https://iframe.mediadelivery.net/play/615839/b8957b74-f2a1-44bb-8d0a-2a23e1f7f600"
            loading="lazy"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            style={{
              border: "none",
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          />
        </div>

        <p style={{ opacity: 0.8, marginTop: 8 }}>
          Please watch this full video to get your cash return back to you
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          justifyContent: "center",
          marginTop: 12,
        }}
      >
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