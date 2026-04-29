import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const CornerFrame = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();

  // Hide on app routes (they have their own AppLayout chrome) to avoid overlap
  if (pathname.startsWith("/app")) return null;

  return (
    <>
      <div className="corner-frame tl">
        <Link to="/" className="mono-label tracking-[0.18em] kinetic-link">
          ◆ Smart Planner
        </Link>
      </div>
      <div className="corner-frame tr">
        <Link to={user ? "/app" : "/auth"} className="mono-label kinetic-link">
          {user ? "Open App ↗" : "Menu ↗"}
        </Link>
      </div>
      <div className="corner-frame bl">
        <a href="mailto:hello@smartplanner.app" className="mono-label kinetic-link">
          Contact
        </a>
      </div>
      <div className="corner-frame br">
        <span className="mono-label">© {new Date().getFullYear()} / IN</span>
      </div>
    </>
  );
};

export default CornerFrame;
