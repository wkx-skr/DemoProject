package com.datablau.base.server;

import com.andorj.model.common.api.impl.MessageServiceImpl;
import com.datablau.data.common.util.ShareKit;
import java.io.File;
import java.net.URL;

import com.google.common.base.Strings;
import org.apache.logging.log4j.core.util.FileUtils;
import org.redisson.spring.starter.RedissonAutoConfiguration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.actuate.autoconfigure.metrics.mongo.MongoMetricsAutoConfiguration;
import org.springframework.boot.actuate.autoconfigure.security.servlet.ManagementWebSecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration;
import org.springframework.boot.autoconfigure.data.neo4j.Neo4jDataAutoConfiguration;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchRestClientAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.ldap.LdapAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.solr.SolrAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Import;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;


/**
 * @author nicky - 数语科技有限公司
 * date 2023/4/17 16:39
 */
@SpringBootApplication(
    scanBasePackages = {"com.datablau.base.server", "com.datablau.datasource", "com.datablau.udp"},
    exclude = {
        MongoAutoConfiguration.class,
        MongoDataAutoConfiguration.class,
        MongoMetricsAutoConfiguration.class,
        Neo4jDataAutoConfiguration.class,
        ElasticsearchRestClientAutoConfiguration.class,
        SolrAutoConfiguration.class,
        HibernateJpaAutoConfiguration.class,
        DataSourceAutoConfiguration.class,
        SecurityAutoConfiguration.class,
        ManagementWebSecurityAutoConfiguration.class,
        LdapAutoConfiguration.class
    })
@EnableDiscoveryClient
@Import({MessageServiceImpl.class})
public class BaseApp extends SpringBootServletInitializer {

    private static final Logger LOGGER = LoggerFactory.getLogger(BaseApp.class);

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        try {
            extractFilesToPath("classpath:/resources/**", "resources");
        } catch (Exception e) {
            LOGGER.error(e.getMessage(), e);
        }
        return builder.sources(BaseApp.class);
    }

    public static void main(String[] args) throws Exception {
        if (Strings.isNullOrEmpty(System.getProperty("logging.file.path"))) {
            String rootFolder = ShareKit.getCurrentServicePath(BaseApp.class);
            System.setProperty("logging.file.path", rootFolder + "logs");
        }

        extractFilesToPath("classpath:/resources/**", "resources");
        SpringApplication.run(BaseApp.class);
    }

    private static void extractFilesToPath(String classPathFolder, String targetFolder) throws Exception {
        URL baseUrl = BaseApp.class.getProtectionDomain().getCodeSource().getLocation();
        String basePath = baseUrl.getPath();
        int len = basePath.length();

        String rootFolder = ShareKit.getCurrentServicePath(BaseApp.class);

        FileUtils.mkdir(new File(rootFolder + File.separator + ShareKit.normalizePath(targetFolder)), true);

        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver(BaseApp.class.getClassLoader());

        try {
            Resource[] resources = resolver.getResources(classPathFolder);
            for (Resource resource : resources) {
                copyFile( rootFolder+ File.separator + ShareKit.normalizePath(targetFolder) + File.separator + resource.getURL().getPath().substring(len + 10), resource);
            }
        } catch (Exception ex) {
            LOGGER.warn("unable to extract files to resources:" + ex.getMessage());
        }
    }

    private static void copyFile(String targetPath, Resource resource) throws Exception {
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