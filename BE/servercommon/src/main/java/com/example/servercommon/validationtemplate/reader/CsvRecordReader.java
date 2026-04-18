package com.example.servercommon.validationtemplate.reader;

import com.example.servercommon.message.BackendMessageCatalog;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Slf4j
public class CsvRecordReader implements FileRecordReader {
    @Override
    public List<Map<String, String>> read(InputStream inputStream) {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8));
             CSVParser parser = CSVFormat.DEFAULT
                     .withFirstRecordAsHeader()
                     .withIgnoreEmptyLines()
                     .parse(reader)) {

            List<Map<String, String>> records = new ArrayList<>();

            for (CSVRecord csvRecord : parser) {
                Map<String, String> recordMap = new HashMap<>();
                csvRecord.toMap().forEach((k, v) -> recordMap.put(k.trim(), v != null ? v.trim() : null));
                records.add(recordMap);
            }

            log.debug(BackendMessageCatalog.LOG_CSV_RECORDS_COUNT, records.size());
            for (Map<String, String> row : records) {
                log.debug(BackendMessageCatalog.LOG_CSV_RECORD_ROW, row);
            }

            return records;

        } catch (Exception e) {
            throw new RuntimeException(BackendMessageCatalog.EX_CSV_READ_FAILED, e);
        }
    }
}
