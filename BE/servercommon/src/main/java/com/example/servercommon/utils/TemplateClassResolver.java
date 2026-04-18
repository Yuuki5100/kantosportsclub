package com.example.servercommon.utils;

import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.Orders;
import com.example.servercommon.model.UserModel;
// import com.example.servercommon.model.Product;

public class TemplateClassResolver {

    /**
     * templateId に応じてエンティティクラスを返す
     */
    public static Class<?> resolveEntityClass(String templateId) {
        return switch (templateId) {
            case "users" -> UserModel.class;
            case "orders" -> Orders.class;
            default -> throw new IllegalArgumentException(BackendMessageCatalog.format(
                    BackendMessageCatalog.EX_UNSUPPORTED_TEMPLATE, templateId));
        };
    }
}
