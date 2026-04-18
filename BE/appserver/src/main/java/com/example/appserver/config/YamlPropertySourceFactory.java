package com.example.appserver.config;

import org.springframework.boot.env.YamlPropertySourceLoader;
import org.springframework.core.env.PropertySource;
import org.springframework.core.io.support.DefaultPropertySourceFactory;
import org.springframework.core.io.support.EncodedResource;

import java.io.IOException;

public class YamlPropertySourceFactory extends DefaultPropertySourceFactory {

    @Override
    public PropertySource<?> createPropertySource(String name, EncodedResource encodedResource) throws IOException {
        if (encodedResource == null || !encodedResource.getResource().exists()) {
            return super.createPropertySource(name, encodedResource);
        }

        return new YamlPropertySourceLoader()
                .load(encodedResource.getResource().getFilename(), encodedResource.getResource())
                .get(0);
    }
}
