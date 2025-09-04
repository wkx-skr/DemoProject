package com.datablau.metadata.main.mq;

import com.datablau.metadata.main.dto.TableMetadataMessageDto;
import com.datablau.metadata.main.ext.DataModelSyncUdpService;
import com.google.gson.Gson;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * @ClassName：KafkaConsumerExt
 * @Author: dingzicheng
 * @Date: 2025/8/21 23:42
 * @Description: 必须描述类做什么事情, 实现什么功能
 */
@Component
@ConditionalOnProperty(
        prefix = "kafka",
        name = "cluster.enabled",
        havingValue = "true",  // 当值为true时生效
        matchIfMissing = false // 如果配置缺失，不生效
)
public class KafkaConsumerExt {
    private static final Logger LOGGER = LoggerFactory.getLogger(KafkaConsumerExt.class);


    @Autowired
    private DataModelSyncUdpService dataModelSyncUdpService;

    private Gson gson = new Gson();

    @KafkaListener(
            topics = {"${kafka.cluster:consumer.topic:GWNormalTableTopic}"},
            containerFactory = "clusterKafkaListenerContainerFactory"  // 使用额外的
    )
    public void consumeCluster(ConsumerRecord<String, Object> record) {
        // 处理消息
        LOGGER.info("start consume:{}", gson.toJson(record.value()));
        Optional<TableMetadataMessageDto> optional = Optional.ofNullable(record.value()).filter(TableMetadataMessageDto.class::isInstance).map(TableMetadataMessageDto.class::cast);
        if (optional.isPresent()) {
            dataModelSyncUdpService.syncDataModelUdp(optional.get());
        }
    }
}
