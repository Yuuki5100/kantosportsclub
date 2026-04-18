package com.example.servercommon.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Aspect
@Component
public class LoggingAspect {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    // Controller と Service に所属するクラスのメソッドを対象にするポイントカット
    @Pointcut("within(@org.springframework.web.bind.annotation.RestController *) || " +
              "within(@org.springframework.stereotype.Service *)")
    public void applicationPackagePointcut() {
        // ポイントカットの定義
    }

    @Around("applicationPackagePointcut()")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
        logger.info("Entering: {} with arguments {}",
                    joinPoint.getSignature().toShortString(),
                    Arrays.toString(joinPoint.getArgs()));
        try {
            Object result = joinPoint.proceed();
            logger.info("Exiting: {} with result {}",
                        joinPoint.getSignature().toShortString(),
                        result);
            return result;
        } catch (Exception e) {
            logger.error("Exception occured: {} in {} with arguments {}",
                        e.getMessage(),
                        joinPoint.getSignature().toShortString(),
                        Arrays.toString(joinPoint.getArgs()));
            throw e;
        }
    }
}
