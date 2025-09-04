package com.datablau.domain.management.mq;

import com.datablau.domain.management.api.BusinessTermProcessService;
import com.datablau.workflow.common.entity.dto.WorkflowEventResult;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component("kafkaConsumerExt")
public class CustomizeKafkaConsumer
        extends KafkaConsumer
{
    private static final Logger LOGGER = LoggerFactory.getLogger(CustomizeKafkaConsumer.class);

    @Autowired
    private BusinessTermProcessService businessTermProcessService;


    @KafkaListener(
            topics = {"${datablau.kafka-topic.workflow-businessTerm-publish:datablau-workflow-BUSINESS_TERM_PUBLISH}"},
            groupId = "${spring.kafka.consumer.group-id:datablau-domain}"
    )
    public void businessTermPublishWorkflowCallBack(ConsumerRecord<String, WorkflowEventResult> record) {
        LOGGER.info("start consume businessTerm public message ");

        try {
            this.businessTermProcessService.businessTermPublishWorkflowCallBack((WorkflowEventResult) record.value());
        } catch (Exception var3) {
            LOGGER.error("failed to process businessTerm publish callback:" + var3.getMessage(), var3);
        }

    }



    @KafkaListener(
            topics = {"${datablau.kafka-topic.workflow-businessTerm-update:datablau-workflow-BUSINESS_TERM_UPDATE}"},
            groupId = "${spring.kafka.consumer.group-id:datablau-domain}"
    )
    public void businessTermUpdateWorkflowCallBack(ConsumerRecord<String, WorkflowEventResult> record) {
        LOGGER.info("start consume businessTerm update message ");

        try {
            this.businessTermProcessService.businessTermUpdateWorkflowCallBack((WorkflowEventResult) record.value());
        } catch (Exception var3) {
            LOGGER.error("failed to process businessTerm update callback:" + var3.getMessage(), var3);
        }

    }

    @KafkaListener(
            topics = {"${datablau.kafka-topic.workflow-businessTerm-abolish:datablau-workflow-BUSINESS_TERM_ABOLISH}"},
            groupId = "${spring.kafka.consumer.group-id:datablau-domain}"
    )
    public void businessTermAbolishWorkflowCallBack(ConsumerRecord<String, WorkflowEventResult> record) {
        LOGGER.info("start consume businessTerm abolish message ");

        try {
            this.businessTermProcessService.businessTermAbolishWorkflowCallBack((WorkflowEventResult) record.value());
        } catch (Exception var3) {
            LOGGER.error("failed to process businessTerm abolish callback:" + var3.getMessage(), var3);
        }

    }


}




