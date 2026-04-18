package apigateway;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import apigateway.exception.ForbiddenException;
import apigateway.exception.UnauthorizedException;

@RestController
@RequestMapping("/test-error")
public class ErrorTestController {
    private static final String MSG_AUTH_FAILED = "認証失敗";
    private static final String MSG_ACCESS_DENIED = "アクセス拒否";
    private static final String MSG_INTERNAL_ERROR = "内部エラー";

    @GetMapping("/unauthorized")
    public void throwUnauthorized() {
        throw new UnauthorizedException(MSG_AUTH_FAILED);
    }

    @GetMapping("/forbidden")
    public void throwForbidden() {
        throw new ForbiddenException(MSG_ACCESS_DENIED);
    }

    @GetMapping("/runtime")
    public void throwRuntime() {
        throw new RuntimeException(MSG_INTERNAL_ERROR);
    }
}
