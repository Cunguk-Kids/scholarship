import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { ConnectButton } from '@xellar/kit';

type Variant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'connect';
type Size = 'sm' | 'md' | 'lg';

interface NeoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  children?: ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  wrapperClassName?: string;
}

const variantStyles: Record<Exclude<Variant, 'connect'>, string> = {
  primary: 'bg-skpurple text-white hover:bg-skpurple-hover border-black',
  secondary: 'bg-white text-black hover:bg-skbw-hover border-black',
  danger: 'bg-skred text-white hover:brightness-110 border-black',
  success: 'bg-skgreen text-black hover:brightness-95 border-black',
  ghost:
    'bg-transparent text-black hover:bg-gray-100 border-transparent shadow-none hover:shadow-none',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-base rounded-xl',
  lg: 'px-7 py-3.5 text-lg rounded-xl',
};

const baseClasses = `
  inline-flex items-center justify-center gap-2
  font-bold font-nunito border-2
  neo-interactive select-none
  disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
  cursor-pointer
`;

export function NeoButton({
  label,
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  wrapperClassName = '',
  className = '',
  disabled,
  ...rest
}: NeoButtonProps) {
  if (variant === 'connect') {
    return (
      <ConnectButton.Custom>
        {({ isConnected, openProfileModal, account, chain, openChainModal, openConnectModal }) => {
          if (!isConnected) {
            return (
              <div className={wrapperClassName}>
                <button
                  onClick={openConnectModal}
                  className={`${baseClasses} bg-skyellow text-black hover:brightness-95 border-black ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`}>
                  🔗 {label ?? children ?? 'Connect Wallet'}
                </button>
              </div>
            );
          }

          if (!chain) {
            return (
              <div className={wrapperClassName}>
                <button
                  onClick={openChainModal}
                  className={`${baseClasses} bg-skred text-white border-black ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`}>
                  ⚠️ Wrong Network
                </button>
              </div>
            );
          }

          const addr = account?.address
            ? `${account.address.slice(0, 6)}…${account.address.slice(-4)}`
            : 'Connected';

          return (
            <div className={`flex gap-2 ${wrapperClassName}`}>
              <button
                onClick={openChainModal}
                className={`${baseClasses} bg-white text-black border-black ${sizeStyles[size]} ${className}`}>
                {chain.name}
              </button>
              <button
                onClick={openProfileModal}
                className={`${baseClasses} bg-skyellow text-black border-black ${sizeStyles[size]} ${className}`}>
                {addr}
              </button>
            </div>
          );
        }}
      </ConnectButton.Custom>
    );
  }

  const Spinner = () => (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );

  return (
    <div className={wrapperClassName}>
      <button
        disabled={disabled || loading}
        className={`
          ${baseClasses}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...rest}>
        {loading ? <Spinner /> : (icon ?? null)}
        {label ?? children}
      </button>
    </div>
  );
}
