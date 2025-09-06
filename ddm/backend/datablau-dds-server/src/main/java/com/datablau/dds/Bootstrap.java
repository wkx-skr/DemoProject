package com.datablau.dds;

import com.alibaba.cloud.nacos.registry.NacosServiceRegistryAutoConfiguration;
import com.datablau.dds.core.config.HttpExporterConfiguration;
import com.datablau.dds.core.config.NacosConfig;
import com.datablau.dds.core.config.RegisterNacosServer;
import com.datablau.dds.core.config.SecurityConfiguration;
import com.datablau.dds.core.job.impl.DataServiceJobExecutor;
import com.datablau.job.scheduler.api.JobExecutor;
import com.datablau.job.scheduler.data.OptionsCheck;
import org.apache.kafka.clients.consumer.KafkaConsumer;
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
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
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
    scanBasePackages = {"com.datablau.dds"},
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
@ComponentScan(basePackages = {"com.datablau.datasource", "com.datablau.dds"}, excludeFilters = {
    @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = {
            RegisterNacosServer.class,
            HttpExporterConfiguration.class,
            SecurityConfiguration.class,
            DdsApplication.class,
            KafkaConsumer.class,
            NacosConfig.class
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
public class Bootstrap implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(Bootstrap.class);

    private static String queueName;
    private static String topicName;

    @Autowired(required = false)
    private JobExecutor runner;

    public static void main(String[] args) {
        initProperties();

        String[] arrays = OptionsCheck.checkOptions(args);
        queueName = arrays[0];
        topicName = arrays[1];

        SpringApplication app = new SpringApplication(Bootstrap.class);
        app.setBannerMode(Mode.OFF);
        app.setLazyInitialization(false);
        app.run(args);
    }

    @Override
    public void run(String... args) throws Exception {
        runner = new DataServiceJobExecutor(null, queueName, topicName, null);
        runner.queueProcessJobs(queueName, topicName);
    }

    public static void initProperties(){
        System.setProperty("spring.main.web-application-type", "none");
        System.setProperty("spring.session.store-type", "none");
        System.setProperty("datablau.db.hibernate.hbm2ddl", "none");
        try {
            DdsApplication.extractFilesToPath("classpath:/resources/**", "resources");
        } catch (Exception e) {
            logger.warn("error copy path to same level: " + e.getMessage(), e);
        }
    }


}
