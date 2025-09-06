package com.datablau.bpmn.server.app;

import com.alibaba.boot.nacos.discovery.autoconfigure.NacosDiscoveryAutoConfiguration;
import com.datablau.data.common.util.ShareKit;
import java.io.File;
import java.net.URL;
import org.apache.logging.log4j.core.util.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.actuate.autoconfigure.health.HealthContributorAutoConfiguration;
import org.springframework.boot.actuate.autoconfigure.metrics.mongo.MongoMetricsAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration;
import org.springframework.boot.autoconfigure.data.neo4j.Neo4jDataAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.ldap.LdapAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoReactiveAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.autoconfigure.solr.SolrAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

@SpringBootApplication(
        scanBasePackages = {"com.datablau.bpmn"},
        exclude = {
                MongoAutoConfiguration.class,
                MongoDataAutoConfiguration.class,
                MongoReactiveAutoConfiguration.class,
                MongoMetricsAutoConfiguration.class,
                Neo4jDataAutoConfiguration.class,
                SolrAutoConfiguration.class,
                HibernateJpaAutoConfiguration.class,
                DataSourceAutoConfiguration.class,
                LdapAutoConfiguration.class,
                UserDetailsServiceAutoConfiguration.class,
                NacosDiscoveryAutoConfiguration.class,
                HealthContributorAutoConfiguration.class
        })
@EnableDiscoveryClient
public class BpmnApplication extends SpringBootServletInitializer {

    private static final Logger logger = LoggerFactory.getLogger(BpmnApplication.class);

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        try {
            extractFilesToPath("classpath:/resources/**", "resources");
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
        }
        return builder.sources(BpmnApplication.class);
    }

    public static void main(String[] args) throws Exception {
        extractFilesToPath("classpath:/resources/**", "resources");
//        String rootFolder = ShareKit.getCurrentServicePath(bpmnApplication.class);
//        System.setProperty("logging.file.path", rootFolder + "logs");
        SpringApplication.run(BpmnApplication.class);
    }

    private static void extractFilesToPath(String classPathFolder, String targetFolder) throws Exception {
        URL baseUrl = BpmnApplication.class.getProtectionDomain().getCodeSource().getLocation();
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

        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver(BpmnApplication.class.getClassLoader());
        Resource[] resources = resolver.getResources(classPathFolder);
        for (Resource resource : resources) {
            copyFile(ShareKit.normalizePath(rootFolder) + File.separator + ShareKit.normalizePath(targetFolder) + File.separator + resource.getURL().getPath().substring(len + 10), resource);
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
