package com.datablau.audit;

import com.datablau.data.common.util.ShareKit;
import org.apache.logging.log4j.core.util.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration;
import org.springframework.boot.autoconfigure.data.neo4j.Neo4jDataAutoConfiguration;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchRestClientAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import javax.ws.rs.core.UriBuilder;
import java.io.File;
import java.net.URL;

/**
 * @author weijiakun
 */
@SpringBootApplication(exclude = {
        MongoAutoConfiguration.class,
        MongoDataAutoConfiguration.class,
        Neo4jDataAutoConfiguration.class,
        ElasticsearchRestClientAutoConfiguration.class
})
@EnableDiscoveryClient
@EnableAsync
@EnableScheduling
public class AuditApplication extends SpringBootServletInitializer {

    private static final Logger LOGGER = LoggerFactory.getLogger(AuditApplication.class);
    /**
     * @param args args
     */
    public static void main(String[] args) throws Exception {
        extractFilesToPath("classpath:/resources/**", "resources");
        SpringApplication.run(AuditApplication.class, args);
    }

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        try {
            extractFilesToPath("classpath:/resources/**", "resources/*");
        } catch (Exception e) {
            LOGGER.error(e.getMessage(), e);
        }
        return builder.sources(AuditApplication.class);
    }

    public static void extractFilesToPath(String classPathFolder, String targetFolder) throws Exception {
        URL baseUrl = AuditApplication.class.getProtectionDomain().getCodeSource().getLocation();
        String basePath = baseUrl.getPath();
        int len = basePath.length();

        String rootFolder = ShareKit.getCurrentServicePath(AuditApplication.class);

        FileUtils.mkdir(new File(rootFolder + File.separator + ShareKit.normalizePath(targetFolder)), true);

        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver(AuditApplication.class.getClassLoader());

        try {
            Resource[] resources = resolver.getResources(classPathFolder);
            for (Resource resource : resources) {
                copyFile( rootFolder+ File.separator + ShareKit.normalizePath(targetFolder) + File.separator + resource.getURL().getPath().substring(len + 10), resource);
            }
        } catch (Exception ex) {
            LOGGER.warn("unable to extract files to resources:" + ex.getMessage());
        }
    }

    private static String normalizePath(String path) {
        path = UriBuilder.fromPath(path).build().getPath();

        if (path.endsWith("/") || path.endsWith("\\")) {
            return path.substring(0, path.length() - 1);
        } else {
            return path;
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
