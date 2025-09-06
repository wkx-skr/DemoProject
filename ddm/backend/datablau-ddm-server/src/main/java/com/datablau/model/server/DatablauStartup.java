package com.datablau.model.server;

import org.apache.logging.log4j.core.util.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import org.springframework.boot.web.servlet.ServletComponentScan;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.File;
import java.net.URL;

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
@ComponentScan(
        basePackages = {"com.datablau", "com.andorj"},
        excludeFilters = {
                @ComponentScan.Filter(type = FilterType.REGEX, pattern = "com.andorj.cloud.*.*"),
                @ComponentScan.Filter(type = FilterType.REGEX, pattern = "com.datablau.datasource.*.*"),
        })
@EnableDiscoveryClient
@EnableGlobalMethodSecurity(prePostEnabled = true)
@ServletComponentScan("com.datablau.model.server.proxy")
public class DatablauStartup extends SpringBootServletInitializer {

    protected static final Logger logger = LoggerFactory.getLogger(DatablauStartup.class);

    public static void main(String[] args) throws Exception {
//        String rootFolder = ShareKit.getCurrentServicePath(DatablauStartup.class);
//        System.setProperty("logging.file.path", rootFolder + "logs");
        extractFilesToPath("classpath:/resources/**", "resources");
        SpringApplication.run(DatablauStartup.class, args);
        System.out.printf("");
    }

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        try {
            extractFilesToPath("classpath:/resources/**", "resources");
        } catch (Exception e) {
            logger.warn(e.getMessage(), e);
        }
        return builder.sources(DatablauStartup.class);
    }

    protected static void extractFilesToPath(String classPathFolder, String targetFolder) throws Exception {
        URL baseUrl = DatablauStartup.class.getProtectionDomain().getCodeSource().getLocation();
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

        FileUtils.mkdir(new File(normalizePath(rootFolder) + File.separator + normalizePath(targetFolder)), true);

        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver(DatablauStartup.class.getClassLoader());
        Resource[] resources = resolver.getResources(classPathFolder);
        for (Resource resource : resources) {
            copyFile(normalizePath(rootFolder) + File.separator + normalizePath(targetFolder) + File.separator + resource.getURL().getPath().substring(len + 10), resource);
        }
    }

    protected static String normalizePath(String path) throws Exception {
        //path = UriBuilder.fromPath(path).build().getPath();
        path = UriComponentsBuilder.fromPath(path).build().getPath();

        if (path.endsWith("/") || path.endsWith("\\")) {
            return path.substring(0, path.length() - 1);
        } else {
            return path;
        }
    }

    protected static void copyFile(String targetPath, Resource resource) throws Exception {
        File file = new File(targetPath);
        if (file.exists()) {
            file.delete();
        }
        String path = resource.getURL().getPath();
        if (path.endsWith("\\") || path.endsWith("/")) {
            return;
        }

        org.apache.commons.io.FileUtils.copyInputStreamToFile(resource.getInputStream(), file);
    }


}
