import Link from "next/link";
import { cva } from "class-variance-authority";
import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { type ButtonProps, type LinkButtonProps } from '@/components/ui/button/button-types';

export const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center rounded-uc-button px-6 py-3 text-button transition-colors focus:outline-none focus:ring-2 focus:ring-uc-focus focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-ultracem-blue text-white hover:bg-ultracem-blue-dark",
        secondary:
          "bg-ultracem-yellow text-ultracem-blue hover:bg-ultracem-yellow-hover",
        outline:
          "border-2 border-ultracem-blue bg-transparent text-ultracem-blue hover:bg-ultracem-blue hover:text-white",
        ghost: "bg-transparent text-ultracem-blue hover:bg-ultracem-blue/5",
        white:
          "border border-white/35 bg-transparent text-white hover:border-white hover:bg-white/10",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export function Button(props: ButtonProps | LinkButtonProps) {
  const { className, variant, ...rest } = props;

  if ("href" in rest && rest.href) {
    const { href, ...anchorProps } = rest;

    if (href.startsWith("/")) {
      return (
        <Link
          href={href}
          className={cn(buttonVariants({ variant }), className)}
          {...anchorProps}
        />
      );
    }

    return (
      <a
        href={href}
        className={cn(buttonVariants({ variant }), className)}
        {...anchorProps}
      />
    );
  }

  return (
    <button
      className={cn(buttonVariants({ variant }), className)}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    />
  );
}
