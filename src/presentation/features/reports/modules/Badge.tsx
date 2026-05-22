export type BadgeVariant = "positive" | "negative" | "neutral";

const styles: Record<BadgeVariant, string> = {
  positive:
    "bg-[#E8F8EF] text-[#2E8B57] border border-[#CDEED8]",

  negative:
    "bg-[#FDEEEE] text-[#D05C5C] border border-[#F6D2D2]",

  neutral:
    "bg-[#EEF5F6] text-[#5F7F85] border border-[#DDEBED]",
};

interface BadgeProps {
  variant: BadgeVariant;
  text: string;
}

export default function Badge({
  variant,
  text,
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        px-2.5
        py-1
        text-[11px]
        font-semibold
        font-['Plus_Jakarta_Sans']
        ${styles[variant]}
      `}
    >
      {text}
    </span>
  );
}