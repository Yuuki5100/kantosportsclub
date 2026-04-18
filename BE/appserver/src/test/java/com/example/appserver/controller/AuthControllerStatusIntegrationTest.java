package com.example.appserver.controller;

import com.example.appserver.permission.PermissionConfigProvider;
import com.example.appserver.security.CustomUserDetails;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.model.UserRole;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Disabled("Controller統合テストは一時スキップ")
class AuthControllerStatusIntegrationTest {

    @MockBean
    private PermissionConfigProvider permissionConfigProvider;

    @BeforeEach
    void setup() {
        setupMockMvc();

        Map<String, PermissionConfigProvider.EndpointPermissions> dummyMap = Map.of(
                "GET /auth/status", new DummyEndpointPermissions());

        when(permissionConfigProvider.getEndpointPermissions()).thenReturn(dummyMap);
        when(permissionConfigProvider.findEndpointPermissions(anyString(), anyString()))
                .thenReturn(Optional.of(new DummyEndpointPermissions()));
        when(permissionConfigProvider.getRequiredLevel(anyString())).thenReturn(0);
    }

    static class DummyEndpointPermissions implements PermissionConfigProvider.EndpointPermissions {
        @Override
        public List<String> getPermissions() {
            return List.of("VIEWER");
        }

        @Override
        public void setPermissions(List<String> permissions) {
        }

        @Override
        public Map<String, Integer> getCustom() {
            return Map.of();
        }

        @Override
        public void setCustom(Map<String, Integer> custom) {
        }

        @Override
        public int getRequiredLevelForCustomRole(String role) {
            return 0;
        }

        @Override
        public int getRequiredLevel() {
            return 0;
        }

        @Override
        public int getDefaultLevel() {
            return 0;
        }
    }

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    private void setupMockMvc() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("✅ 認証済みユーザーが /auth/status を呼び出したときに 200 OK とユーザー情報が返る")
    void authenticatedUser_status_returnsOk() throws Exception {
        setupMockMvc();

        UserModel user = new UserModel();
        user.setUserId("testuser");
        user.setPassword("secret");
        user.setEmail("test@example.com");
        // role は roleId(int) 運用ならこっち
        user.setRoleId(UserRole.VIEWER.getRoleId());

        Map<Integer, Integer> rolePermissions = Map.of(101, 2, 201, 1);
        CustomUserDetails userDetails = new CustomUserDetails(user, rolePermissions);

        var authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        mockMvc.perform(get("/auth/status").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.authenticated").value(true))
                // username を返す設計じゃないなら、userId を見るのが安全
                .andExpect(jsonPath("$.data.user.userId").value("testuser"))
                .andExpect(jsonPath("$.data.rolePermissions['101']").value(2));
    }

    @Test
    @DisplayName("❌ 未認証ユーザー（null authentication）に対して 403 が返る")
    void unauthenticatedUser_status_returnsForbidden() throws Exception {
        setupMockMvc();
        SecurityContextHolder.clearContext();

        mockMvc.perform(get("/auth/status").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("E403"));
    }

    @Test
    @DisplayName("❌ anonymousUser の場合も 403 が返る")
    void anonymousUser_status_returnsForbidden() throws Exception {
        setupMockMvc();

        var auth = new AnonymousAuthenticationToken(
                "key", "anonymousUser", List.of(new SimpleGrantedAuthority("ROLE_ANONYMOUS")));
        SecurityContextHolder.getContext().setAuthentication(auth);

        mockMvc.perform(get("/auth/status").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("E403"));
    }

    @Test
    @DisplayName("❌ principal が CustomUserDetails 以外の場合も 403 が返る")
    void invalidPrincipal_status_returnsForbidden() throws Exception {
        setupMockMvc();

        var auth = new UsernamePasswordAuthenticationToken("stringUser", null, List.of());
        SecurityContextHolder.getContext().setAuthentication(auth);

        mockMvc.perform(get("/auth/status").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("E403"));
    }
}
