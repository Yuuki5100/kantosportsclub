import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const port = 3005;
const CORS_POLICY_VIOLATION = "CORS policy violation";

// ✅ CORS設定の変更（複数のオリジンを許可）
const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(CORS_POLICY_VIOLATION));
      }
    },
  })
);

app.use(cookieParser());
app.use(express.json());

// 仮のユーザーデータ
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


// ✅ ログインエンドポイント
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  console.log("🟢 ログインリクエスト:", { username, password });

  const user = users.find(u => u.username === username);
  if (!user || user.password !== password) {
    return res.status(401).json({ authenticated: false, message: "認証失敗" });
  }

  res.cookie('session', user.id, { httpOnly: true, secure: false, maxAge: 3600000 });
  res.status(200).json({ authenticated: true, user: { username: user.username, role: user.role, rolePermissions: user.rolePermissions } });
});

// ✅ ログアウトエンドポイント
app.post('/auth/logout', (req, res) => {
  res.clearCookie('session');
  res.status(200).json({ message: 'Logged out successfully', authenticated: false });
});

// ✅ 認証状態チェックエンドポイント
app.get('/auth/status', (req, res) => {
  console.log("🟢 /auth/status API にリクエスト", { cookies: req.cookies });

  const sessionId = req.cookies.session;
  const user = users.find(u => u.id == sessionId);

  if (!sessionId || !user) {
    console.warn("⚠️ セッションが無効です");
    return res.status(403).json({ authenticated: false, rolePermissions: {}, message: "セッションが無効です" });
  }

  console.log("🟢 認証成功:", user);
  res.json({ authenticated: true, rolePermissions: user.rolePermissions || {}  });
});

// ✅ ユーザープロフィール取得エンドポイント
app.get("/user/profile", (req, res) => {
  const sessionId = req.cookies.session;
  const user = users.find((u) => u.id == sessionId);

  if (!sessionId || !user) {
    return res.status(403).json({ message: "認証エラー: セッションが無効です。" });
  }

  res.json({ name: user.username, email: user.email || `${user.username}@example.com` });
});

// ✅ ユーザー情報更新エンドポイント
app.put("/user/update", (req, res) => {
  const sessionId = req.cookies.session;
  const user = users.find((u) => u.id == sessionId);

  if (!sessionId || !user) {
    return res.status(403).json({ message: "認証エラー: セッションが無効です。" });
  }

  const { name, email } = req.body;
  user.username = name;
  user.email = email;

  res.json({ name: user.username, email: user.email });
});

// ✅ ユーザー権限更新エンドポイント
app.put("/admin/user/permissions", (req, res) => {
  const sessionId = req.cookies.session;
  console.log("🟢 受信したセッション ID:", sessionId);
  const adminUser = users.find((u) => u.id == sessionId);

  if (!adminUser || adminUser.role !== "admin") {
    return res.status(403).json({ message: "権限がありません" });
  }

  const { userId, permissions } = req.body;
  const targetUser = users.find((u) => u.id == userId);

  if (!targetUser) {
    return res.status(404).json({ message: "ユーザーが見つかりません" });
  }

  console.log(`🛠 権限更新: ユーザー ${userId} の新しい権限`, permissions);
  targetUser.rolePermissions = permissions;

  // ✅ セッション削除の対象が対象ユーザーのみであることを確認
  // if (targetUser.id !== adminUser.id) {
  //   console.log(`🔴 セッションを無効化: ユーザー ${targetUser.id}`);
  //   res.clearCookie("session", { path: "/", domain: "localhost" });

  //   // ✅ クライアント側で即時ログアウト処理を行うように指示
  //   return res.status(200).json({ message: "権限を更新しました。セッションが無効になったため再ログインが必要です。", sessionInvalidated: true });
  // }

  res.status(200).json({ message: "権限を更新しました" });
});


// ✅ 全ユーザーの一覧を取得（管理者のみアクセス可能）
app.get("/user/list", (req, res) => {
  const sessionId = req.cookies.session;
  const adminUser = users.find((u) => u.id == sessionId);

  if (!adminUser || adminUser.role !== "admin") {
    return res.status(403).json({ message: "権限がありません" });
  }

  // ✅ パスワード情報を除外して返す
  const userList = users.map(({ password: _password, ...user }) => user);
  res.json(userList);
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
