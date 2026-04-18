# **DBアクセス設計書（バックエンド編）**

## **1. モジュール概要**

### **1-1. 目的**

DBアクセス（JPA / MyBatis / DataSource 設定）の構成と責務を整理します。

### **1-2. 適用範囲**

- 対象モジュール: `appserver`, `servercommon`
- 主な構成: Spring Data JPA / MyBatis / DataSource

---
## **2. 設計概要**

### **2-1. DataSource 設定**

- `DataSourceConfig` で `DataSourceProperties` から `DataSource` を生成
- `spring.datasource` の設定を参照

```java
@Configuration
public class DataSourceConfig {
    @Bean
    public DataSource dataSource() {
        return dataSourceProperties.initializeDataSourceBuilder().build();
    }
}
```

### **2-2. JPA リポジトリ構成**

- `AppServerApplication` で以下を有効化
  - `@EntityScan(basePackages = {"com.example.servercommon.model"})`
  - `@EnableJpaRepositories(basePackages = {"com.example.servercommon.repository", "com.example.appserver.repository"})`
- 新規の JPA Entity / 共通モデルは `com.example.servercommon.model` を標準配置とする
- 新規 Repository は `com.example.servercommon.repository` を標準配置とする
- `com.example.appserver.repository` の走査設定は互換目的で残るが、新設の標準配置先ではない

### **2-3. MyBatis 構成**

- `CommonMybatisConfig` で `@MapperScan` を有効化
- `AppServerApplication` でも `com.example.servercommon.mapper` を走査

```java
@Configuration
@MapperScan(basePackages = {"com.example", "com.example.servercommon"}, annotationClass = Mapper.class)
public class CommonMybatisConfig {}
```

---
## **3. 主要パッケージ構成**

```
appserver
└── config
    ├── DataSourceConfig.java
    └── CommonMybatisConfig.java

servercommon
└── repository
└── mapper
└── model
```

---
