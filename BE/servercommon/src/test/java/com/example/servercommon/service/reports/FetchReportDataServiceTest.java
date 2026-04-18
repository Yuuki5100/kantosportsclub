package com.example.servercommon.service.reports;

import com.example.servercommon.model.ReportLayout;
import org.apache.commons.beanutils.PropertyUtils;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;

class FetchReportDataServiceTest {

    private final FetchReportDataService fetchReportDataService = new FetchReportDataService(); // EntityManager不要

public static class User {
    private String name;
    private Email email;

    public User(String name, Email email) {
        this.name = name;
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public Email getEmail() {
        return email;
    }
}

public static class Email {
    private String address;

    public Email(String address) {
        this.address = address;
    }

    public String getAddress() {
        return address;
    }
}

    @Test
    void fetchReportData_shouldExtractFlatProperty() {
        ReportLayout layout = new ReportLayout();
        layout.setPropertyPath("name");

        List<User> entities = List.of(new User("田中太郎", new Email("taro@example.com")));

        List<Map<String, Object>> result = fetchReportDataService.fetchReportData(entities, List.of(layout));
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).containsEntry("name", "田中太郎");
    }

    @Test
    void fetchReportData_shouldExtractNestedProperty() {
        ReportLayout layout = new ReportLayout();
        layout.setPropertyPath("email.address");

        List<User> entities = List.of(new User("田中太郎", new Email("taro@example.com")));

        List<Map<String, Object>> result = fetchReportDataService.fetchReportData(entities, List.of(layout));
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).containsEntry("email.address", "taro@example.com");
    }

    @Test
    void fetchReportData_shouldHandleNullNestedPropertyGracefully() {
        ReportLayout layout = new ReportLayout();
        layout.setPropertyPath("email.address");

        List<User> entities = List.of(new User("田中太郎", null));

        List<Map<String, Object>> result = fetchReportDataService.fetchReportData(entities, List.of(layout));
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).containsEntry("email.address", null);
    }

    @Test
    void fetchReportData_shouldHandleMissingProperty() {
        ReportLayout layout = new ReportLayout();
        layout.setPropertyPath("nonExistent");

        List<User> entities = List.of(new User("田中太郎", null));

        List<Map<String, Object>> result = fetchReportDataService.fetchReportData(entities, List.of(layout));
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).containsEntry("nonExistent", null); // 例外にならずnull
    }

    @Test
    void fetchReportData_shouldReturnEmptyListForEmptyInput() {
        ReportLayout layout = new ReportLayout();
        layout.setPropertyPath("name");

        List<User> entities = List.of(); // 空リスト

        List<Map<String, Object>> result = fetchReportDataService.fetchReportData(entities, List.of(layout));
        assertThat(result).isEmpty();
    }

}
