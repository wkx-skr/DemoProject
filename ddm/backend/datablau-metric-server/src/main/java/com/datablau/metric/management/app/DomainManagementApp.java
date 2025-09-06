package com.datablau.metric.management.app;

import java.io.File;
import java.net.URL;
import javax.ws.rs.core.UriBuilder;

import com.datablau.metric.management.job.impl.MetricJobExecutor;
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
import org.springframework.boot.autoconfigure.solr.SolrAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.scheduling.annotation.Scheduled;

/**
 * @author Nicky - 数语科技有限公司
 * date 2021/3/24 11:22
 */
@SpringBootApplication(
        scanBasePackages = {"com.datablau.metric","com.datablau.category"},
        exclude = {
                MongoAutoConfiguration.class,
                MongoDataAutoConfiguration.class,
                MongoMetricsAutoConfiguration.class,
                Neo4jDataAutoConfiguration.class,
                ElasticsearchRestClientAutoConfiguration.class,
                SolrAutoConfiguration.class,
                HibernateJpaAutoConfiguration.class,
                DataSourceAutoConfiguration.class,
                LdapAutoConfiguration.class
        })
@ComponentScan(
    basePackages = {
        "com.datablau.metric","com.datablau.datasource"
    }, excludeFilters = {
        @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {
                        Bootstrap.class,
                        MetricJobExecutor.class
                }
        )})
@EnableDiscoveryClient
public class DomainManagementApp extends SpringBootServletInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DomainManagementApp.class);

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        try {
            extractFilesToPath("classpath:/resources/**", "resources");
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
        }
        return builder.sources(DomainManagementApp.class);
    }

    public static void main(String[] args) throws Exception {
        extractFilesToPath("classpath:/resources/**", "resources");
        SpringApplication.run(DomainManagementApp.class);
    }

    public static void extractFilesToPath(String classPathFolder, String targetFolder) throws Exception {
        URL baseUrl = DomainManagementApp.class.getProtectionDomain().getCodeSource().getLocation();
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

        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver(DomainManagementApp.class.getClassLoader());
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
     * 每隔5分钟检查注册一次，延时30秒
     * 主要是有可能服务没有上线，不能重启注册任务包。
     */
    @Scheduled(fixedRate = 5*60*1000, initialDelay = 30*1000)
    public void registerTime(){
//        JobRegistryAdapter jobRegistry = BeanHelper.getBean(JobRegistryAdapter.class);
//        if(jobRegistry == null){
//            logger.warn("current server not have job register");
//            return;
//        }
//        logger.info("begin to register job to job-scheduler...");
////        jobRegistry.registerJar();
//        logger.info("job register completed");
    }
}
