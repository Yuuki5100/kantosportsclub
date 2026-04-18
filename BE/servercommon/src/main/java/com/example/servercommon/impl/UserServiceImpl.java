package com.example.servercommon.impl;

import com.example.servercommon.model.UserModel;
import com.example.servercommon.model.MailMessage;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.repository.UserRepository;
import com.example.servercommon.service.EmailSender;
import com.example.servercommon.service.UserService;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final EmailSender emailSender;

    @Value("${app.login.url}")
    private String loginUrl;

    public UserServiceImpl(UserRepository userRepository, EmailSender emailSender) {
        this.userRepository = userRepository;
        this.emailSender = emailSender;
    }

    @Override
    public List<UserModel> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<UserModel> getUserByUserId(String userId) {
        return userRepository.findById(userId);
    }

    @Override
    public UserModel createUser(UserModel user) {
        return userRepository.save(user);
    }

    @Override
    public UserModel updateUser(UserModel user) {
        return userRepository.save(user);
    }

    @Override
    public void deleteUser(String userId) {
        userRepository.deleteById(userId);
    }

    @Override
    public UserModel createUserWithLoginInfo(UserModel user, String rawPassword) {
        UserModel created = userRepository.save(user);
        try {
            sendLoginInfoMail(created, rawPassword);
        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_MAIL_SEND_FAILED, e.getMessage(), e);
        }
        return created;
    }

    private void sendLoginInfoMail(UserModel user, String rawPassword) {
        Map<String, Object> vars = Map.of(
                "userId", user.getUserId(),
                "email", user.getEmail(),
                "temporaryPassword", rawPassword,
                "loginUrl", loginUrl
        );

        MailMessage message = MailMessage.builder()
                .to(user.getEmail())
                .subject("【重要】ログイン情報のご案内")
                .templateName("login")
                .templateVariables(vars)
                .build();

        emailSender.send(message);
    }

    // Test用
    public void setLoginUrl(String loginUrl) {
        this.loginUrl = loginUrl;
    }
}
