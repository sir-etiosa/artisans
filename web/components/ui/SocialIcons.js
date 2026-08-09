import { CARD, LINE, INK } from "@/lib/theme";

const X_URL = "https://x.com/theartisans_xyz";
const IG_URL = "https://instagram.com/theartisansxyz";

const iconButtonStyle = {
  width: 36, height: 36, borderRadius: 999,
  background: CARD, border: `1px solid ${LINE}`, color: INK,
};

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default function SocialIcons() {
  return (
    <div className="flex items-center gap-2">
      <a href={X_URL} target="_blank" rel="noopener noreferrer" aria-label="The Artisans on X" title="@theartisans_xyz"
        className="btn flex items-center justify-center" style={iconButtonStyle}>
        <XIcon />
      </a>
      <a href={IG_URL} target="_blank" rel="noopener noreferrer" aria-label="The Artisans on Instagram" title="@theartisansxyz"
        className="btn flex items-center justify-center" style={iconButtonStyle}>
        <InstagramIcon />
      </a>
    </div>
  );
}
