import { Container } from "@/components/base";
import { ReactNode } from "react";


/**
 * モーダルのボディ部分を表示するコンポーネント
 *
 * @param {{ children: ReactNode }} { children }
 */
const ModalBody = ({ children }: { children: ReactNode }) => (
  <Container sx={{ flexGrow: 1, padding: "16px" }}>{children}</Container>
);

export default ModalBody;
