import express, {
  Request,
  Response,
  RequestHandler
} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const port: number = 3005;
const CORS_POLICY_VIOLATION = "CORS policy violation";

// ✅ カスタム型
type RequestWithCookies = Request & {
  cookies: Record<string, string>; // Cookieは基本的に文字列
};
// ✅ モックユーザー
const users = [
  {
    id: 1,
    username: "testtaro",
    password: "testtaro",
    role: "admin",
    rolePermissions: { "/user": 2, "/admin": 3 }
  },
  {
    id: 2,
    username: "guestuser",
    password: "guestpass",
    role: "guest",
    rolePermissions: { "/user": 1, "/admin": 0 }
  }
];

// ✅ CORS設定
const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];
app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(CORS_POLICY_VIOLATION));
    }
  },
}));

app.use(cookieParser());
app.use(express.json());

// ✅ ログイン
app.post("/auth/login", ((req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user || user.password !== password) {
    return res.status(401).json({ authenticated: false, message: "認証失敗" });
  }

  res.cookie("session", user.id, { httpOnly: true, secure: false, maxAge: 3600000 });
  res.status(200).json({
    authenticated: true,
    user: {
      username: user.username,
      role: user.role,
      rolePermissions: user.rolePermissions,
    },
  });
}) as RequestHandler);

// ✅ ログアウト
app.post("/auth/logout", ((_req: Request, res: Response) => {
  res.clearCookie("session");
  res.status(200).json({ message: "Logged out successfully", authenticated: false });
}) as RequestHandler);

// ✅ 認証確認
app.get("/auth/status", ((req: RequestWithCookies, res: Response) => {
  const sessionId = req.cookies.session;
  const user = users.find(u => u.id == sessionId);

  if (!sessionId || !user) {
    return res.status(403).json({
      authenticated: false,
      rolePermissions: {},
      message: "セッションが無効です",
    });
  }

  res.json({
    authenticated: true,
    rolePermissions: user.rolePermissions || {},
  });
}) as RequestHandler);

// ✅ プロフィール取得
app.get("/user/profile", ((req: RequestWithCookies, res: Response) => {
  const sessionId = req.cookies.session;
  const user = users.find(u => u.id == sessionId);

  if (!sessionId || !user) {
    return res.status(403).json({ message: "認証エラー: セッションが無効です。" });
  }

  res.json({
    name: user.username,
    email: user.role || `${user.username}@example.com`,
  });
}) as RequestHandler);

// ✅ ユーザー更新
app.put("/user/update", ((req: RequestWithCookies, res: Response) => {
  const sessionId = req.cookies.session;
  const user = users.find(u => u.id == sessionId);

  if (!sessionId || !user) {
    return res.status(403).json({ message: "認証エラー: セッションが無効です。" });
  }

  const { name, role } = req.body;
  user.username = name;
  user.role = role;

  res.json({ name: user.username, email: user.role });
}) as RequestHandler);

// ✅ 権限更新（管理者のみ）
app.put("/admin/user/permissions", ((req: RequestWithCookies, res: Response) => {
  const sessionId = req.cookies.session;
  const adminUser = users.find(u => u.id == sessionId);

  if (!adminUser || adminUser.role !== "admin") {
    return res.status(403).json({ message: "権限がありません" });
  }

  const { userId, permissions } = req.body;
  const targetUser = users.find(u => u.id == userId);

  if (!targetUser) {
    return res.status(404).json({ message: "ユーザーが見つかりません" });
  }

  targetUser.rolePermissions = permissions;
  res.status(200).json({ message: "権限を更新しました" });
}) as RequestHandler);

// ✅ ユーザー一覧取得（管理者のみ）
app.get("/user/list", ((req: RequestWithCookies, res: Response) => {
  const sessionId = req.cookies.session;
  const adminUser = users.find(u => u.id == sessionId);

  if (!adminUser || adminUser.role !== "admin") {
    return res.status(403).json({ message: "権限がありません" });
  }

  const userList = users.map(({ password: _password, ...user }) => user);
  res.json(userList);
}) as RequestHandler);

// ✅ 起動
app.listen(port, () => {
  console.log(`✅ Auth Mock Server running at http://localhost:${port}`);
});
