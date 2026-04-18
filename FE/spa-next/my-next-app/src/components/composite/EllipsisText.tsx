import { Box } from "@/components/base";
import type { BoxProps } from "@/components/base";
import Font from "@base/Font/FontBase";

type Props = BoxProps & {
  text: string;
  size?: number;
  bold?: boolean;
};

export const EllipsisText: React.FC<Props> = ({
  text,
  size = 14,
  bold = false,
  sx,
  ...rest
}) => {
  return (
    <Box
      sx={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        ...sx,
      }}
      {...rest}
    >
      <Font size={size} bold={bold}>
        {text}
      </Font>
    </Box>
  );
};

export default EllipsisText;
