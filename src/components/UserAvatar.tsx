import Image from "next/image";

interface UserAvatarProps {
  src: string;
  alt: string;
  className?: string;
  /** Fixed size mode — avoids fill layout bugs when parent has no explicit height */
  size?: number;
}

function isExternalUrl(src: string) {
  return src.startsWith("http://") || src.startsWith("https://");
}

/** Avatar for local assets (next/image) or external URLs e.g. Twitter (native img). */
export function UserAvatar({ src, alt, className = "object-cover", size }: UserAvatarProps) {
  if (size != null) {
    if (isExternalUrl(src)) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          width={size}
          height={size}
          className={`block max-w-full max-h-full ${className}`}
        />
      );
    }
    return (
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={`block max-w-full max-h-full ${className}`}
        unoptimized={src.startsWith("/images/Slicing")}
      />
    );
  }

  if (isExternalUrl(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={`absolute inset-0 h-full w-full ${className}`} />
    );
  }

  return <Image src={src} alt={alt} fill className={className} sizes="128px" />;
}
