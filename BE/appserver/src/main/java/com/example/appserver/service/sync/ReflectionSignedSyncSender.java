package com.example.appserver.service.sync;

import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.responseModel.ApiResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ReflectionSignedSyncSender implements SignedSyncSender {

    private static final String SIGNED_REST_TEMPLATE_CLASS_NAME =
            "com.example.syncconnector.http.SignedRestTemplate";

    private final ApplicationContext applicationContext;
    private final ObjectMapper objectMapper;

    @Override
    public boolean isAvailable() {
        return resolveBeanAndMethod().isPresent();
    }

    @Override
    public ApiResponse<Object> post(String url, JsonNode payload) {
        BeanAndMethod beanAndMethod = resolveBeanAndMethod()
                .orElseThrow(() -> new IllegalStateException(BackendMessageCatalog.EX_SIGNED_REST_TEMPLATE_UNAVAILABLE));
        try {
            Object raw = beanAndMethod.postMethod().invoke(beanAndMethod.bean(), url, payload, Object.class);
            if (raw == null) {
                return null;
            }
            return objectMapper.convertValue(raw, new TypeReference<ApiResponse<Object>>() {
            });
        } catch (InvocationTargetException ex) {
            Throwable cause = ex.getCause();
            if (cause instanceof RuntimeException runtimeException) {
                throw runtimeException;
            }
            throw new RuntimeException(cause);
        } catch (IllegalAccessException ex) {
            throw new RuntimeException(ex);
        }
    }

    private Optional<BeanAndMethod> resolveBeanAndMethod() {
        try {
            Class<?> signedRestTemplateClass = Class.forName(SIGNED_REST_TEMPLATE_CLASS_NAME);
            Object bean = applicationContext.getBean(signedRestTemplateClass);
            Method postMethod = signedRestTemplateClass.getMethod("post", String.class, Object.class, Class.class);
            return Optional.of(new BeanAndMethod(bean, postMethod));
        } catch (ClassNotFoundException ex) {
            return Optional.empty();
        } catch (NoSuchMethodException ex) {
            throw new IllegalStateException(BackendMessageCatalog.EX_SIGNED_REST_TEMPLATE_SIGNATURE_INCOMPATIBLE, ex);
        } catch (Exception ex) {
            return Optional.empty();
        }
    }

    private record BeanAndMethod(Object bean, Method postMethod) {
    }
}
