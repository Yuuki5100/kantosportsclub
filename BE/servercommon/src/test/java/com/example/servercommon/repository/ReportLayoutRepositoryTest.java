// package com.example.servercommon.repository;

// import com.example.servercommon.model.ReportLayout;
// import org.junit.jupiter.api.DisplayName;
// import org.junit.jupiter.api.Test;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
// import org.springframework.test.context.ActiveProfiles;

// import java.util.List;

// import static org.assertj.core.api.Assertions.assertThat;

// @DataJpaTest
// @ActiveProfiles("test")
// class ReportLayoutRepositoryTest {

//     @Autowired
//     private ReportLayoutRepository reportLayoutRepository;

//     @Test
//     @DisplayName("reportIdに紐づくレイアウトが取得できること")
//     void findByReportId_shouldReturnLayouts() {
//         // Arrange
//         ReportLayout layout1 = new ReportLayout();
//         layout1.setReportId(1L);
//         layout1.setColumnId(1);
//         layout1.setColumnName("Name");

//         reportLayoutRepository.save(layout1);

//         // Act
//         List<ReportLayout> results = reportLayoutRepository.findByReportId(1L);

//         // Assert
//         assertThat(results).hasSize(1);
//         assertThat(results.get(0).getColumnName()).isEqualTo("Name");
//     }
// }
