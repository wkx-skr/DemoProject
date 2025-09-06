package com.datablau.dds;

import com.datablau.data.common.util.ShareKit;
import com.datablau.ddd.data.bean.JdbcDriverLoaderImpl;
import com.datablau.dds.common.api.DatablauRemoteDdsApiService;
import java.io.File;
import java.net.URL;
import org.apache.logging.log4j.core.util.FileUtils;
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
    @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = {
            Bootstrap.class,
            JdbcDriverLoaderImpl.class
        }
    )
})
@EnableDiscoveryClient
@EnableJpaAuditing
/*@EnableGlobalMethodSecurity(prePostEnabled = true)*/
public class DdsApplication extends SpringBootServletInitializer {
    public static void main(String[] args) throws Exception {
        extractFilesToPath("classpath:/resources/**", "resources");
        SpringApplication.run(DdsApplication.class, args);
    }

    public static void extractFilesToPath(String classPathFolder, String targetFolder)
        throws Exception {
        URL baseUrl = DdsApplication.class.getProtectionDomain().getCodeSource().getLocation();
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

        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver(DdsApplication.class.getClassLoader());
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

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        return builder.sources(DatablauRemoteDdsApiService.class);
    }
}
