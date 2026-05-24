import { Link } from "react-router-dom";

const sizeStyles = {
  sm: {
    container: "gap-1.5 text-base",
    icon: "text-base",
  },
  md: {
    container: "gap-2 text-lg",
    icon: "text-lg",
  },
  lg: {
    container: "gap-2.5 text-2xl",
    icon: "text-2xl",
  },
};

export default function Brand({
  to = "/",
  size = "md",
  className = "",
  labelClassName = "",
}) {
  const styles = sizeStyles[size] || sizeStyles.md;

  return (
    <Link
      to={to}
      className={`flex items-center font-semibold tracking-tight text-slate-950 ${styles.container} ${className}`.trim()}
    >
      <span aria-hidden="true" className={styles.icon}>
        💰
      </span>
      <span className={labelClassName}>Wealth</span>
    </Link>
  );
}