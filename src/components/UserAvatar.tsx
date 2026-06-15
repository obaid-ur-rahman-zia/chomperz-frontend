import Image from "next/image";

interface UserAvatarProps {
  src: string;
  alt: string;
  className?: string;
}

function isExternalUrl(src: string) {
  return src.startsWith("http://") || src.startsWith("https://");
}

/** Avatar for local assets (next/image) or external URLs e.g. Twitter (native img). */
export function UserAvatar({ src, alt, className = "object-cover" }: UserAvatarProps) {
  if (isExternalUrl(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={`absolute inset-0 h-full w-full ${className}`} />
    );
  }

  return <Image src={src} alt={alt} fill className={className} />;
}
