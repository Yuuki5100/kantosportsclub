### ✅ `fetch` サンプル（IDを切り替えてGET）

#### 📁 `src/services/userService.ts` に追加

```ts
// ユーザー詳細取得（ID指定で切り替え）
export const useUserDetail = (userId: string | undefined) => {
  return useFetch<userType>(
    'userDetail',
    userId ? `${API_ENDPOINTS.USER.LIST}/${userId}` : '', // API例： /user/list/{id}
    undefined,
    {
      staleTime: 1000 * 60 * 1, // 1分
    }
  );
};
```

#### ✅ 使用例（コンポーネント内）

```tsx
import { useUserDetail } from '@/services/userService';

const UserDetail = ({ userId }: { userId: string }) => {
  const { data, isLoading, error } = useUserDetail(userId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error occurred: {error.message}</div>;
  if (!data) return <div>No user found</div>;

  return (
    <div>
      <h2>{data.name}</h2>
      <p>Email: {data.email}</p>
      {/* 他の情報 */}
    </div>
  );
};
```
###  `再フェッチ`
```tsx
queryClient.invalidateQueries({ queryKey: ['userDetail', 'user-123'] });
```

###  `即キャッシュ更新`
```tsx
queryClient.setQueryData(['userDetail', 'user-123'], newUserData);
```


---

### ✅ `mutation` サンプル（POST / PUT / DELETE）

#### 📁 `src/services/userService.ts` に追加

```ts
import { useApiMutation } from '@/hooks/useApi';

// ユーザー更新（PUT）
export const useUpdateUser = (userId: string) => {
  return useApiMutation<userType, Partial<userType>>(
    'put',
    `${API_ENDPOINTS.USER.UPDATE_PROFILE}/${userId}`
  );
};

// ユーザー削除（DELETE）
export const useDeleteUser = (userId: string) => {
  return useApiMutation<void, {}>(
    'delete',
    `${API_ENDPOINTS.ADMIN.DELETE_USER}/${userId}`
  );
};
```

#### ✅ 使用例（更新フォーム）

```tsx
import { useUpdateUser } from '@/services/userService';

const UpdateUserForm = ({ userId }: { userId: string }) => {
  const { mutate, isPending, isSuccess, error } = useUpdateUser(userId);

  const handleSubmit = () => {
    mutate({
      name: '新しい名前',
      email: 'new@example.com',
    });
  };

  return (
    <div>
      <button onClick={handleSubmit} disabled={isPending}>
        更新する
      </button>
      {isSuccess && <p>更新成功</p>}
      {error && <p>更新失敗: {error.message}</p>}
    </div>
  );
};
```



