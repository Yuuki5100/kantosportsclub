# ✅ ユーザー作成API実装手順書（認証・認可対応込み）

---

## ✅ **1. 実装対象**

- エンドポイント：`POST /user/create`
- 認証：セッションベース（httpOnly Cookie）
- 認可：ロールまたはカスタムグループレベルに基づくアクセス制御

---

## ✅ **2. 実装構成と目的**

| 層 | クラス・ファイル | 目的 |
|----|------------------|------|
| Controller層 | `UserController` | エンドポイント定義・リクエスト受け取り |
| Request DTO | `CreateUserRequest` | バリデーション付きリクエスト定義 |
| Service層 | `UserService / Impl` | ユーザー作成ビジネスロジック |
| Repository層 | `UserRepository` | DBアクセス（保存・重複チェック） |
| Mapper層 | `UserResponseMapper` | Entity → DTO 変換 |
| Response DTO | `UserResponse` | 外部返却用DTO |
| 認可設定 | `@PreAuthorize`, `PermissionChecker`, `EndpointPermissionConfig` | エンドポイント権限制御 |

---

## ✅ **3. 手順一覧**

---

### ✅ 3-1. リクエストDTOの作成

**`appserver/request/user/CreateUserRequest.java`**
```java
public class CreateUserRequest {

    @ValidUsername
    @NotBlank
    private String username;

    @NotBlank
    private String password;

    @Email
    @NotBlank
    private String email;

    // getter/setter
}
```

---

### ✅ 3-2. サービスインターフェース定義

**`servercommon/service/UserService.java`**
```java
public interface UserService {
    User createUser(CreateUserRequest request);
}
```

---

### ✅ 3-3. サービス実装クラスの作成

**`servercommon/service/impl/UserServiceImpl.java`**
```java
@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User createUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setRole(UserRole.CUSTOM); // デフォルトで CUSTOM

        return userRepository.save(user);
    }
}
```

---

### ✅ 3-4. Repositoryの作成

**`servercommon/repository/UserRepository.java`**
```java
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);
}
```

---

### ✅ 3-5. Mapperの作成

**`servercommon/mapper/UserResponseMapper.java`**
```java
@Component
public class UserResponseMapper {
    public UserResponse fromUser(User user) {
        UserResponse dto = new UserResponse();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        return dto;
    }
}
```

---

### ✅ 3-6. レスポンスDTOの作成

**`servercommon/responcemodel/UserResponse.java`**
```java
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String role;
    // getter/setter
}
```

---

### ✅ 3-7. コントローラーの実装（認可付き）

**`appserver/controller/UserController.java`**
```java
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserResponseMapper userResponseMapper;

    @PreAuthorize("@permissionChecker.checkPermission(authentication, '/user/create')")
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
        @Valid @RequestBody CreateUserRequest request) {

        User created = userService.createUser(request);
        UserResponse response = userResponseMapper.fromUser(created);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
```

---

## ✅ **4. 認可設定の追加**

---

### ✅ 4-1. `EndpointPermissionConfig` への定義追加

**`appserver/config/EndpointPermissionConfig.java`**
```java
@Bean
public Map<String, EndpointPermission> endpointPermissions() {
    Map<String, EndpointPermission> map = new HashMap<>();

    // 既存エンドポイントに加えて
    map.put("/user/create", new EndpointPermission(
        "/user/create", // エンドポイント
        2,              // requiredLevel
        List.of("ADMIN", "EDITOR"),       // allowedRoles
        Map.of("admin", 2)                // CUSTOM用グループ設定
    ));

    return map;
}
```

---

### ✅ 4-2. `@PreAuthorize` + `PermissionChecker` による制御

- `PermissionChecker` により、ロールベース・カスタムグループベース両方に対応。
- `/user/create` にアクセスしたユーザーのロール・グループ・レベルが `requiredLevel >= 2` を満たす必要があります。

---

## ✅ **5. バリデーション用アノテーション（任意）**

**`servercommon/validation/ValidUsername.java`**（略）

---

## ✅ **6. 認証状態の利用（例：ログインユーザーを取得）**

```java
User currentUser = ((CustomUserDetails)
  SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getDomainUser();
```

---

## ✅ **7. テスト確認**

### 🔁 リクエスト

```http
POST /user/create
Content-Type: application/json
Cookie: JSESSIONID=xxxxxxx

{
  "username": "testuser1",
  "password": "password123",
  "email": "test@example.com"
}
```

### ✅ 成功レスポンス

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "testuser1",
    "email": "test@example.com",
    "role": "CUSTOM"
  }
}
```

### ❌ 失敗例（認可エラー）

```json
{
  "success": false,
  "errorCode": "E403",
  "message": "Access Denied"
}
```

---

## ✅ **8. 備考**

- `PasswordEncoder` は `SecurityConfig` にて `@Bean` 登録
- `GlobalExceptionHandler` によるエラーハンドリングを統一
- 必要に応じて `JobStatus` へのログ出力など追加可能

---

## ✅ 9. まとめ

| 項目 | 対応内容 |
|------|----------|
| DTO定義 | `CreateUserRequest`, `UserResponse` |
| バリデーション | `@ValidUsername`, `@Email`, `@NotBlank` |
| Controller | `@PreAuthorize` + `/user/create` POST API |
| Service | ユーザー作成ロジックと重複チェック |
| 認可設定 | `EndpointPermissionConfig` で `requiredLevel=2` |
| 認可判定 | `PermissionChecker` により一元管理 |
| 認証状態確認 | `SecurityContextHolder` 経由でログインユーザー取得 |

---

