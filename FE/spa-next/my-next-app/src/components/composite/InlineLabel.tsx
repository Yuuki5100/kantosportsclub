// InlineLabel.tsx
import { Box } from "@/components/base";
import Font from "@base/Font/FontBase";

type Props = {
  icon?: React.ReactNode;
  label: string;
  size?: number;
  bold?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export const InlineLabel: React.FC<Props> = ({
  icon,
  label,
  size = 14,
  bold = false,
  className,
  style,
}) => (
  <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
    {icon}
    <Font size={size} bold={bold} className={className} style={style}>
      {label}
    </Font>
  </Box>
);

export default InlineLabel;
