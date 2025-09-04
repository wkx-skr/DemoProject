package com.datablau.domain.management.config;

import com.datablau.data.common.api.impl.KafkaPublishService;
import org.apache.kafka.clients.CommonClientConfigs;
import org.apache.kafka.common.config.SaslConfigs;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * @author: hxs
 * @date: 2025/7/4 12:02
 */
@Configuration("kafkaConfigExt")
public class KafkaConfigExt extends KafkaConfig{

    @Value("${spring.kafka.bootstrap-servers}")
    protected String bootstrap_servers_config;
    @Value("${spring.kafka.producer.retries}")
    protected String pro_retry_config;
    @Value("${spring.kafka.producer.acks}")
    protected String acks_config;
    @Value("${spring.kafka.producer.properties.linger.ms}")
    protected String linger_ms_config;
    @Value("${spring.kafka.producer.batch-size}")
    protected String batch_size_config;
    @Value("${spring.kafka.producer.buffer-memory}")
    protected String buffer_memory_config;
    @Value("${spring.kafka.producer.key-serializer}")
    protected String key_serializer_config;
    @Value("${spring.kafka.producer.value-serializer}")
    protected String value_serializer_config;
    @Value("${spring.kafka.producer.compression-type}")
    protected String compression_type_config;
    @Value("${spring.kafka.producer.properties.security.protocol}")
    private String security_protocol_config;
    @Value("${spring.kafka.producer.properties.sasl.mechanism}")
    private String sasl_mechanism;
    @Value("${spring.kafka.producer.properties.sasl.jaas.config}")
    private String sasl_jaas_config;

    public KafkaConfigExt() {}

    @Primary
    @Bean({"kafkaService"})
    public KafkaPublishService kafkaService() {
        return new KafkaPublishService();
    }

    @Bean
    public KafkaTemplate kafkaTemplate() {
        Map<String, Object> configs = new HashMap();
        configs.put("bootstrap.servers", this.bootstrap_servers_config);
        configs.put("retries", this.pro_retry_config);
        configs.put("batch.size", this.batch_size_config);
        configs.put("acks", this.acks_config);
        configs.put("linger.ms", this.linger_ms_config);
        configs.put("buffer.memory", this.buffer_memory_config);
        configs.put("key.serializer", this.key_serializer_config);
        configs.put("value.serializer", this.value_serializer_config);
        configs.put("compression.type", this.compression_type_config);

        configs.put(CommonClientConfigs.SECURITY_PROTOCOL_CONFIG, security_protocol_config);
        configs.put(SaslConfigs.SASL_MECHANISM, sasl_mechanism);
        configs.put(SaslConfigs.SASL_JAAS_CONFIG, sasl_jaas_config);

        DefaultKafkaProducerFactory producerFactory = new DefaultKafkaProducerFactory(configs);
        return new KafkaTemplate(producerFactory);
    }

}
