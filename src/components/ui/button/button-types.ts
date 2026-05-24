import { type AnchorHTMLAttributes, type ButtonHTMLAttributes } from "react";
import { type VariantProps } from "class-variance-authority";
import { buttonVariants } from '@/components/ui/button/button';

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVariantProps & {
    href?: undefined;
  };

export type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  ButtonVariantProps & {
    href: string;
  };
