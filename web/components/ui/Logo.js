import Image from "next/image";

/* Brand mark (guild-crest shield) — distinct from Seal, which is the
   per-artisan "verified credential" badge used elsewhere in the app. */
export default function Logo({ size = 32, className = "" }) {
  return (
    <Image
      src="/logo.png"
      alt="The Artisans"
      width={size}
      height={size}
      className={className}
      style={{ borderRadius: 6 }}
      priority
    />
  );
}
