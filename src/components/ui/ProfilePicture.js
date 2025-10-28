// components/ui/ProfilePicture.js
"use client";
import Image from "next/image";

export default function ProfilePicture({
  src,
  alt,
  size = 40,
  className = "",
  onClick,
  title
}) {
  // Handle default/fallback image
  const imageSrc = src?.trim() || "/placeholder-character.jpg";
  const imageTitle = title || alt || "Profile Picture";

  return (
    <Image
      src={imageSrc}
      alt={alt || "Profile"}
      width={size}
      height={size}
      className={`rounded-full object-cover bg-gray-200 ${className}`}
      onClick={onClick}
      title={imageTitle}
      priority
      quality={90}
      unoptimized={imageSrc.startsWith("data:") || imageSrc.startsWith("blob:")}
    />
  );
}
