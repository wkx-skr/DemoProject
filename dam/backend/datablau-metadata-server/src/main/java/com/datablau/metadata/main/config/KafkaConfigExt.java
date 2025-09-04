package com.datablau.metadata.main.config;

import com.datablau.data.common.api.impl.KafkaPublishService;
import com.fasterxml.jackson.databind.JsonDeserializer;
import org.apache.kafka.clients.CommonClientConfigs;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.config.SaslConfigs;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.config.KafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * @author: hxs
 * @date: 2025/7/4 12:02
 */
@Configuration("kafkaConfigCluster")
@ConditionalOnProperty(
        prefix = "kafka",
        name = "cluster.enabled",
        havingValue = "true",  // 当值为true时生效
        matchIfMissing = false // 如果配置缺失，不生效
)
public class KafkaConfigExt {

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
    @Value("${spring.kafka.sasl.enable:false}")
    private boolean sasl_enable;
    @Value("${spring.kafka.producer.properties.security.protocol}")
    private String security_protocol_config;
    @Value("${spring.kafka.producer.properties.sasl.mechanism}")
    private String sasl_mechanism;
    @Value("${spring.kafka.producer.properties.sasl.jaas.config}")
    private String sasl_jaas_config;
    @Value("${spring.kafka.consumer.group-id:datablau_metadata}")
    protected String groupId;
    @Value("${spring.kafka.consumer.max-poll-records:800}")
    protected String maxPollRecords;
    @Value("${spring.kafka.consumer.fetch-max-wait:10000}")
    protected String fetchMaxWait;
    @Value("${spring.kafka.consumer.fetch-min-size:10240}")
    protected String fetchMinSize;
    @Value("${spring.kafka.consumer.auto-offset-reset:latest}")
    protected String autoOffsetReset;
    @Value("${spring.kafka.consumer.auto-commit-interval:2000}")
    protected String autoCommitInterval;
    @Value("${spring.kafka.consumer.key-deserializer:org.apache.kafka.common.serialization.StringDeserializer}")
    protected String consumerKeyDeserializer;
    @Value("${spring.kafka.consumer.value-deserializer:org.springframework.kafka.support.serializer.JsonDeserializer}")
    protected String consumerValueDeserializer;
    @Value("${spring.kafka.consumer.properties.spring.json.trusted.packages}")
    protected String trustPackages;
    @Value("${kafka.cluster.consumer.properties.security.protocol}")
    private String consumerSecurityProtocolConfig;
    @Value("${kafka.cluster.consumer.properties.sasl.mechanism}")
    private String consumerSaslMechanism;
    @Value("${spring.kafka.consumer.properties.sasl.jaas.config}")
    private String consumerSaslJaasConfig;

    @Value("${kafka.cluster.consumer.properties.sasl.jaas.config}")
    private String consumerSaslJaasConfigNew;
    @Value("${kafka.cluster.bootstrap-servers}")
    private String clusterBootstrapServers;

    @Value("${kafka.cluster.consumer.group-id}")
    private String clusterGroupId;

    public KafkaConfigExt() {
    }
    @Bean("clusterConsumerFactory")
    public ConsumerFactory<String, Object> clusterConsumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, clusterBootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, clusterGroupId);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, "org.apache.kafka.common.serialization.StringDeserializer");
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, "org.springframework.kafka.support.serializer.JsonDeserializer");
        props.put("max.poll.records", this.maxPollRecords);
        props.put("auto.offset.reset", this.autoOffsetReset);
        props.put("fetch.min.bytes", this.fetchMinSize);
        props.put("fetch.max.wait.ms", this.fetchMaxWait);
        props.put("auto.commit.interval.ms", this.autoCommitInterval);
        props.put("session.timeout.ms", 120000);
        props.put("request.timeout.ms", 600000);
        props.put("key.deserializer", this.consumerKeyDeserializer);
        props.put("value.deserializer", this.consumerValueDeserializer);
        props.put("spring.json.trusted.packages", this.trustPackages);
        if (this.sasl_enable) {
            props.put("security.protocol", this.consumerSecurityProtocolConfig);
            props.put("sasl.mechanism", this.consumerSaslMechanism);
            props.put("sasl.jaas.config", this.consumerSaslJaasConfigNew);
        }

        return new DefaultKafkaConsumerFactory<>(props);
    }

    @Bean("clusterKafkaListenerContainerFactory")
    public ConcurrentKafkaListenerContainerFactory<String, Object> cluster1KafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(clusterConsumerFactory());
        return factory;
    }

}
