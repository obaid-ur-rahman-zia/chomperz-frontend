type IconProps = { className?: string };

export function CoinIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 7v10M9.5 9.5h4a2 2 0 0 1 0 4h-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrendIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 16l5-5 4 4 7-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 7h5v5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MapIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9 4v14M15 6v14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CrownIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M4 18h16v2H4v-2zm1.5-9 2.8 3.2L12 6l3.7 6.2L18.5 9 21 18H3l2.5-9z" />
    </svg>
  );
}

export function PinIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function PulseDot({ className = "" }: IconProps) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full bg-[var(--green)] shadow-[0_0_8px_var(--green)] animate-pulse ${className}`}
      aria-hidden
    />
  );
}

/** @alias PulseDot */
export const StatusDot = PulseDot;

/** @alias PinIcon */
export const PlotIcon = PinIcon;

export function BoltIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
    </svg>
  );
}

export function SpeedIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M12 13V9M12 13l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 3h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function HomeIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SwordIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20l7-7M14 6l4-4 2 2-4 4M10 10l4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowRightIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function XIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
    >
      <path d="M9.294 6.928L14.357 1h-1.2L8.762 6.147L5.25 1H1.2l5.31 7.784L1.2 15h1.2l4.642-5.436L10.751 15h4.05zM7.651 8.852l-.538-.775L2.832 1.91h1.843l3.454 4.977l.538.775l4.491 6.47h-1.843z" />
    </svg>
  );
}

export function MetaMaskIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        fill="#ff5c16"
        d="m19.821 19.918l-3.877-1.131l-2.924 1.712h-2.04l-2.926-1.712l-3.875 1.13L3 16.02l1.179-4.327L3 8.034L4.179 3.5l6.056 3.544h3.53L19.821 3.5L21 8.034l-1.179 3.658L21 16.02z"
      />
      <path
        fill="#ff5c16"
        d="m4.18 3.5l6.055 3.547l-.24 2.434zm3.875 12.52l2.665 1.99l-2.665.777zm2.452-3.286l-.512-3.251l-3.278 2.21h-.002v.001l.01 2.275l1.33-1.235zM19.82 3.5l-6.056 3.547l.24 2.434zm-3.875 12.52l-2.665 1.99l2.665.777zm1.339-4.326v-.002l-3.279-2.21l-.512 3.25h2.451l1.33 1.236z"
      />
      <path
        fill="#e34807"
        d="m8.054 18.787l-3.875 1.13L3 16.022h5.054zm2.452-6.054l.74 4.7l-1.026-2.614l-3.497-.85l1.33-1.236zm5.44 6.054l3.875 1.13L21 16.022h-5.055zm-2.452-6.054l-.74 4.7l1.026-2.614l3.497-.85l-1.331-1.236z"
      />
      <path
        fill="#ff8d5d"
        d="m3 16.02l1.179-4.328h2.535l.01 2.276l3.496.85l1.026 2.613l-.527.576l-2.665-1.989H3zm18 0l-1.179-4.328h-2.535l-.01 2.276l-3.496.85l-1.026 2.613l.527.576l2.665-1.989H21zm-7.235-8.976h-3.53l-.24 2.435l1.251 7.95h1.508l1.252-7.95z"
      />
      <path
        fill="#661800"
        d="M4.179 3.5L3 8.034l1.179 3.658h2.535l3.28-2.211zm5.594 10.177H8.625l-.626.6l2.222.54zM19.821 3.5L21 8.034l-1.179 3.658h-2.535l-3.28-2.211zm-5.593 10.177h1.15l.626.6l-2.224.541zm-1.209 5.271l.262-.94l-.527-.575h-1.509l-.527.575l.262.94"
      />
      <path fill="#c0c4cd" d="M13.02 18.948V20.5h-2.04v-1.552z" />
      <path
        fill="#e7ebf6"
        d="m8.055 18.785l2.927 1.714v-1.552l-.262-.94zm7.89 0L13.02 20.5v-1.552l.262-.94z"
      />
    </svg>
  );
}
