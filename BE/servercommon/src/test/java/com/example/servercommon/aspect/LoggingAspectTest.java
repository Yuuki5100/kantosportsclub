package com.example.servercommon.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.Signature;
import org.aspectj.lang.reflect.MethodSignature;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.example.servercommon.aspect.LoggingAspect;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class LoggingAspectTest {

    private LoggingAspect aspect;

    @BeforeEach
    void setUp() {
        aspect = new LoggingAspect();
    }

    @Test
    void logAround_正常系_ログ出力と戻り値を確認() throws Throwable {
        ProceedingJoinPoint joinPoint = mock(ProceedingJoinPoint.class);
        Signature signature = mock(MethodSignature.class);

        when(joinPoint.getSignature()).thenReturn(signature);
        when(signature.toShortString()).thenReturn("MyService.myMethod(..)");
        when(joinPoint.getArgs()).thenReturn(new Object[]{"arg1", 123});
        when(joinPoint.proceed()).thenReturn("result-value");

        Object result = aspect.logAround(joinPoint);

        assertEquals("result-value", result);
        verify(joinPoint, times(1)).proceed();
    }

    @Test
    void logAround_例外発生時_IllegalArgumentExceptionが再スローされる() throws Throwable {
        ProceedingJoinPoint joinPoint = mock(ProceedingJoinPoint.class);
        Signature signature = mock(Signature.class);

        when(joinPoint.getSignature()).thenReturn(signature);
        when(signature.toShortString()).thenReturn("MyService.myMethod(..)");
        when(joinPoint.getArgs()).thenReturn(new Object[]{"badArg"});

        // 👇 ここが重要
        doThrow(new IllegalArgumentException("invalid input"))
            .when(joinPoint).proceed();

        Throwable thrown = assertThrows(IllegalArgumentException.class, () -> {
            new LoggingAspect().logAround(joinPoint);
        });

        assertEquals("invalid input", thrown.getMessage());
        verify(joinPoint).proceed();
    }

}
