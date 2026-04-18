package com.example.appserver.config;

import org.springframework.context.annotation.Configuration;

import org.apache.ibatis.annotations.Mapper;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Configuration;
/**
 * 基盤側 MybatisConfig.
 */
@Configuration
@MapperScan(basePackages = {"com.example", "com.example.servercommon"},
    annotationClass = Mapper.class)
public class CommonMybatisConfig{}
