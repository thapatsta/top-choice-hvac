import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline-light";
type Size = "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-ember text-white hover:bg-ember-dark active:bg-ember-dark",
  secondary:
    "bg-navy text-white hover:bg-navy-light active:bg-navy-light",
  "outline-light":
    "bg-transparent text-white border-2 border-white hover:bg-white hover:text-navy",
};

const sizeClasses: Record<Size, string> = {
  md: "px-5 py-3 text-base",
  lg: "px-7 py-4 text-lg",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-150 min-h-[44px]";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

interface LinkButtonProps extends CommonProps {
  href: string;
  onClick?: never;
}

interface NativeButtonProps
  extends CommonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> {
  href?: never;
}

type ButtonProps = LinkButtonProps | NativeButtonProps;

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const classes = `${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if ("href" in props && props.href) {
    const { href } = props;
    const isExternalLike = href.startsWith("tel:") || href.startsWith("mailto:");
    if (isExternalLike) {
      return (
        <a href={href} className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  const { href: _href, ...buttonProps } = props as NativeButtonProps;
  void _href;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
