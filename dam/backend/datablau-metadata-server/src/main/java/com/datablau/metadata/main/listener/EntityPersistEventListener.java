package com.datablau.metadata.main.listener;

import com.andorj.common.core.model.LDMTypes;
import com.andorj.model.common.utility.BeanHelper;
import com.datablau.data.common.api.PropertyService;
import com.datablau.data.common.api.impl.KafkaPublishService;
import com.datablau.data.common.data.EntityChangeEventDto;
import com.datablau.data.common.type.EntityChangeType;
import com.datablau.metadata.main.entity.metadata.DataObject;
import com.datablau.metadata.main.entity.model.Model;
import com.datablau.metadata.main.entity.report.DataReport;
import com.datablau.metadata.main.entity.share.file.DataShareFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Component;

import javax.persistence.PostPersist;
import javax.persistence.PostRemove;
import javax.persistence.PostUpdate;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;


@Component
@ConditionalOnMissingBean(name = "entityPersistEventListenerExt")
public class EntityPersistEventListener {
    private static final Logger logger = LoggerFactory.getLogger(EntityPersistEventListener.class);

    protected KafkaPublishService kafkaPublishService;

    protected String topic;

    protected ObjectMapper mapper = new ObjectMapper();

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

    protected ExecutorService es = Executors.newSingleThreadExecutor(r -> {
        Thread t = new Thread(r, "ENTITY-CHANGE-EVENT");
        t.setDaemon(true);
        return t;
    });

    /**
     * 新增
     *
     * @param object
     */
    @PostPersist
    public void onWriteObject(Object object) {
        if (object instanceof DataReport) {
            sendDataReportEvent((DataReport) object, EntityChangeType.ADD);
        }
        if (object instanceof DataShareFile) {
            sendShareFileEvent((DataShareFile) object, EntityChangeType.ADD);
        }
        if (object instanceof DataObject) {
            sendDataObjectEvent((DataObject) object, EntityChangeType.ADD);
        }
        if (object instanceof Model) {
            sendModelEvent((Model) object, EntityChangeType.ADD);
        }
    }

    /**
     * 监听更新
     *
     * @param object
     */
    @PostUpdate
    public void onUpdateObject(Object object) {
        if (object instanceof DataReport) {
            sendDataReportEvent((DataReport) object, EntityChangeType.UPDATE);
        }
        if (object instanceof DataShareFile) {
            sendShareFileEvent((DataShareFile) object, EntityChangeType.UPDATE);
        }
        if (object instanceof DataObject) {
            EntityChangeType changeType;
            if (((DataObject) object).getEndVersion() != null) {
                changeType = EntityChangeType.DELETE;
            } else {
                changeType = EntityChangeType.UPDATE;
            }
            sendDataObjectEvent((DataObject) object, changeType);
        }
        if(object instanceof Model){
            sendModelEvent((Model) object, EntityChangeType.UPDATE);
        }
    }

    /**
     * 监听删除
     *
     * @param object
     */
    @PostRemove
    public void onRemoveObject(Object object) {
        if (object instanceof DataReport) {
            sendDataReportEvent((DataReport) object, EntityChangeType.DELETE);
        }
        if (object instanceof DataShareFile) {
            sendShareFileEvent((DataShareFile) object, EntityChangeType.DELETE);
        }
        if (object instanceof DataObject) {
            if (((DataObject) object).getEndVersion() != null) {
                sendDataObjectEvent((DataObject) object, EntityChangeType.DELETE);
            }
        }
        if(object instanceof Model){
            sendModelEvent((Model) object, EntityChangeType.DELETE);
        }
    }

    public void sendDataReportEvent(DataReport dataReport, EntityChangeType changeType) {
        es.submit(() -> {
            try {
                logger.debug("send data report entity change event...");

                EntityChangeEventDto eventDto = new EntityChangeEventDto(changeType, mapper.writeValueAsString(dataReport),
                        dataReport.getStringId(), LDMTypes.oDataReport);

                getKafkaPublishService().sendMessage(getTopic(), eventDto);
                logger.debug("send event to kafka success, topic is [{}]!", getTopic());
            } catch (Exception e) {
                logger.error(e.getMessage(), e);
            }
        });
    }

    public void sendShareFileEvent(DataShareFile shareFile, EntityChangeType changeType) {
        es.submit(() -> {
            try {
                logger.debug("send data share file entity change event...");

                EntityChangeEventDto eventDto = new EntityChangeEventDto(changeType, mapper.writeValueAsString(shareFile),
                        shareFile.getId().toString(), LDMTypes.oUnstructuredDataAssets);

                getKafkaPublishService().sendMessage(getTopic(), eventDto);
                logger.debug("send event to kafka success, topic is [{}]!", getTopic());
            } catch (Exception e) {
                logger.error(e.getMessage(), e);
            }
        });
    }

    public void sendDataObjectEvent(DataObject dataObject, EntityChangeType changeType) {
        es.submit(() -> {
            try {
                logger.debug("send data object entity change event...");

                long type;
                if (Strings.isNullOrEmpty(dataObject.getMetaModelCode())) {
                    type = dataObject.getTypeId();
                } else {
                    type = LDMTypes.oMetadataObject;
                }

                EntityChangeEventDto eventDto = new EntityChangeEventDto(changeType, mapper.writeValueAsString(dataObject.toDto()),
                        dataObject.getStringObjectId(), type);

                getKafkaPublishService().sendMessage(getTopic(), eventDto);
                logger.debug("send event to kafka success, topic is [{}]!", getTopic());
            } catch (Exception e) {
                logger.error(e.getMessage(), e);
            }
        });
    }

    public void sendModelEvent(Model model, EntityChangeType changeType) {
        es.submit(() -> {
            try {
                logger.debug("send model entity change event...");
                EntityChangeEventDto eventDto = new EntityChangeEventDto(changeType, mapper.writeValueAsString(model.toDto()), model.getModelId().toString(), LDMTypes.oModelSource);
                getKafkaPublishService().sendMessage(getTopic(), eventDto);
                logger.debug("send event to kafka success, topic is [{}]!", getTopic());

            } catch (Exception e) {
                logger.error(e.getMessage(), e);
            }
        });
    }
}
