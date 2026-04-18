// package com.example.servercommon.repository;

// import com.example.servercommon.model.ReportMaster;
// import org.junit.jupiter.api.DisplayName;
// import org.junit.jupiter.api.Test;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
// import org.springframework.test.context.ActiveProfiles;

// import java.util.List;
// import java.util.Optional;
// //
// import static org.assertj.core.api.Assertions.assertThat;

// @DataJpaTest
// @ActiveProfiles("test")
// class ReportMasterRepositoryTest {

//     @Autowired
//     private ReportMasterRepository reportMasterRepository;

//     @Test
//     @DisplayName("reportIdで1件取得できること")
//     void findByReportId_shouldReturnOne() {
//         // Arrange
//         ReportMaster master = new ReportMaster();
//         master.setReportId(100L);
//         master.setReportName("ユーザー一覧");
//         reportMasterRepository.save(master);

//         // Act
//         ReportMaster result = reportMasterRepository.findByReportId(100L);

//         // Assert
//         assertThat(result).isNotNull();
//         assertThat(result.getReportName()).isEqualTo("ユーザー一覧");
//     }

//     @Test
//     @DisplayName("存在しないreportIdではnullが返ること")
//     void findByReportId_shouldReturnNull_whenNotFound() {
//         // Act
//         ReportMaster result = reportMasterRepository.findByReportId(999L);

//         // Assert
//         assertThat(result).isNull();
//     }

//     @Test
//     @DisplayName("全件取得できること")
//     void findAll_shouldReturnAllMasters() {
//         // Arrange
//         ReportMaster m1 = new ReportMaster();
//         m1.setReportId(1L);
//         m1.setReportName("レポート1");
//         reportMasterRepository.save(m1);

//         ReportMaster m2 = new ReportMaster();
//         m2.setReportId(2L);
//         m2.setReportName("レポート2");
//         reportMasterRepository.save(m2);

//         // Act
//         List<ReportMaster> all = reportMasterRepository.findAll();

//         // Assert
//         assertThat(all).hasSize(2);
//     }
// }
