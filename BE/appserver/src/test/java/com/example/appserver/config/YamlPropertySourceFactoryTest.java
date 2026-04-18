package com.example.appserver.config;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.springframework.core.env.PropertySource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.EncodedResource;

import java.io.IOException;

class YamlPropertySourceFactoryTest {

    private final YamlPropertySourceFactory factory = new YamlPropertySourceFactory();

    @Test
    void testCreatePropertySource_fileExists() throws IOException {
        Resource resource = new ClassPathResource("test.yml"); // 実際に src/test/resources/test.yml を作成
        EncodedResource encodedResource = new EncodedResource(resource);

        PropertySource<?> propertySource = factory.createPropertySource("test", encodedResource);

        assertNotNull(propertySource);
        assertTrue(propertySource.getName().contains("test.yml"));
    }

    @Test
    void testCreatePropertySource_fileDoesNotExist_mock() throws IOException {
        Resource resource = mock(Resource.class);
        when(resource.exists()).thenReturn(false);
        when(resource.getInputStream()).thenReturn(new java.io.ByteArrayInputStream(new byte[0]));

        EncodedResource encodedResource = new EncodedResource(resource);

        PropertySource<?> propertySource = factory.createPropertySource("nonexistent", encodedResource);

        assertNotNull(propertySource);
    }

    @Test
    void testCreatePropertySource_nullResource_throwsException() {
        assertThrows(NullPointerException.class, () -> factory.createPropertySource("nullResource", null));
    }
}
