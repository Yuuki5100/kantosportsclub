import type { NextPageContext } from "next";

type ErrorProps = {
  statusCode: number;
};

function ErrorPage({ statusCode }: ErrorProps) {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>An error occurred</h1>
      <p>{statusCode ? `Status code: ${statusCode}` : "Unknown error"}</p>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext): ErrorProps => {
  const statusCode =
    res?.statusCode ??
    (err && "statusCode" in err
      ? (err as { statusCode?: number }).statusCode ?? 500
      : 404);

  return { statusCode };
};

export default ErrorPage;




// import React from "react";
// import { NextPageContext } from "next";
// import { sendErrorToTeams } from "../utils/teamsNotifier";
// import type { Logger } from "@/types/logger"; // 後述: 明示的型のために用意

// // サーバー or クライアントによって logger を動的に切り替え
// const isServer = typeof window === "undefined";

// /* eslint-disable @typescript-eslint/no-require-imports */
// const logger: Logger = isServer
//   ? require("../utils/logger").default
//   : {
//       error: (...args: unknown[]) => console.error(...args),
//     };
// /* eslint-enable @typescript-eslint/no-require-imports */

// interface ErrorProps {
//   statusCode: number;
//   hasGetInitialPropsRun: boolean;
//   err?: Error;
// }

// const ErrorPage = ({ statusCode, err, hasGetInitialPropsRun }: ErrorProps) => {
//   if (!hasGetInitialPropsRun && err) {
//     logger.error("Next.js SSR エラー:", err);
//     sendErrorToTeams(err, "SSR エラー");
//   }

//   return (
//     <div style={{ padding: "2rem", textAlign: "center" }}>
//       <h1>エラーが発生しました</h1>
//       <p>{statusCode ? `ステータスコード: ${statusCode}` : "エラー"}</p>
//       <p>しばらくしてから再度お試しください。</p>
//     </div>
//   );
// };

// ErrorPage.getInitialProps = async ({ res, err }: NextPageContext): Promise<ErrorProps> => {
//   const statusCode = res?.statusCode ?? (err && "statusCode" in err ? (err as { statusCode?: number }).statusCode ?? 500 : 404);

//   if (err) {
//     logger.error("Next.js エラー（getInitialProps）:", err);
//     sendErrorToTeams(err, "SSR エラー (getInitialProps)");
//   }

//   return {
//     statusCode,
//     hasGetInitialPropsRun: true,
//     err: err || undefined,
//   };
// };

// export default ErrorPage;

