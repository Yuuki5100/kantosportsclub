package com.example.appserver.config;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSourceConfig {

    @Autowired
    private DataSourceProperties dataSourceProperties; // spring.datasource の設定

    @Bean
    public DataSource dataSource() {
            // 通常の DataSource を生成して、接続テスト
            return dataSourceProperties.initializeDataSourceBuilder().build();
    }
}
