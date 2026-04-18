package com.example.appserver.permission;

import com.example.servercommon.model.EndpointAuthorityMapping;
import com.example.servercommon.repository.EndpointAuthorityMappingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PermissionConfigProviderImplTest {

    private EndpointAuthorityMappingRepository repository;
    private PermissionConfigProviderImpl provider;

    @BeforeEach
    void setUp() {
        repository = mock(EndpointAuthorityMappingRepository.class);
        provider = new PermissionConfigProviderImpl(repository);
    }

    @Test
    void refresh_shouldLoadAndAggregateByMethodUrl() {
        EndpointAuthorityMapping m1 = mapping("/api/user/**", "GET", 100L, 1);
        EndpointAuthorityMapping m2 = mapping("/api/user/**", "GET", 100L, 3);
        EndpointAuthorityMapping m3 = mapping("/api/user/**", "GET", 200L, 2);
        when(repository.findAll()).thenReturn(List.of(m1, m2, m3));

        provider.refresh();

        Map<String, PermissionConfigProvider.EndpointPermissions> endpoints = provider.getEndpointPermissions();
        assertEquals(1, endpoints.size());

        PermissionConfigProvider.EndpointPermissions ep = endpoints.get("GET /api/user/**");
        assertNotNull(ep);
        assertEquals(2, ep.getCustom().size());
        assertEquals(3, ep.getCustom().get("100"));
        assertEquals(2, ep.getCustom().get("200"));
        assertEquals(3, ep.getRequiredLevel());
    }

    @Test
    void findEndpointPermissions_shouldResolveByAntPathPattern() {
        EndpointAuthorityMapping m1 = mapping("/api/report/**", "POST", 300L, 2);
        when(repository.findAll()).thenReturn(List.of(m1));
        provider.refresh();

        Optional<PermissionConfigProvider.EndpointPermissions> matched =
                provider.findEndpointPermissions("POST", "/api/report/export/2026");

        assertTrue(matched.isPresent());
        assertEquals(2, matched.get().getCustom().get("300"));
    }

    @Test
    void refresh_shouldReplaceOldSnapshot() {
        when(repository.findAll()).thenReturn(
                List.of(mapping("/api/a", "GET", 1L, 1)),
                List.of(mapping("/api/b", "GET", 2L, 2))
        );

        provider.refresh();
        assertTrue(provider.findEndpointPermissions("GET", "/api/a").isPresent());
        assertTrue(provider.findEndpointPermissions("GET", "/api/b").isEmpty());

        provider.refresh();
        assertTrue(provider.findEndpointPermissions("GET", "/api/a").isEmpty());
        assertTrue(provider.findEndpointPermissions("GET", "/api/b").isPresent());
    }

    private EndpointAuthorityMapping mapping(String url, String method, Long menuFunctionId, Integer requiredLevel) {
        EndpointAuthorityMapping mapping = new EndpointAuthorityMapping();
        mapping.setUrl(url);
        mapping.setMethod(method);
        mapping.setMenuFunctionId(menuFunctionId);
        mapping.setRequiredLevel(requiredLevel);
        return mapping;
    }
}
