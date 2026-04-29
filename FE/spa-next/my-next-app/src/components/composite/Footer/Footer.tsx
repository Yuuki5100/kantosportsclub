// components/composite/footer/Footer.tsx
import React from "react";
import { Box, Container, Font14 } from "@/components/base";
import { FooterLang } from "./footer.lang";
import { footerBgColor, footerTextColor } from "../../color";

/**
 * Footerコンポーネントのプロパティ
 */
type FooterProps = {

  /**
   * フッターがクリックされたときのコールバック関数
   * @param {() => void} onClick
   */
  onClick?: () => void;
  /**
   * 言語設定オブジェクト
   * @type {FooterLang}
   */
  language: FooterLang;
};

const Footer: React.FC<FooterProps> = ({ onClick, language }) => {
  return (
    <Box
      component="footer"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: footerBgColor,
        color: footerTextColor,
        flexShrink: 0,
        minHeight: 48,
        px: { xs: 2, sm: 3 },
        py: 1.25,
        textAlign: "center",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Container maxWidth={false} disableGutters sx={{ width: "100%", minWidth: 0 }}>
        <Font14
          bold={false}
          sx={{
            color: "inherit",
            cursor: onClick ? "pointer" : "default",
            display: "block",
            lineHeight: 1.5,
            overflowWrap: "anywhere",
            textAlign: "center",
            whiteSpace: "normal",
            width: "100%",
            ...(onClick
              ? {
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }
              : {}),
          }}
          onClick={onClick}
        >
          {language.copyrightText}
        </Font14>
      </Container>
    </Box>
  );
};

export default Footer;
