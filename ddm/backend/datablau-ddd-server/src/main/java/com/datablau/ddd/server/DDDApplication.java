package com.datablau.ddd.server;

import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.core.util.FileUtils;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;

import org.springframework.boot.SpringApplication;
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
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.web.util.UriComponentsBuilder;

@SpringBootApplication(exclude = {SecurityAutoConfiguration.class,
        MongoAutoConfiguration.class,
        MongoDataAutoConfiguration.class,
        Neo4jDataAutoConfiguration.class,
        ElasticsearchRestClientAutoConfiguration.class,
        SolrAutoConfiguration.class,
        HibernateJpaAutoConfiguration.class,
        DataSourceAutoConfiguration.class,
        LdapAutoConfiguration.class,
})
@ComponentScan(basePackages = {"com.datablau", "com.andorj"}, excludeFilters = {
        @ComponentScan.Filter(type = FilterType.REGEX, pattern = "com.andorj.cloud.*.*"),
})
@EnableDiscoveryClient
@EnableJpaAuditing
public class DDDApplication extends SpringBootServletInitializer {

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        try {
            extractFilesToPath("classpath:/resources/**", "resources");
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
        }
        return builder.sources(DDDApplication.class);
    }

    public static void main(String[] args) throws Exception {
        extractFilesToPath("classpath:/resources/**", "resources");
        SpringApplication.run(DDDApplication.class, args);
    }

    private static void extractFilesToPath(String classPathFolder, String targetFolder) throws IOException {
        URL baseUrl = DDDApplication.class.getProtectionDomain().getCodeSource().getLocation();
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

        System.setProperty("webapp.realpath", normalizePath(rootFolder));

        FileUtils.mkdir(
                new File(normalizePath(rootFolder) + File.separator + normalizePath(targetFolder)),
                true);
        FileUtils.mkdir(
                new File(normalizePath(rootFolder) + File.separator + normalizePath("tmp")),
                true);

        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver(
                DDDApplication.class.getClassLoader());
        Resource[] resources = resolver.getResources(classPathFolder);
        for (Resource resource : resources) {
            copyFile(normalizePath(rootFolder) + File.separator + normalizePath(targetFolder)
                    + File.separator + resource.getURL().getPath().substring(len + 10), resource);
        }
    }

    private static String normalizePath(String path) {
        path = UriComponentsBuilder.fromPath(path).build().getPath();

        if (!StringUtils.isEmpty(path) && (path.endsWith("/") || path.endsWith("\\"))) {
            return path.substring(0, path.length() - 1);
        } else {
            return path;
        }
    }

    private static void copyFile(String targetPath, Resource resource) throws IOException {
        File file = new File(targetPath);
        String path = resource.getURL().getPath();
        if (path.endsWith("\\") || path.endsWith("/")) {
            return;
        }
        if (file.exists()) {
            Files.delete(Paths.get(file.getPath()));
        }
        org.apache.commons.io.FileUtils.copyInputStreamToFile(resource.getInputStream(), file);
    }

}
