package com.datablau.data.asset.app;


import com.alibaba.boot.nacos.discovery.autoconfigure.NacosDiscoveryAutoConfiguration;
import com.andorj.model.common.api.impl.MessageServiceImpl;
import com.datablau.common.custom.annotion.EnableKafkaCustom;
import com.datablau.data.asset.job.impl.DataAssetsJobExecutor;
import com.datablau.data.common.util.ShareKit;
import org.apache.logging.log4j.core.util.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.actuate.autoconfigure.health.HealthContributorAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration;
import org.springframework.boot.autoconfigure.data.neo4j.Neo4jDataAutoConfiguration;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchRestClientAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.ldap.LdapAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.autoconfigure.solr.SolrAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.scheduling.annotation.EnableAsync;

import java.io.File;
import java.net.URL;

@SpringBootApplication(scanBasePackages = {"com.datablau"}, exclude = {
        MongoAutoConfiguration.class,
        MongoDataAutoConfiguration.class,
        Neo4jDataAutoConfiguration.class,
        SolrAutoConfiguration.class,
        HibernateJpaAutoConfiguration.class,
        DataSourceAutoConfiguration.class,
        NacosDiscoveryAutoConfiguration.class,
        HealthContributorAutoConfiguration.class,
        LdapAutoConfiguration.class,
        ElasticsearchRestClientAutoConfiguration.class})
@EnableConfigurationProperties
@ComponentScan(basePackages = {"com.datablau"}, excludeFilters = {
        @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {
                        Bootstrap.class,
                        DataAssetsJobExecutor.class
                }
        )})
@EnableKafkaCustom
@EnableAsync
@Import({MessageServiceImpl.class})
public class DataAssetsApplication extends SpringBootServletInitializer {
    private static final Logger logger = LoggerFactory.getLogger(DataAssetsApplication.class);

    public static void main(String[] args)  throws Exception {
        extractFilesToPath("classpath:/resources/**", "resources");
        SpringApplication.run(DataAssetsApplication.class, args);
    }

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        return builder.sources(DataAssetsApplication.class);
    }

    public static void extractFilesToPath(String classPathFolder, String targetFolder) throws Exception {
        URL baseUrl = DataAssetsApplication.class.getProtectionDomain().getCodeSource().getLocation();
        String basePath = baseUrl.getPath();
        int len = basePath.length();

        String baseFile = baseUrl.getFile();
        String rootFolder = "";
        if (baseFile.contains(".jar!")) {
            String jarPath = baseFile.substring(0, baseFile.indexOf(".jar!"));
            int pos = jarPath.lastIndexOf("/");
            if (pos < 0) {
                pos = jarPath.lastIndexOf("\\");
            }

            rootFolder = jarPath.substring(0, pos);
        } else {
            rootFolder = baseFile.substring(0, baseFile.lastIndexOf("classes"));
        }

        if (rootFolder.startsWith("file:")) {
            rootFolder = rootFolder.substring(5);
        }

        System.setProperty("webapp.realpath", ShareKit.normalizePath(rootFolder));

        FileUtils.mkdir(new File(ShareKit.normalizePath(rootFolder) + File.separator + ShareKit.normalizePath(targetFolder)), true);

        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver(DataAssetsApplication.class.getClassLoader());
        Resource[] resources = resolver.getResources(classPathFolder);
        for (Resource resource : resources) {
            copyFile(ShareKit.normalizePath(rootFolder) + File.separator + ShareKit.normalizePath(targetFolder) + File.separator + resource.getURL().getPath().substring(len + 10), resource);
        }
    }

    private static void copyFile(String targetPath, Resource resource) throws Exception{
        File file = new File(targetPath);
        String path = resource.getURL().getPath();
        if (path.endsWith("\\") || path.endsWith("/")) {
            return;
        }
        if (file.exists()) {
            file.delete();
        }
        org.apache.commons.io.FileUtils.copyInputStreamToFile(resource.getInputStream(), file);
    }
}
