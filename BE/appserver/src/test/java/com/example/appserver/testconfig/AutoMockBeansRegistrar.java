package com.example.appserver.testconfig;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.beans.factory.support.*;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.context.annotation.ImportBeanDefinitionRegistrar;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.core.type.AnnotationMetadata;
import org.springframework.core.type.filter.AnnotationTypeFilter;
import org.springframework.stereotype.Component;
import org.springframework.web.context.WebApplicationContext;

import jakarta.persistence.Entity;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.Set;

public class AutoMockBeansRegistrar implements ImportBeanDefinitionRegistrar {

    private static final String BASE_PACKAGE = "com.example"; // ルートパッケージに合わせて変更
    private static final String EX_MOCK_CLASS_LOAD_FAILED = "Mock対象クラスの読み込みに失敗: ";

    @Override
    public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry) throws BeansException {
        ClassPathScanningCandidateComponentProvider scanner = new ClassPathScanningCandidateComponentProvider(false);

        // スキャン対象は @Component 相当
        scanner.addIncludeFilter(new AnnotationTypeFilter(Component.class));

        // 除外フィルター：JPA関連のアノテーション
        scanner.addExcludeFilter(new AnnotationTypeFilter(Entity.class));
        scanner.addExcludeFilter(new AnnotationTypeFilter(Repository.class));
        scanner.addExcludeFilter(new AnnotationTypeFilter(Service.class));

        Set<BeanDefinition> candidates = scanner.findCandidateComponents(BASE_PACKAGE);
        for (BeanDefinition candidate : candidates) {
            try {
                Class<?> clazz = Class.forName(candidate.getBeanClassName());

                // モック対象として登録
                RootBeanDefinition mockDef = new RootBeanDefinition(clazz);
                mockDef.setTargetType(MockBean.class); // モックとして識別

                // Bean名を衝突しにくい形で
                String beanName = clazz.getSimpleName() + "Mock";

                registry.registerBeanDefinition(beanName, mockDef);
            } catch (ClassNotFoundException e) {
                throw new RuntimeException(EX_MOCK_CLASS_LOAD_FAILED + candidate.getBeanClassName(), e);
            }
        }
    }
}
