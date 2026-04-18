package com.example.servercommon.model;

import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;
import org.springframework.core.io.Resource;

import com.example.servercommon.responseModel.ApiResponse;

import static org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication.Type.SERVLET;

@ConditionalOnWebApplication(type = SERVLET)
@RestControllerAdvice
public class ApiResponseAdvice implements ResponseBodyAdvice<Object> {

    @SuppressWarnings("null")
    @Override
    public boolean supports(MethodParameter returnType, Class converterType) {
        String path = org.springframework.web.context.request.RequestContextHolder
                .getRequestAttributes() != null
                ? ((org.springframework.web.context.request.ServletRequestAttributes)
                    org.springframework.web.context.request.RequestContextHolder.getRequestAttributes())
                    .getRequest().getRequestURI()
                : "";

        // Skip wrapping for swagger/openapi endpoints and file download endpoints
        if (path.startsWith("/v3/api-docs") || path.startsWith("/swagger-ui")
                || path.contains("/download")) {
            return false;
        }

        // Skip wrapping for Resource responses (e.g. file downloads)
        Class<?> paramType = returnType.getParameterType();
        if (Resource.class.isAssignableFrom(paramType)) {
            return false;
        }
        // Also check generic type for ResponseEntity<Resource>
        if (returnType.getGenericParameterType() instanceof java.lang.reflect.ParameterizedType pt) {
            java.lang.reflect.Type[] typeArgs = pt.getActualTypeArguments();
            if (typeArgs.length > 0 && typeArgs[0] instanceof Class<?> cls
                    && Resource.class.isAssignableFrom(cls)) {
                return false;
            }
        }

        return true;
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType,
                                  MediaType selectedContentType,
                                  Class selectedConverterType,
                                  ServerHttpRequest request,
                                  ServerHttpResponse response) {
        if (body instanceof ApiResponse) {
            return body;
        }
        if (body instanceof Resource || body instanceof byte[]) {
            return body;
        }
        return ApiResponse.success(body);
    }
}
