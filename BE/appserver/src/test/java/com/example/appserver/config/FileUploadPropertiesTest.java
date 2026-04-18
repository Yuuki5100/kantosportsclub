package com.example.appserver.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class FileUploadPropertiesTest {

    private FileUploadProperties fileUploadProperties;

    @BeforeEach
    void setUp() {
        fileUploadProperties = new FileUploadProperties();
        fileUploadProperties.setAllowedExtensions(List.of("pdf", "xlsx", "csv"));
    }

    @Test
    void testAllowedExtensions_areLowercasedAndTrimmed() {
        fileUploadProperties.setAllowedExtensions(List.of(" PDF ", "xlsx", " CSV "));

        assertTrue(fileUploadProperties.isExtensionAllowed("document.pdf"));
        assertTrue(fileUploadProperties.isExtensionAllowed("spreadsheet.xlsx"));
        assertTrue(fileUploadProperties.isExtensionAllowed("data.csv"));
        assertFalse(fileUploadProperties.isExtensionAllowed("image.png"));
    }

    @Test
    void testIsExtensionAllowed_validExtensions() {
        assertTrue(fileUploadProperties.isExtensionAllowed("file.pdf"));
        assertTrue(fileUploadProperties.isExtensionAllowed("report.xlsx"));
        assertTrue(fileUploadProperties.isExtensionAllowed("sample.csv"));
    }

    @Test
    void testIsExtensionAllowed_invalidExtensions() {
        assertFalse(fileUploadProperties.isExtensionAllowed("file.png"));
        assertFalse(fileUploadProperties.isExtensionAllowed("file.exe"));
        assertFalse(fileUploadProperties.isExtensionAllowed("file"));
        assertFalse(fileUploadProperties.isExtensionAllowed(".hiddenfile"));
    }

    @Test
    void testIsExtensionAllowed_nullOrBlankFilename() {
        assertFalse(fileUploadProperties.isExtensionAllowed(null));
        assertFalse(fileUploadProperties.isExtensionAllowed(""));
        assertFalse(fileUploadProperties.isExtensionAllowed("   "));
    }

    @Test
    void testIsExtensionAllowed_uppercaseExtension() {
        assertTrue(fileUploadProperties.isExtensionAllowed("document.PDF"));
        assertTrue(fileUploadProperties.isExtensionAllowed("SHEET.XLSX"));
    }
}
