package com.example.appserver.util;

import com.example.appserver.security.CustomUserDetails;
import com.example.servercommon.model.UserModel;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class LoginUserUtilityTest {

    private SecurityContext securityContext;
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        securityContext = mock(SecurityContext.class);
        authentication = mock(Authentication.class);
        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void testGetLoginUser_ReturnsUser_WhenAuthenticated() {
        UserModel domainUser = new UserModel();
        domainUser.setUserId("u-123");

        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getDomainUser()).thenReturn(domainUser);

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(securityContext.getAuthentication()).thenReturn(authentication);

        UserModel result = LoginUserUtility.getLoginUser();

        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo("u-123");
    }

    @Test
    void testGetLoginUser_ReturnsNull_WhenNotAuthenticated() {
        when(authentication.isAuthenticated()).thenReturn(false);
        when(securityContext.getAuthentication()).thenReturn(authentication);

        UserModel result = LoginUserUtility.getLoginUser();
        assertThat(result).isNull();
    }

    @Test
    void testGetLoginUser_ReturnsNull_WhenPrincipalNotCustomUserDetails() {
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn("not a userDetails");
        when(securityContext.getAuthentication()).thenReturn(authentication);

        UserModel result = LoginUserUtility.getLoginUser();
        assertThat(result).isNull();
    }

    @Test
    void testGetLoginUserId_ReturnsUserId_WhenAuthenticated() {
        UserModel domainUser = new UserModel();
        domainUser.setUserId("u-456");

        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getDomainUser()).thenReturn(domainUser);

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(securityContext.getAuthentication()).thenReturn(authentication);

        String userId = LoginUserUtility.getLoginUserId();

        assertThat(userId).isEqualTo("u-456");
    }

    @Test
    void testGetLoginUserId_ReturnsNull_WhenNoLoginUser() {
        when(securityContext.getAuthentication()).thenReturn(null);
        String userId = LoginUserUtility.getLoginUserId();
        assertThat(userId).isNull();
    }
}
