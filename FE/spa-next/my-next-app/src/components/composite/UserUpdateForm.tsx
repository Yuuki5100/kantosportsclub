// src/components/UserUpdateForm.tsx
import React, { useState, useEffect } from "react";
import { useUserProfile, useUpdateUserProfile } from "@/api/services/v1/userService";
import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "@/hooks/useSnackbar";
import { getMessage, MessageCodes } from "@/message";

const UserUpdateForm = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  // 現在のユーザー情報を取得
  const { data: user, isLoading, error } = useUserProfile();

  // フォーム入力の状態管理
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // ユーザーデータ取得後、フォームの初期値としてセット
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  // useApiMutation を利用してユーザー情報更新のミューテーションを作成
  const mutation = useUpdateUserProfile();

  const handleSuccess = (data: { name: string; email: string }) => {
    console.log("ユーザー情報が更新されました:", data);
    showSnackbar(getMessage(MessageCodes.USER_PROFILE_UPDATED), "SUCCESS");
    queryClient.invalidateQueries({ queryKey: ["userProfile"] });
  };

  const handleError = (error: unknown) => {
    console.error("ユーザー情報の更新に失敗しました:", error);
    showSnackbar(getMessage(MessageCodes.ACTION_FAILED, "ユーザー情報の更新"), "ERROR");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate({ name, email }, { onSuccess: handleSuccess, onError: handleError });
  };

  if (isLoading) return <p>Loading...</p>;
  if (error)
    return (
      <p style={{ color: "red" }}>
        {getMessage(MessageCodes.FETCH_FAILED_WITH_DETAIL, "ユーザーデータ", error.message)}
      </p>
    );

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>名前:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={mutation.status === null}>
        更新
      </button>
      {/* {mutation.status === "loading" && <p>更新中...</p>} */}
    </form>
  );
};

export default UserUpdateForm;
