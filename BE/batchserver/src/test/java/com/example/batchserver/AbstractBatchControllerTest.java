package com.example.batchserver;

import com.example.servercommon.repository.ErrorCodeRepository;
import com.example.servercommon.model.ErrorCode;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.when;

/**
 * ✅ batchserver コントローラー系共通テスト基底クラス
 * - Accept-Language = ja を付ける想定
 * - GlobalExceptionHandler 向けのモック共通定義あり
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class AbstractBatchControllerTest {

    @Autowired
    protected MockMvc mockMvc;

    @MockBean
    protected ErrorCodeRepository errorCodeRepository;

    @BeforeEach
    void commonSetup() {
        reset(errorCodeRepository);

        when(errorCodeRepository.findByCodeAndLocale("E4001", "ja"))
                .thenReturn(Optional.of(new ErrorCode("E4001", "ja", "不正なジョブ名")));
        when(errorCodeRepository.findByCodeAndLocale("E4002", "ja"))
                .thenReturn(Optional.of(new ErrorCode("E4002", "ja", "リクエストパラメータが不正です")));
        when(errorCodeRepository.findByCodeAndLocale("E5001", "ja"))
                .thenReturn(Optional.of(new ErrorCode("E5001", "ja", "ジョブ実行エラー")));
        when(errorCodeRepository.findByCodeAndLocale("E1011", "ja"))
                .thenReturn(Optional.of(new ErrorCode("E1011", "ja", "DBアクセスエラー")));
    }
}
