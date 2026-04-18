// components/composite/footer/Footer.tsx
import React from "react";
import { Container } from "@/components/base";
import { Box } from "@/components/base";
import { FooterLang } from "./footer.lang";
import { footerBgColor, footerTextColor } from "../../color";
import { Font14 } from "@/components/base";

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
}

const Footer: React.FC<FooterProps> = ({ onClick, language }) => {

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: footerBgColor,
        color: footerTextColor,
        py: 2,
        textAlign: "center",
        width: "100%",
      }}
    >
      <Container>
        <Font14
          bold={false}
          sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" }, color: "inherit" }}
          onClick={onClick}
        >
          {language.copyrightText}
        </Font14>
      </Container>
    </Box>
  );
};

export default Footer;
