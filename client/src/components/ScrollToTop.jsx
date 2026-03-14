import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Scroll to top of the window on every route change
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
}
