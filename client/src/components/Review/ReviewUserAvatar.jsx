import { getUserInitials } from "./reviewUtils";

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

const ReviewUserAvatar = ({ name, size = "md", className = "" }) => {
  const initials = getUserInitials(name);

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary dark:bg-primary/25 dark:text-primary ${sizeClasses[size]} ${className}`}
      aria-label={name ? `${name} avatar` : "User avatar"}
      title={name || "User"}
    >
      {initials}
    </div>
  );
};

export default ReviewUserAvatar;
