# A. ?????????????
???????????????????????????????

## gateway
| ???? | ????????? | ???? | ?? | ?????? | ??????? | ???? | ?? |
|---|---|---|---|---|---|---|---|
| app | BE\gateway\src\main\resources\application.yml | ? | ??? | App URL | D | ????? |  |
| app.login | BE\gateway\src\main\resources\application.yml | ? | ??? | App URL | D | ????? |  |
| app.login.url | BE\gateway\src\main\resources\application.yml | @Value BE\servercommon\src\main\java\com\example\servercommon\impl\UserServiceImpl.java:UserServiceImpl | @Value ?? | App URL | D | application.yml |  |
| cors | BE\gateway\src\main\resources\application-local.yml<br>BE\gateway\src\main\resources\application-prd.yml<br>BE\gateway\src\main\resources\application-uat.yml<br>BE\gateway\src\main\resources\application.yml | ? | ??? | CORS | B | ????? |  |
| cors.allowed-origins | BE\gateway\src\main\resources\application-local.yml<br>BE\gateway\src\main\resources\application-prd.yml<br>BE\gateway\src\main\resources\application-uat.yml<br>BE\gateway\src\main\resources\application.yml | ? | ??? | CORS | B | ????? |  |
| cors.allowed-origins.http | BE\gateway\src\main\resources\application-local.yml<br>BE\gateway\src\main\resources\application.yml | ??? | ??? | CORS | B | ????? |  |
| cors.allowed-origins.https | BE\gateway\src\main\resources\application-prd.yml<br>BE\gateway\src\main\resources\application-uat.yml<br>BE\gateway\src\main\resources\application.yml | ??? | ??? | CORS | B | ????? | ????? (//uat-spa.example.com; //your-spa.example.com) |
| gateway | BE\gateway\src\main\resources\application-local.yml<br>BE\gateway\src\main\resources\application-prd.yml<br>BE\gateway\src\main\resources\application-uat.yml<br>BE\gateway\src\main\resources\application.yml | @ConfigurationProperties BE\gateway\src\main\java\apigateway\config\PublicPathProperties.java:PublicPathProperties (prefix=gateway) | ConfigurationProperties ?? | Gateway | D | application.yml |  |
| gateway.ip-whitelist | BE\gateway\src\main\resources\application-local.yml<br>BE\gateway\src\main\resources\application-prd.yml<br>BE\gateway\src\main\resources\application-uat.yml<br>BE\gateway\src\main\resources\application.yml | @ConfigurationProperties BE\gateway\src\main\java\apigateway\config\PublicPathProperties.java:PublicPathProperties (prefix=gateway) | ConfigurationProperties ?? | ??? | C | application-local.yml / application-uat.yml / application-prd.yml | ????? (127.0.0.1, ::1; 192.168.1.1, 10.0.0.0/24) |
| gateway.public-paths | BE\gateway\src\main\resources\application-local.yml<br>BE\gateway\src\main\resources\application-prd.yml<br>BE\gateway\src\main\resources\application-uat.yml<br>BE\gateway\src\main\resources\application.yml | @ConfigurationProperties BE\gateway\src\main\java\apigateway\config\PublicPathProperties.java:PublicPathProperties (prefix=gateway) | ConfigurationProperties ?? | ??? | D | application.yml |  |
| jwt | BE\gateway\src\main\resources\application-local.yml<br>BE\gateway\src\main\resources\application-prd.yml<br>BE\gateway\src\main\resources\application-uat.yml<br>BE\gateway\src\main\resources\application.yml | ? | ??? | JWT | D | ????? |  |
| jwt.expiration | BE\gateway\src\main\resources\application-local.yml<br>BE\gateway\src\main\resources\application.yml | @Value BE\appserver\src\main\java\com\example\appserver\security\JwtTokenProvider.java:JwtTokenProvider<br>@Value BE\batchserver\src\main\java\com\example\batchserver\config\JwtTokenProvider.java:JwtTokenProvider<br>@Value BE\gateway\src\main\java\apigateway\security\JwtTokenProvider.java:JwtTokenProvider | @Value ?? | JWT | D | application.yml |  |
| jwt.secret | BE\gateway\src\main\resources\application-local.yml<br>BE\gateway\src\main\resources\application-prd.yml<br>BE\gateway\src\main\resources\application-uat.yml<br>BE\gateway\src\main\resources\application.yml | @Value BE\appserver\src\main\java\com\example\appserver\security\JwtTokenProvider.java:JwtTokenProvider<br>@Value BE\batchserver\src\main\java\com\example\batchserver\config\JwtTokenProvider.java:JwtTokenProvider<br>@Value BE\gateway\src\main\java\apigateway\security\JwtTokenProvider.java:JwtTokenProvider | @Value ?? | JWT | A | application-local.yml / application-uat.yml / application-prd.yml | ????? (${JWT_SECRET_DEV}; ${JWT_SECRET_PROD}; 9Z7dhgOfEYM1wn+K3BVKzZ9qrG1C3BGOWFmc+q3A0RZbhH+0v2K7cF5VvwCqOAUHTqNqZY+cIT6VEt3JKbcQdg==) |
| logging | BE\gateway\src\main\resources\application.yml | ? | ??? | Logging | B | ????? |  |
| logging.level | BE\gateway\src\main\resources\application.yml | Spring Boot ?? | Spring Boot ???? | Logging | B | application.yml |  |
| logging.level.apigateway | BE\gateway\src\main\resources\application.yml | Spring Boot ?? | Spring Boot ???? | Logging | B | application.yml |  |
| logging.level.org.springframework.security | BE\gateway\src\main\resources\application.yml | Spring Boot ?? | Spring Boot ???? | Logging | B | application.yml |  |
| logging.level.org.springframework.web | BE\gateway\src\main\resources\application.yml | Spring Boot ?? | Spring Boot ???? | Logging | B | application.yml |  |
| mail | BE\gateway\src\main\resources\application.yml | ? | ??? | Mail | B | ????? |  |
| mail.from | BE\gateway\src\main\resources\application.yml | @Value BE\servercommon\src\main\java\com\example\servercommon\service\SesEmailSender.java:SesEmailSender<br>@Value BE\servercommon\src\test\java\com\example\servercommon\service\SesEmailSender.java:SesEmailSender | @Value ?? | Mail | B | application.yml |  |
| server | BE\gateway\src\main\resources\application-local.yml<br>BE\gateway\src\main\resources\application.yml | ? | ??? | Spring?? | D | ????? |  |
| server.port | BE\gateway\src\main\resources\application-local.yml<br>BE\gateway\src\main\resources\application.yml | Spring Boot ?? | Spring Boot ???? | Spring?? | D | application.yml |  |
| spring | BE\gateway\src\main\resources\application-local.yml<br>BE\gateway\src\main\resources\application-prd.yml<br>BE\gateway\src\main\resources\application-uat.yml<br>BE\gateway\src\main\resources\application.yml | ? | ??? | Spring?? | D | ????? |  |
| spring.application | BE\gateway\src\main\resources\application-local.yml<br>BE\gateway\src\main\resources\application.yml | Spring Boot ?? | Spring Boot ???? | Spring?? | D | application.yml |  |
| spring.application.name | BE\gateway\src\main\resources\application-local.yml<br>BE\gateway\src\main\resources\application.yml | Spring Boot ?? | Spring Boot ???? | Spring?? | D | application.yml |  |
| spring.cloud | BE\gateway\src\main\resources\application-local.yml | Spring Boot ?? | Spring Boot ???? | Spring?? | D | application.yml |  |
| spring.cloud.gateway | BE\gateway\src\main\resources\application-local.yml | Spring Boot ?? | Spring Boot ???? | Gateway | D | application.yml |  |
| spring.cloud.gateway.default-filters | BE\gateway\src\main\resources\application-local.yml | Spring Boot ?? | Spring Boot ???? | Gateway | D | application.yml |  |
| spring.cloud.gateway.routes | BE\gateway\src\main\resources\application-local.yml | Spring Boot ?? | Spring Boot ???? | Gateway | D | application.yml |  |
| spring.cloud.gateway.routes.filters | BE\gateway\src\main\resources\application-local.yml | Spring Boot ?? | Spring Boot ???? | Gateway | D | application.yml |  |
| spring.cloud.gateway.routes.filters.args | BE\gateway\src\main\resources\application-local.yml | Spring Boot ?? | Spring Boot ???? | Gateway | D | application.yml |  |
| spring.cloud.gateway.routes.filters.args.redis-rate-limiter.burstCapacity | BE\gateway\src\main\resources\application-local.yml | Spring Boot ?? | Spring Boot ???? | Gateway | D | application.yml |  |
| spring.cloud.gateway.routes.filters.args.redis-rate-limiter.replenishRate | BE\gateway\src\main\resources\application-local.yml | Spring Boot ?? | Spring Boot ???? | Gateway | D | application.yml |  |
| spring.cloud.gateway.routes.filters.name | BE\gateway\src\main\resources\application-local.yml | Spring Boot ?? | Spring Boot ???? | Gateway | D | application.yml |  |
| spring.cloud.gateway.routes.id | BE\gateway\src\main\resources\application-local.yml | Spring Boot ?? | Spring Boot ???? | Gateway | D | application.yml |  |
| spring.cloud.gateway.routes.predicates | BE\gateway\src\main\resources\application-local.yml | Spring Boot ?? | Spring Boot ???? | Gateway | D | application.yml |  |
| spring.cloud.gateway.routes.uri | BE\gateway\src\main\resources\application-local.yml | Spring Boot ?? | Spring Boot ???? | Gateway | D | application.yml |  |
| spring.codec | BE\gateway\src\main\resources\application-local.yml | Spring Boot ?? | Spring Boot ???? | Spring?? | D | application.yml |  |
| spring.codec.max-in-memory-size | BE\gateway\src\main\resources\application-local.yml | Spring Boot ?? | Spring Boot ???? | Spring?? | D | application.yml |  |
| spring.config | BE\gateway\src\main\resources\application-prd.yml<br>BE\gateway\src\main\resources\application-uat.yml | Spring Boot ?? | Spring Boot ???? | Spring?? | D | application.yml |  |
| spring.config.activate | BE\gateway\src\main\resources\application-prd.yml<br>BE\gateway\src\main\resources\application-uat.yml | Spring Boot ?? | Spring Boot ???? | Spring?? | D | application.yml |  |
| spring.config.activate.on-profile | BE\gateway\src\main\resources\application-prd.yml<br>BE\gateway\src\main\resources\application-uat.yml | Spring Boot ?? | Spring Boot ???? | Spring?? | C | application-uat.yml / application-prd.yml | ????? (prd; uat) |
| spring.main | BE\gateway\src\main\resources\application-local.yml<br>BE\gateway\src\main\resources\application.yml | Spring Boot ?? | Spring Boot ???? | Spring?? | D | application.yml |  |
| spring.main.web-application-type | BE\gateway\src\main\resources\application-local.yml<br>BE\gateway\src\main\resources\application.yml | Spring Boot ?? | Spring Boot ???? | Spring?? | D | application.yml |  |
| spring.redis | BE\gateway\src\main\resources\application-local.yml<br>BE\gateway\src\main\resources\application-prd.yml<br>BE\gateway\src\main\resources\application-uat.yml | Spring Boot ?? | Spring Boot ???? | Redis | A | application.yml |  |
| spring.redis.host | BE\gateway\src\main\resources\application-local.yml<br>BE\gateway\src\main\resources\application-prd.yml<br>BE\gateway\src\main\resources\application-uat.yml | Spring Boot ?? | Spring Boot ???? | Redis | A | application-local.yml / application-uat.yml / application-prd.yml | ????? (${REDIS_HOST:prd-redis-host}; ${REDIS_HOST:uat-redis-host}; localhost) |
| spring.redis.port | BE\gateway\src\main\resources\application-local.yml<br>BE\gateway\src\main\resources\application-prd.yml<br>BE\gateway\src\main\resources\application-uat.yml | Spring Boot ?? | Spring Boot ???? | Redis | A | application-local.yml / application-uat.yml / application-prd.yml | ????? (${REDIS_PORT:6379}; 6379) |
| storage | BE\gateway\src\main\resources\application.yml | ? | ??? | Storage | D | ????? |  |
| storage.cloud | BE\gateway\src\main\resources\application.yml | ? | ??? | Storage | D | ????? |  |
| storage.cloud.gateway | BE\gateway\src\main\resources\application.yml | ? | ??? | Storage | D | ????? |  |
| storage.cloud.gateway.default-filters | BE\gateway\src\main\resources\application.yml | ??? | ??? | Storage | D | ????? |  |
| storage.cloud.gateway.routes | BE\gateway\src\main\resources\application.yml | ? | ??? | Storage | D | ????? |  |
| storage.cloud.gateway.routes.filters | BE\gateway\src\main\resources\application.yml | ? | ??? | Storage | D | ????? |  |
| storage.cloud.gateway.routes.filters.args | BE\gateway\src\main\resources\application.yml | ? | ??? | Storage | D | ????? |  |
| storage.cloud.gateway.routes.filters.args.redis-rate-limiter.burstCapacity | BE\gateway\src\main\resources\application.yml | ??? | ??? | Storage | D | ????? |  |
| storage.cloud.gateway.routes.filters.args.redis-rate-limiter.replenishRate | BE\gateway\src\main\resources\application.yml | ??? | ??? | Storage | D | ????? |  |
| storage.cloud.gateway.routes.filters.name | BE\gateway\src\main\resources\application.yml | ??? | ??? | Storage | D | ????? |  |
| storage.cloud.gateway.routes.id | BE\gateway\src\main\resources\application.yml | ??? | ??? | Storage | D | ????? |  |
| storage.cloud.gateway.routes.predicates | BE\gateway\src\main\resources\application.yml | ??? | ??? | Storage | D | ????? |  |
| storage.cloud.gateway.routes.uri | BE\gateway\src\main\resources\application.yml | ??? | ??? | Storage | D | ????? |  |
| storage.codec | BE\gateway\src\main\resources\application.yml | ? | ??? | Storage | D | ????? |  |
| storage.codec.max-in-memory-size | BE\gateway\src\main\resources\application.yml | ??? | ??? | Storage | D | ????? |  |
| storage.redis | BE\gateway\src\main\resources\application.yml | ? | ??? | Storage | D | ????? |  |
| storage.redis.host | BE\gateway\src\main\resources\application.yml | ??? | ??? | Storage | D | ????? |  |
| storage.redis.port | BE\gateway\src\main\resources\application.yml | ??? | ??? | Storage | D | ????? |  |
| storage.s3 | BE\gateway\src\main\resources\application.yml | @ConfigurationProperties BE\servercommon\src\main\java\com\example\servercommon\utils\StorageProperties.java:StorageProperties (prefix=storage.s3) | ConfigurationProperties ?? | Storage | D | application.yml |  |
| storage.s3.access-key | BE\gateway\src\main\resources\application.yml | @ConfigurationProperties BE\servercommon\src\main\java\com\example\servercommon\utils\StorageProperties.java:StorageProperties (prefix=storage.s3) | ConfigurationProperties ?? | Storage | A | application.yml |  |
| storage.s3.archive-dir | BE\gateway\src\main\resources\application.yml | @ConfigurationProperties BE\servercommon\src\main\java\com\example\servercommon\utils\StorageProperties.java:StorageProperties (prefix=storage.s3) | ConfigurationProperties ?? | Storage | D | application.yml |  |
| storage.s3.bucket | BE\gateway\src\main\resources\application.yml | @ConfigurationProperties BE\servercommon\src\main\java\com\example\servercommon\utils\StorageProperties.java:StorageProperties (prefix=storage.s3) | ConfigurationProperties ?? | Storage | D | application.yml |  |
| storage.s3.endpoint | BE\gateway\src\main\resources\application.yml | @ConfigurationProperties BE\servercommon\src\main\java\com\example\servercommon\utils\StorageProperties.java:StorageProperties (prefix=storage.s3) | ConfigurationProperties ?? | Storage | D | application.yml |  |
| storage.s3.error-dir | BE\gateway\src\main\resources\application.yml | @ConfigurationProperties BE\servercommon\src\main\java\com\example\servercommon\utils\StorageProperties.java:StorageProperties (prefix=storage.s3) | ConfigurationProperties ?? | Storage | D | application.yml |  |
| storage.s3.input-dir | BE\gateway\src\main\resources\application.yml | @ConfigurationProperties BE\servercommon\src\main\java\com\example\servercommon\utils\StorageProperties.java:StorageProperties (prefix=storage.s3) | ConfigurationProperties ?? | Storage | D | application.yml |  |
| storage.s3.secret-key | BE\gateway\src\main\resources\application.yml | @ConfigurationProperties BE\servercommon\src\main\java\com\example\servercommon\utils\StorageProperties.java:StorageProperties (prefix=storage.s3) | ConfigurationProperties ?? | Storage | A | application.yml |  |
| storage.type | BE\gateway\src\main\resources\application.yml | ??? | ??? | Storage | D | ????? |  |
| teams | BE\gateway\src\main\resources\application-local.yml<br>BE\gateway\src\main\resources\application-prd.yml<br>BE\gateway\src\main\resources\application-uat.yml<br>BE\gateway\src\main\resources\application.yml | ? | ??? | Teams?? | D | ????? |  |
| teams.webhook | BE\gateway\src\main\resources\application-local.yml<br>BE\gateway\src\main\resources\application-prd.yml<br>BE\gateway\src\main\resources\application-uat.yml<br>BE\gateway\src\main\resources\application.yml | ? | ??? | Teams?? | A | ????? |  |
| teams.webhook.url | BE\gateway\src\main\resources\application-local.yml<br>BE\gateway\src\main\resources\application-prd.yml<br>BE\gateway\src\main\resources\application-uat.yml<br>BE\gateway\src\main\resources\application.yml | @Value BE\servercommon\src\main\java\com\example\servercommon\notification\TeamsNotificationService.java:TeamsNotificationService | @Value ?? | Teams?? | A | application-local.yml / application-uat.yml / application-prd.yml | ????? (${TEAMS_WEBHOOK_DEV}; ${TEAMS_WEBHOOK_PROD}; https://example.com/dummy-webhook-url?) |
