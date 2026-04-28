import { useState, useEffect } from "react";
import { useAdminUserPermissionsList, useUpdateUserPermissions } from "@/api/services/v1/adminService";
import { getPageConfig } from "@/config/PageConfig";
import { useSnackbar } from "@/hooks/useSnackbar";
import { getMessage, MessageCodes } from "@/message";

const AdminPage = () => {

  const { showSnackbar } = useSnackbar();

  // ✅ `useFetch` の戻り値に型を設定
  const { data: UserFetchType, isLoading: isUsersLoading } = useAdminUserPermissionsList();

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [permissions, setPermissions] = useState<{ [key: string]: number }>({});
  const users = UserFetchType?.data ?? [];

  const { mutate: updatePermissions } = useUpdateUserPermissions();

  // ✅ `users` のチェックを追加
  useEffect(() => {
    console.log(UserFetchType);
    if (selectedUserId) {
      const selectedUser = users.find((user) => user.id == Number(selectedUserId));
      setPermissions(selectedUser?.rolePermissions || {});
    }
  }, [selectedUserId, users]);

  const handlePermissionChange = (pageKey: string, level: number) => {
    setPermissions((prev) => ({ ...prev, [pageKey]: level }));
  };

  const handleSubmit = () => {
    if (!selectedUserId) return;
    updatePermissions(
      { userId: Number(selectedUserId), permissions },
      {
        onSuccess: () => {
          showSnackbar(getMessage(MessageCodes.ACTION_SUCCESS, "権限を更新"), "SUCCESS");
        },
        onError: () => showSnackbar(getMessage(MessageCodes.ACTION_FAILED, "更新"), "ERROR"),
      }
    );
  };

  return (
    <div>
      <h2>管理者ページ - ユーザー権限の変更</h2>

      {/* ユーザー選択 */}
      <label>ユーザーを選択:</label>
      {isUsersLoading ? (
        <p>ユーザーを取得中...</p>
      ) : (
        <select onChange={(e) => setSelectedUserId(e.target.value)}>
          <option value="">選択してください</option>
          {/* ✅ `users` が配列であることを保証する */}
          {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username} (ID: {user.id})
              </option>
            ))}
        </select>
      )}

      {/* ページごとの権限設定 */}
      {selectedUserId && (
        <div>
          <h3>アクセス権限設定</h3>
          {Object.entries(getPageConfig()).map(([pageKey, config]) => (
            <div key={pageKey}>
              <label>{config.name} ({pageKey})</label>
              <select
                value={permissions[pageKey] || 0}
                onChange={(e) => handlePermissionChange(pageKey, Number(e.target.value))}
              >
                <option value="0">なし</option>
                <option value="1">閲覧</option>
                <option value="2">閲覧 + 編集</option>
                <option value="3">閲覧 + 編集 + 承認</option>
              </select>
            </div>
          ))}
        </div>
      )}

      <button onClick={handleSubmit} disabled={!selectedUserId}>権限を更新</button>
    </div>
  );
};

export default AdminPage;
