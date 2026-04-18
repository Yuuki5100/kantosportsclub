package com.example.servercommon.repository;

import com.example.servercommon.model.UserModel;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class UserRepositoryTest {

    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
    }

    @Test
    void shouldReturnUserWhenEmailMatches() {
        UserModel user = new UserModel();
        user.setUserId("U1");
        user.setEmail("a@b.com");
        user.setRoleId(1);

        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(user));

        Optional<UserModel> result = userRepository.findByEmail("a@b.com");

        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo("a@b.com");
        verify(userRepository, times(1)).findByEmail("a@b.com");
    }

    @Test
    void shouldReturnFilteredUsersWhenSearchOrFilterApplied() {
        UserModel u1 = new UserModel();
        u1.setUserId("U1");
        u1.setEmail("a@b.com");
        u1.setRoleId(1);

        UserModel u2 = new UserModel();
        u2.setUserId("U2");
        u2.setEmail("x@y.com");
        u2.setRoleId(2);

        PageRequest pageable = PageRequest.of(0, 10);
        Page<UserModel> page = new PageImpl<>(List.of(u1), pageable, 1);

        @SuppressWarnings("unchecked")
        Specification<UserModel> spec = mock(Specification.class);

        when(userRepository.findAll(spec, pageable)).thenReturn(page);

        Page<UserModel> result = userRepository.findAll(spec, pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getEmail()).isEqualTo("a@b.com");

        ArgumentCaptor<Specification<UserModel>> specCaptor = ArgumentCaptor.forClass(Specification.class);
        verify(userRepository, times(1)).findAll(specCaptor.capture(), eq(pageable));
        assertThat(specCaptor.getValue()).isSameAs(spec);
    }
}
