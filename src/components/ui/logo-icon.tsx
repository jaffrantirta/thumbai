import { cn } from "@/lib/utils";

export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("w-4 h-4", className)}
    >
      {/* thumbnail frame */}
      <rect x="1.5" y="5.5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
      {/* play triangle */}
      <path d="M7 8.5L12.5 11L7 13.5V8.5Z" fill="currentColor" />
      {/* 4-pointed sparkle */}
      <path d="M20 2L20.9 4.1L23 5L20.9 5.9L20 8L19.1 5.9L17 5L19.1 4.1L20 2Z" fill="currentColor" />
    </svg>
  );
}
