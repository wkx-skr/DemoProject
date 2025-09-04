//package com.datablau.base.server.config;
//
//import com.andorj.model.common.utility.DigestUtils;
//import com.andorj.model.common.utility.IdGeneratorPropertySetter;
//import com.andorj.model.common.utility.RootBeanHelper;
//import com.andorj.model.common.utility.postgres.PostgresUtil;
//import com.datablau.base.server.es.config.BaseSearchMappingConfigurer;
//import com.datablau.base.server.es.config.DatablauSearchAnalysisConfigurer;
//import com.datablau.base.server.es.config.DatablauSearchFailureHandler;
//import com.datablau.base.server.es.config.DatablauSearchIndexConfig;
//import com.datablau.data.common.util.DatablauRedissonRegionFactory;
//import org.apache.commons.dbcp2.BasicDataSource;
//import org.hibernate.cfg.ImprovedNamingStrategy;
//import org.springframework.beans.factory.annotation.Qualifier;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.context.annotation.DependsOn;
//import org.springframework.context.annotation.Primary;
//import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
//import org.springframework.jdbc.core.JdbcTemplate;
//import org.springframework.orm.jpa.JpaTransactionManager;
//import org.springframework.orm.jpa.JpaVendorAdapter;
//import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
//import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
//import org.springframework.security.core.userdetails.UserCache;
//import org.springframework.security.core.userdetails.cache.NullUserCache;
//import org.springframework.transaction.PlatformTransactionManager;
//import org.springframework.transaction.annotation.EnableTransactionManagement;
//
//import javax.persistence.EntityManagerFactory;
//import javax.sql.DataSource;
//import java.util.HashMap;
//import java.util.Map;
//
//@Configuration
//@EnableJpaRepositories(
//        basePackages = {"com.datablau.base.server.jpa", "com.datablau.udp.jpa"}
//)
//@EnableTransactionManagement
//public class JpaConfigurationExt {
//    @Value("${datablau.db.driver-class-name}")
//    private String dsDriverClassName;
//    @Value("${datablau.db.url}")
//    private String dsUrl;
//    @Value("${datablau.db.password}")
//    private String dbPassword;
//    @Value("${datablau.db.username}")
//    private String dbUser;
//    @Value("${datablau.db.max-total:50}")
//    private Integer dsMaxTotal;
//    @Value("${datablau.db.min-idle:2}")
//    private Integer dsMinIdle;
//    @Value("${datablau.db.max-wait-millis:30000}")
//    private Integer dsMaxWaitMillis;
//    @Value("${datablau.db.dialect}")
//    private String dsDialect;
//    @Value("${datablau.db.hibernate.show-sql:false}")
//    private boolean hibernateShowSql;
//    @Value("${datablau.db.hibernate.format-sql:false}")
//    private boolean hibernateFormatSql;
//    @Value("${datablau.db.hibernate.hbm2ddl:update}")
//    private String hibernateHbm2ddlAuto;
//    @Value("${datablau.db.hibernate.dialect-storage-engine:innodb}")
//    private String hibernateDialectStorageEngine;
//    @Value("${datablau.redisson.config.location}")
//    private String redissonFileLocation;
//    @Value("${datablau.ddc.enable}")
//    private boolean ddcEnable;
//    @Value("${datablau.ddc.ips}")
//    private String ddcIps;
//    @Value("${datablau.ddc.indices.model_category}")
//    private String ddcModelCategoryIndex;
//    @Value("${datablau.ddc.synonyms.enable}")
//    private boolean ddcSynonymsEnable;
//    @Value("${datablau.ddc.synonyms.path}")
//    private String ddcSynonymsPath;
//    @Value("${datablau.ddc.synonyms.interval}")
//    private Long ddcSynonymsInterval;
//    @Value("${datablau.ddc.basic_auth_enabled}")
//    private boolean basicAuthEnabled;
//    @Value("${datablau.ddc.username}")
//    private String ddcUsername;
//    @Value("${datablau.ddc.password}")
//    private String ddcPassword;
//
//    public JpaConfigurationExt() {
//
//    }
//
//    @Bean(destroyMethod = "close",name = "defaultDataSource")
//    public BasicDataSource defaultDataSource() {
//        BasicDataSource dataSource = new BasicDataSource();
//        dataSource.setDriverClassName(this.dsDriverClassName);
//        dataSource.setUrl(this.dsUrl);
//        dataSource.setUsername(this.dbUser);
//        dataSource.setPassword(DigestUtils.decryptIfIsEncrypted(this.dbPassword));
//        dataSource.setDefaultTransactionIsolation(2);
//        dataSource.setRemoveAbandonedOnBorrow(true);
//        dataSource.setRemoveAbandonedOnMaintenance(true);
//        dataSource.setRemoveAbandonedTimeout(300);
//        dataSource.setLogAbandoned(true);
//        dataSource.setMaxTotal(this.dsMaxTotal);
//        dataSource.setMinIdle(this.dsMinIdle);
//        dataSource.setMaxWaitMillis((long) this.dsMaxWaitMillis);
//        PostgresUtil.setDriverClass(this.dsDriverClassName);
//        return dataSource;
//    }
//
//    @Bean(destroyMethod = "close",name = "noCompressedDataSource")
//    public BasicDataSource noCompressedDataSource() {
//        BasicDataSource dataSource = new BasicDataSource();
//        dataSource.setDriverClassName(this.dsDriverClassName);
//        dataSource.setUrl(this.dsUrl.replace("useCompression=true","useCompression=false"));
//        dataSource.setUsername(this.dbUser);
//        dataSource.setPassword(DigestUtils.decryptIfIsEncrypted(this.dbPassword));
//        dataSource.setDefaultTransactionIsolation(2);
//        dataSource.setRemoveAbandonedOnBorrow(true);
//        dataSource.setRemoveAbandonedOnMaintenance(true);
//        dataSource.setRemoveAbandonedTimeout(300);
//        dataSource.setLogAbandoned(true);
//        dataSource.setMaxTotal(this.dsMaxTotal);
//        dataSource.setMinIdle(this.dsMinIdle);
//        dataSource.setMaxWaitMillis((long) this.dsMaxWaitMillis);
//        PostgresUtil.setDriverClass(this.dsDriverClassName);
//        return dataSource;
//    }
//
//    @Bean
//    @Primary
//    public DataSource routingDataSource(
//            @Qualifier("noCompressedDataSource") BasicDataSource compressedDataSource,
//            @Qualifier("defaultDataSource") BasicDataSource defaultDataSource) {
//
//        CompressionRoutingDataSource routingDataSource = new CompressionRoutingDataSource();
//        Map<Object, Object> dataSourceMap = new HashMap<>();
//        dataSourceMap.put("noCompressedDataSource", compressedDataSource);
//        dataSourceMap.put("defaultDataSource", defaultDataSource);
//        routingDataSource.setTargetDataSources(dataSourceMap);
//        routingDataSource.setDefaultTargetDataSource(defaultDataSource);
//        return routingDataSource;
//    }
//
//
//
//    @Bean
//    public PlatformTransactionManager transactionManager(EntityManagerFactory entityManagerFactory) {
//        JpaTransactionManager manager = new JpaTransactionManager();
//        manager.setEntityManagerFactory(entityManagerFactory);
//        return manager;
//    }
//
//    @Bean
//    public JpaVendorAdapter hibernateJpaVendorAdapter() {
//        HibernateJpaVendorAdapter adapter = new HibernateJpaVendorAdapter();
//        return adapter;
//    }
//
//    @Bean
//    public UserCache userCache() {
//        return new NullUserCache();
//    }
//
//    @Bean
//    public RootBeanHelper rootBeanHelper() {
//        return new RootBeanHelper();
//    }
//
//    @Bean
//    public IdGeneratorPropertySetter idGeneratorPropertySetter(JdbcTemplate jdbcTemplate) {
//        IdGeneratorPropertySetter setter = new IdGeneratorPropertySetter();
//        setter.setTargetJdbcClassName(this.dsDriverClassName);
//        setter.setJdbcTemplate(jdbcTemplate);
//        return setter;
//    }
//
//    @Bean
//    @DependsOn({"propertyService", "rootBeanHelper", "idGeneratorPropertySetter"})
//    public LocalContainerEntityManagerFactoryBean entityManagerFactory() {
//        LocalContainerEntityManagerFactoryBean factory = new LocalContainerEntityManagerFactoryBean();
//        factory.setDataSource(this.defaultDataSource());
//        factory.setJpaVendorAdapter(this.hibernateJpaVendorAdapter());
//        factory.setPackagesToScan(new String[]{"com.datablau.base.server.jpa", "com.datablau.udp.jpa"});
//        Map<String, Object> properties = new HashMap();
//        properties.put("hibernate.dialect", this.dsDialect);
//        properties.put("hibernate.ejb.naming_strategy", ImprovedNamingStrategy.class);
//        properties.put("hibernate.show_sql", this.hibernateShowSql);
//        properties.put("hibernate.hbm2ddl.auto", this.hibernateHbm2ddlAuto);
//        properties.put("hibernate.format_sql", this.hibernateFormatSql);
//        properties.put("hibernate.dialect.storage_engine", this.hibernateDialectStorageEngine);
//        properties.put("hibernate.javax.cache.missing_cache_strategy", "create");
//        properties.put("hibernate.cache.region.factory_class", DatablauRedissonRegionFactory.class);
//        properties.put("hibernate.cache.use_second_level_cache", false);
//        properties.put("hibernate.cache.use_query_cache", false);
//        properties.put("hibernate.cache.redisson.config", this.redissonFileLocation);
//        properties.put("hibernate.search.enabled", this.ddcEnable);
//        properties.put("hibernate.search.default_backend", "datablau");
//        if (this.basicAuthEnabled) {
//            properties.put("hibernate.search.backends.datablau.username", this.ddcUsername);
//            properties.put("hibernate.search.backends.datablau.password", this.ddcPassword);
//        }
//
//        properties.put("hibernate.search.backends.datablau.uris", this.ddcIps);
//        properties.put("hibernate.search.backends.datablau.discovery.enabled", false);
//        properties.put("hibernate.search.backends.datablau.discovery.refresh_interval", 10);
//        properties.put("hibernate.search.backends.datablau.analysis.configurer", DatablauSearchAnalysisConfigurer.class);
//        properties.put("hibernate.search.backends.datablau.index_defaults.lifecycle.minimal_required_status", "yellow");
//        properties.put("hibernate.search.backends.datablau.request_timeout", 600000);
//        properties.put("hibernate.search.backends.datablau.connection_timeout", 300000);
//        properties.put("hibernate.search.backends.datablau.read_timeout", 600000);
//        properties.put("hibernate.search.backends.datablau.max_connections", 20);
//        properties.put("hibernate.search.backends.datablau.version_check.enabled", false);
//        properties.put("hibernate.search.backends.datablau.version", "7.10.2");
//        properties.put("hibernate.search.schema_management.strategy", "create");
//        properties.put("hibernate.search.backends.datablau.layout.strategy", "no-alias");
//        properties.put("hibernate.search.backends.datablau.type_name", "elasticsearch");
//        properties.put("hibernate.search.backends.datablau.mapping.type_name.strategy", "index-name");
//        properties.put("hibernate.search.configuration_property_checking.strategy", "ignore");
//        properties.put("hibernate.search.mapping.process_annotations", false);
//        properties.put("hibernate.search.mapping.configurer", BaseSearchMappingConfigurer.class);
//        properties.put("hibernate.search.automatic_indexing.synchronization.strategy", "async");
//        properties.put("hibernate.search.background_failure_handler", DatablauSearchFailureHandler.class);
//        factory.setJpaPropertyMap(properties);
//        return factory;
//    }
//
//    @Bean
//    public DatablauSearchIndexConfig datablauSearchIndexConfig() {
//        DatablauSearchIndexConfig config = new DatablauSearchIndexConfig();
//        config.setModelCategoryIndexName(this.ddcModelCategoryIndex);
//        config.setSynonymEnable(this.ddcSynonymsEnable);
//        config.setSynonymsInterval(this.ddcSynonymsInterval);
//        config.setSynonymsPath(this.ddcSynonymsPath);
//        return config;
//    }
//}
