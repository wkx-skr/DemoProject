package com.datablau.metadata.main.app;

import com.alibaba.cloud.nacos.registry.NacosServiceRegistryAutoConfiguration;
import com.andorj.model.common.api.impl.MessageServiceImpl;
import com.datablau.data.common.util.ShareKit;
import com.datablau.job.scheduler.api.JobExecutor;
import com.datablau.job.scheduler.data.OptionsCheck;
import com.datablau.metadata.main.config.HttpExporterConfiguration;
import com.datablau.metadata.main.config.InterceptorConfiguration;
import com.datablau.metadata.main.config.NacosConfig;
import com.datablau.metadata.main.config.RegisterNacosServer;
import com.datablau.metadata.main.config.SecurityBeanConfiguration;
import com.datablau.metadata.main.job.impl.MetadataJobExecutor;
import com.datablau.metadata.main.mq.KafkaConsumer;
import com.datablau.metadata.main.util.PerformanceMonitorUtility;
import com.google.common.base.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.Banner.Mode;
import org.springframework.boot.CommandLineRunner;
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
import org.springframework.boot.autoconfigure.quartz.QuartzAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.autoconfigure.solr.SolrAutoConfiguration;
import org.springframework.boot.autoconfigure.web.embedded.EmbeddedWebServerFactoryCustomizerAutoConfiguration;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

/**
 * @author nicky - 数语科技有限公司
 * date 2023/3/3 9:46
 */

@SpringBootApplication(
    scanBasePackages = {"com.datablau.metadata"},
    exclude = {
        MongoAutoConfiguration.class,
        MongoDataAutoConfiguration.class,
        MongoMetricsAutoConfiguration.class,
        Neo4jDataAutoConfiguration.class,
        ElasticsearchRestClientAutoConfiguration.class,
        SolrAutoConfiguration.class,
        HibernateJpaAutoConfiguration.class,
        DataSourceAutoConfiguration.class,
        LdapAutoConfiguration.class,
        QuartzAutoConfiguration.class,
        EmbeddedWebServerFactoryCustomizerAutoConfiguration.class,
        SecurityAutoConfiguration.class,
        UserDetailsServiceAutoConfiguration.class,
        NacosServiceRegistryAutoConfiguration.class
    })
@ComponentScan(
    basePackages = {
        "com.datablau.metadata",
        "com.datablau.datasource",
        "com.datablau.udp","com.datablau.dataasset"
    }, excludeFilters = {
    @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = {
            RegisterNacosServer.class,
            HttpExporterConfiguration.class,
            SecurityBeanConfiguration.class,
            MetadataOsApplication.class,
            NacosConfig.class,
            InterceptorConfiguration.class,
            KafkaConsumer.class,
            PerformanceMonitorUtility.class
        }
    ),
    @ComponentScan.Filter(
        type = FilterType.ANNOTATION,
        classes = {
            RestController.class,
            EnableWebMvc.class,
            EnableWebSecurity.class,
            EnableScheduling.class,
            EnableRedisHttpSession.class,
            KafkaListener.class
        }
    )
})
@EnableDiscoveryClient
@Import({MessageServiceImpl.class})
public class Bootstrap implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(Bootstrap.class);

    private static String queueName;
    private static String topicName;

//    public static boolean JOB_CONTEXT = false;

    @Autowired(required = false)
    private JobExecutor runner;

    public static void main(String[] args) {
        System.setProperty("jobContext", "true");
        initProperties();

        String[] arrays = OptionsCheck.checkOptions(args);
        queueName = arrays[0];
        topicName = arrays[1];

        if (Strings.isNullOrEmpty(System.getProperty("logging.file.path"))) {
            String rootFolder = ShareKit.getCurrentServicePath(Bootstrap.class);
            System.setProperty("logging.file.path", rootFolder + "logs");
        }

        SpringApplication app = new SpringApplication(Bootstrap.class);
        app.setBannerMode(Mode.OFF);
        app.setLazyInitialization(false);
        app.run(args);
    }

    @Override
    public void run(String... args) throws Exception {
        runner = new MetadataJobExecutor(null, queueName, topicName, null);
        runner.queueProcessJobs(queueName, topicName);
    }

    public static void initProperties(){
        System.setProperty("spring.main.web-application-type", "none");
        System.setProperty("spring.session.store-type", "none");
        System.setProperty("datablau.db.hibernate.hbm2ddl", "none");
        try {
            MetadataOsApplication.extractFilesToPath("classpath:/resources/**", "resources");
        } catch (Exception e) {
            logger.warn("error copy path to same level: " + e.getMessage(), e);
        }
    }
}
