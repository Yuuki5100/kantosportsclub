package com.example.appserver.util;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExcelUtilTest {

    @Mock
    private Row mockRow;

    @Mock
    private Cell mockCell;

    private Map<Integer, String> headerMap;

    @BeforeEach
    void setUp() {
        headerMap = new HashMap<>();
        headerMap.put(0, "品目CD");
        headerMap.put(1, "適用開始日");
        headerMap.put(2, "品目名");
        headerMap.put(3, "在庫単位");
        headerMap.put(4, "在庫単位換算率");
    }

    @Test
    void testGetHeaderMap_ReturnsCorrectMap() {
        Cell cell1 = mock(Cell.class);
        Cell cell2 = mock(Cell.class);
        when(cell1.getColumnIndex()).thenReturn(0);
        when(cell1.getStringCellValue()).thenReturn("品目CD");
        when(cell2.getColumnIndex()).thenReturn(1);
        when(cell2.getStringCellValue()).thenReturn("品目名");

        Row row = mock(Row.class);
        when(row.iterator()).thenReturn(Arrays.asList(cell1, cell2).iterator());

        Map<Integer, String> result = ExcelUtil.getHeaderMap(row);

        assertThat(result).hasSize(2)
                .containsEntry(0, "品目CD")
                .containsEntry(1, "品目名");
    }

    @Test
    void testGetValueByHeader_ReturnsCellValue() {
        when(mockRow.getCell(0)).thenReturn(mockCell);
        when(mockCell.getStringCellValue()).thenReturn("ITEM001");

        String value = ExcelUtil.getValueByHeader(mockRow, headerMap, "品目CD");

        assertThat(value).isEqualTo("ITEM001");
    }

    @Test
    void testGetValueByHeader_ReturnsNullIfNotFound() {
        String value = ExcelUtil.getValueByHeader(mockRow, headerMap, "存在しない列");
        assertThat(value).isNull();
    }

    @Test
    void testGetLocalDateByHeader_ReturnsLocalDate() {
        when(mockRow.getCell(1)).thenReturn(mockCell);
        when(mockCell.getStringCellValue()).thenReturn("2025/10/08");

        LocalDate date = ExcelUtil.getLocalDateByHeader(mockRow, headerMap, "適用開始日");

        assertThat(date).isEqualTo(LocalDate.of(2025, 10, 8));
    }

    @Test
    void testGetBigDecimalByHeader_ReturnsBigDecimal() {
        when(mockRow.getCell(4)).thenReturn(mockCell);
        when(mockCell.getStringCellValue()).thenReturn("1234.56");

        BigDecimal value = ExcelUtil.getBigDecimalByHeader(mockRow, headerMap, "在庫単位換算率");

        assertThat(value).isEqualByComparingTo(new BigDecimal("1234.56"));
    }


}
