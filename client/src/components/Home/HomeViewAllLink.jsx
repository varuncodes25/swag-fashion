import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { HOME_MOBILE_VIEW_ALL_LINK } from "./homeSectionStyles";

export default function HomeViewAllLink({ to, children }) {
  return (
    <Link to={to} className={HOME_MOBILE_VIEW_ALL_LINK}>
      {children}
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}
