import Image from "next/image";

// Brand icons for Google Calendar and Notion using official PNG assets
interface IconProps {
  className?: string;
}

export function GoogleCalendarIcon({ className }: IconProps) {
  return (
    <Image
      src="/icons/google-calendar.png"
      alt=""
      width={14}
      height={14}
      className={className}
      aria-hidden="true"
    />
  );
}

export function NotionIcon({ className }: IconProps) {
  return (
    <Image
      src="/icons/notion.png"
      alt=""
      width={14}
      height={14}
      className={className}
      aria-hidden="true"
    />
  );
}
