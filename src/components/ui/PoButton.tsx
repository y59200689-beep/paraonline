'use client';

import React from 'react';
import { LoaderCircle } from 'lucide-react';

type PoButtonVariant =
  | 'primary'
  | 'secondary'
  | 'neutral'
  | 'danger'
  | 'dangerSoft'
  | 'text'
  | 'accentSoft';

type PoButtonSize = 'sm' | 'md' | 'lg';

type CommonProps = {
  children?: React.ReactNode;
  variant?: PoButtonVariant;
  size?: PoButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconOnly?: boolean;
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  className?: string;
};

type NativeButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
    href?: never;
  };

type AnchorButtonProps = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'href'> & {
    href: string;
    disabled?: boolean;
  };

export type PoButtonProps = NativeButtonProps | AnchorButtonProps;

function buttonClassName({
  variant = 'primary',
  size = 'md',
  iconOnly = false,
  loading = false,
  fullWidth = false,
  className = '',
}: CommonProps) {
  return [
    'po-ui-button',
    `po-ui-button--${variant === 'dangerSoft' ? 'danger-soft' : variant === 'accentSoft' ? 'accent-soft' : variant}`,
    `po-ui-button--${size}`,
    iconOnly && 'po-ui-button--icon-only',
    loading && 'po-ui-button--loading',
    fullWidth && 'po-ui-button--full-width',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

function PoButtonContent({
  children,
  leftIcon,
  rightIcon,
  iconOnly,
  loading,
  loadingText,
}: CommonProps) {
  return (
    <>
      {loading ? (
        <LoaderCircle className="po-ui-button__spinner" aria-hidden="true" />
      ) : leftIcon ? (
        <span className="po-ui-button__icon" aria-hidden="true">{leftIcon}</span>
      ) : null}
      {!iconOnly && (
        <span className="po-ui-button__label">{loading && loadingText ? loadingText : children}</span>
      )}
      {!loading && rightIcon ? (
        <span className="po-ui-button__icon" aria-hidden="true">{rightIcon}</span>
      ) : null}
      {loading && <span className="sr-only">Chargement en cours</span>}
    </>
  );
}

export function PoButton(props: PoButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    leftIcon,
    rightIcon,
    iconOnly = false,
    loading = false,
    loadingText,
    fullWidth = false,
    className = '',
    children,
    ...elementProps
  } = props;

  const common = {
    variant,
    size,
    leftIcon,
    rightIcon,
    iconOnly,
    loading,
    loadingText,
    fullWidth,
    className,
    children,
  };
  const resolvedClassName = buttonClassName(common);

  if ('href' in elementProps && elementProps.href) {
    const { href, disabled = false, onClick, target, rel, title, ...anchorProps } = elementProps;
    const unavailable = disabled || loading;

    return (
      <a
        {...anchorProps}
        href={unavailable ? undefined : href}
        className={resolvedClassName}
        aria-disabled={unavailable || undefined}
        aria-busy={loading || undefined}
        aria-label={elementProps['aria-label']}
        tabIndex={unavailable ? -1 : elementProps.tabIndex}
        target={target}
        rel={rel}
        title={title || (iconOnly ? elementProps['aria-label'] : undefined)}
        onClick={(event) => {
          if (unavailable) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        }}
      >
        <PoButtonContent {...common} />
      </a>
    );
  }

  const { type = 'button', disabled = false, ...buttonProps } = elementProps as Omit<NativeButtonProps, keyof CommonProps>;

  return (
    <button
      {...buttonProps}
      type={type}
      disabled={disabled || loading}
      className={resolvedClassName}
      aria-busy={loading || undefined}
      title={elementProps.title || (iconOnly ? elementProps['aria-label'] : undefined)}
    >
      <PoButtonContent {...common} />
    </button>
  );
}
