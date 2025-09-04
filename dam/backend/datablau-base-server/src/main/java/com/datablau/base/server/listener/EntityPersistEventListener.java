package com.datablau.base.server.listener;

import com.andorj.common.core.model.LDMTypes;
import com.andorj.model.common.utility.BeanHelper;
import com.datablau.base.server.jpa.entity.ModelCategory;
import com.datablau.data.common.api.PropertyService;
import com.datablau.data.common.api.impl.KafkaPublishService;
import com.datablau.data.common.data.EntityChangeEventDto;
import com.datablau.data.common.type.EntityChangeType;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.persistence.PostPersist;
import javax.persistence.PostRemove;
import javax.persistence.PostUpdate;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;


@Component
public class EntityPersistEventListener {
    private static final Logger logger = LoggerFactory.getLogger(EntityPersistEventListener.class);

    protected KafkaPublishService kafkaPublishService;

    protected String topic;

    protected ObjectMapper mapper = new ObjectMapper();
    protected ExecutorService es = Executors.newSingleThreadExecutor(r -> {
        Thread t = new Thread(r, "ENTITY-CHANGE-EVENT");
        t.setDaemon(true);
        return t;
    });

    public KafkaPublishService getKafkaPublishService() {
        if (kafkaPublishService == null) {
            kafkaPublishService = BeanHelper.getBean(KafkaPublishService.class);
        }
        return kafkaPublishService;
    }

    public String getTopic() {
        if (topic == null) {
            PropertyService propertyService = BeanHelper.getBean(PropertyService.class);
            topic = propertyService.getProperty("datablau.kafka-topic.entity-change-event", "datablau-entity-change-event");
        }
        return topic;
    }

    /**
     * 新增
     *
     * @param object
     */
    @PostPersist
    public void onWriteObject(Object object) {
        if (object instanceof ModelCategory) {
            sendModelCategoryEvent((ModelCategory) object, EntityChangeType.ADD);
        }

    }

    /**
     * 监听更新
     *
     * @param object
     */
    @PostUpdate
    public void onUpdateObject(Object object) {
        if (object instanceof ModelCategory) {
            sendModelCategoryEvent((ModelCategory) object, EntityChangeType.UPDATE);
        }

    }

    /**
     * 监听删除
     *
     * @param object
     */
    @PostRemove
    public void onRemoveObject(Object object) {
        if (object instanceof ModelCategory) {
            sendModelCategoryEvent((ModelCategory) object, EntityChangeType.DELETE);
        }

    }

    public void sendModelCategoryEvent(ModelCategory mc, EntityChangeType changeType) {
        es.submit(() -> {
            try {
                logger.debug("send modelCategory entity change event...");

                EntityChangeEventDto eventDto = new EntityChangeEventDto(changeType, mapper.writeValueAsString(mc.toDto()),
                        mc.getStringModelCategoryId(), LDMTypes.oSystem);

                getKafkaPublishService().sendMessage(getTopic(), eventDto);
                logger.debug("send event to kafka success, topic is [{}]!", getTopic());
            } catch (Exception e) {
                logger.error(e.getMessage(), e);
            }
        });
    }


}
