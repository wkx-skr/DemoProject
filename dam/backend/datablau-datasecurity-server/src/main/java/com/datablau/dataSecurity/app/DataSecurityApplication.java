package com.datablau.dataSecurity.app;

import com.andorj.model.common.utility.BeanHelper;
import com.datablau.common.custom.annotion.EnableKafkaCustom;
import com.datablau.dataSecurity.job.impl.DataSecurityJobExecutor;
import com.datablau.job.scheduler.adapter.JobRegistryAdapter;
import org.apache.logging.log4j.core.util.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.actuate.autoconfigure.metrics.mongo.MongoMetricsAutoConfiguration;
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
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.ServletComponentScan;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.Scheduled;

import javax.ws.rs.core.UriBuilder;
import java.io.File;
import java.net.URL;
import java.util.Objects;

@SpringBootApplication(
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
                LdapAutoConfiguration.class})
//@EnableEurekaClient,ErrorMvcAutoConfiguration.class
@EnableConfigurationProperties
@ServletComponentScan
@ComponentScan(basePackages = {"com.datablau.dataAccess", "com.datablau.dataSecurity", "com.datablau.category", "com.datablau.datasource", "com.datablau.common"}, excludeFilters = {
        @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {
                        Bootstrap.class,
                        DataSecurityJobExecutor.class
                }
        )}
)
@EnableKafkaCustom
@EnableAsync
public class DataSecurityApplication extends SpringBootServletInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataSecurityApplication.class);

    public static void main(String[] args) throws Exception {
//        String rootFolder = ShareKit.getCurrentServicePath(DataSecurityApplication.class);
//        System.setProperty("logging.file.path", rootFolder + "logs");
        //System.setProperty("datablau.kafka.sys-log-topic", "topic.audit.log.system.test");
        //System.setProperty("spring.kafka.bootstrap-servers", "192.168.2.202:39092");
        extractFilesToPath("classpath:/resources/**", "resources");
        SpringApplication.run(DataSecurityApplication.class, args);
    }

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        try {
            extractFilesToPath("classpath:/resources/**", "resources");
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
        }
        return builder.sources(DataSecurityApplication.class);
    }


    public static void extractFilesToPath(String classPathFolder, String targetFolder) throws Exception {
        URL baseUrl = DataSecurityApplication.class.getProtectionDomain().getCodeSource().getLocation();
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

        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver(DataSecurityApplication.class.getClassLoader());
        Resource[] resources = resolver.getResources(classPathFolder);
        for (Resource resource : resources) {
            copyFile(normalizePath(rootFolder) + File.separator + normalizePath(targetFolder) + File.separator + resource.getURL().getPath().substring(len + 10), resource);
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


    /**
     * 添加JobRegistry
     */

    @Scheduled(fixedRate = 5 * 60 * 1000, initialDelay = 30 * 1000)
    public void registryJob() {
        JobRegistryAdapter registryAdapter = BeanHelper.getBean(JobRegistryAdapter.class);
        if (Objects.isNull(registryAdapter)) {
            logger.warn("The current service does not have a registrar");
            return;
        }
        registryAdapter.registerJar();
    }
}
