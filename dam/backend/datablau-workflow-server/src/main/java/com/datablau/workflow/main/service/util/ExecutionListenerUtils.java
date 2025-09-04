//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//

package com.datablau.workflow.main.service.util;

import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.model.common.utility.BeanHelper;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.base.api.NotificationService;
import com.datablau.base.data.NotificationDto;
import com.datablau.data.common.api.impl.KafkaPublishService;
import com.datablau.project.api.RemoteBaseExtendService;
import com.datablau.workflow.common.entity.dto.TaskDto;
import com.datablau.workflow.common.entity.dto.WorkflowEventResult;
import com.datablau.workflow.common.entity.type.ProcessResultType;
import com.datablau.workflow.main.dao.WorkflowProcessInstanceRepository;
import com.datablau.workflow.main.dao.WorkflowProcessRepository;
import com.datablau.workflow.main.entity.WorkflowProcess;
import com.datablau.workflow.main.entity.WorkflowProcessInstance;
import com.datablau.workflow.main.service.TaskService;
import com.datablau.workflow.main.util.SpringContextUtils;

import java.util.*;

import com.google.common.collect.Maps;
import org.activiti.bpmn.model.ActivitiListener;
import org.apache.commons.lang3.time.DateFormatUtils;
import org.apache.commons.lang3.time.DateUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.CollectionUtils;

public class ExecutionListenerUtils {
    private static final Logger LOGGER = LoggerFactory.getLogger(ExecutionListenerUtils.class);

    public ExecutionListenerUtils() {
    }




    public static void setProcessResult(WorkflowEventResult eventResult) {
        WorkflowProcessInstanceRepository instanceRepository = (WorkflowProcessInstanceRepository)SpringContextUtils.getBean(WorkflowProcessInstanceRepository.class);
        WorkflowProcessRepository processRepository = (WorkflowProcessRepository)BeanHelper.getBean(WorkflowProcessRepository.class);
        String processInstanceId = eventResult.getProcessInstanceId();
        WorkflowProcessInstance instance = instanceRepository.findFirstByProInsId(processInstanceId);
        String var10002;
        if (instance == null) {
            var10002 = GeneralUtility.getMessageService().getMessage("processInstanceNotExists");
            throw new AndorjRuntimeException(var10002 + ":" + processInstanceId);
        } else {
            WorkflowProcess process = processRepository.findByIdEquals(instance.getProcessId());
            if (process == null) {
                var10002 = GeneralUtility.getMessageService().getMessage("workflowProcessNotExists");
                throw new AndorjRuntimeException(var10002 + ":" + instance.getProcessId());
            } else {
                eventResult.setProcessCode(process.getProCode());
                eventResult.setProcessType(process.getProCategoryCode());
                eventResult.setBatchNumber(instance.getBatchNumber());
                eventResult.setStartUserId(instance.getStartUserId());
                eventResult.setProcessInsName(instance.getName());

                ProcessResultType resultType = eventResult.getProcessResult();
                instanceRepository.updateResultByProcessInstanceId(processInstanceId, resultType, new Date());
                LOGGER.info("Process type [" + eventResult.getProcessType() + "], Process instance[" + processInstanceId + "]processing completed, The result is[" + resultType.getValue() + "]");

                sendNotification(eventResult);
                sendProcessResultToKafka(eventResult);
                sendToWeact(eventResult, instance);
            }
        }
    }

    private static void sendNotification(WorkflowEventResult eventResult) {
        String var10000 = GeneralUtility.getMessageService().getMessage("toDoFinishedContent", new Object[]{eventResult.getProcessInsName()});
        String content = var10000 + ";\n" + GeneralUtility.getMessageService().getMessage("toDoFinishedResult") + ": \n" + eventResult.getProcessResult().getValue();
        content = content + ";\n " + GeneralUtility.getMessageService().getMessage("toDoFinishedInfo");
        NotificationService notificationService = (NotificationService)BeanHelper.getBeanByName("notificationService");
        NotificationDto notificationDto = new NotificationDto();
        notificationDto.setContent(content);
        notificationDto.setSource("system");
        notificationDto.setTarget(eventResult.getStartUserId());
        notificationDto.setType(getProcessTypeInt(eventResult.getProcessType()));
        notificationDto.setTitle(GeneralUtility.getMessageService().getMessage("toDoFinishedContent", new Object[]{eventResult.getProcessInsName()}));
        notificationService.submitNotification(notificationDto, false);

        LOGGER.info("Approval process completion message has been sent");
    }
    private static void sendToWeact(WorkflowEventResult eventResult, WorkflowProcessInstance instance) {
        //
        boolean weact = Arrays.asList("DOMAIN_ABOLISH", "DOMAIN_UPDATE", "STANDARD_ABOLISH", "STANDARD_UPDATE").contains(eventResult.getProcessType());
        if(weact) {
            TaskService taskService = (TaskService)BeanHelper.getBeanByName("taskService");
            List<TaskDto> taskDtos = taskService.hisTaskList(eventResult.getProcessInstanceId());
            String opinion = "";
            if(!CollectionUtils.isEmpty(taskDtos) && taskDtos.get(taskDtos.size() - 1).getParam() != null && taskDtos.get(taskDtos.size() - 1).getParam().get("opinion") != null) {
                opinion = taskDtos.get(taskDtos.size() - 1).getParam().get("opinion").toString();
            }
            String title = GeneralUtility.getMessageService().getMessage("toDoFinishedContent", new Object[]{eventResult.getProcessInsName()});
            Map[][] content = new HashMap[][]{
                    new HashMap[]{
                            Maps.newHashMap(Map.of(
                                    "tag", "text",
                                    "text", String.format("审批结果：%s", eventResult.getProcessResult().getValue())
                            ))
                    },
                    new HashMap[]{
                            Maps.newHashMap(Map.of(
                                    "tag", "text",
                                    "text", String.format("申请时间：%s", instance.getCreateTime() != null ? DateFormatUtils.format(instance.getCreateTime(), "yyyy-MM-dd HH:mm:ss") : "")
                            ))
                    },
                    new HashMap[]{
                            Maps.newHashMap(Map.of(
                                    "tag", "text",
                                    "text", String.format("申请人：%s", eventResult.getStartUserId())
                            ))
                    },
                    new HashMap[]{
                            Maps.newHashMap(Map.of(
                                    "tag", "text",
                                    "text", String.format("审批意见：%s", opinion)
                            ))
                    },
                    new HashMap[]{
                            Maps.newHashMap(Map.of(
                                    "tag", "text",
                                    "text", String.format("提交人：%s", eventResult.getStartUserId())
                            ))
                    },
            };
            Map<Object, Object> contentWrapper = Map.of(
                    "title", title +" 系统:数据架构",
                    "content", content
            );
            RemoteBaseExtendService remoteBaseExtendService = (RemoteBaseExtendService)BeanHelper.getBeanByName("remoteBaseExtendService");
            remoteBaseExtendService.sendToWeact(eventResult.getStartUserId(), eventResult.getProcessInsName(), Map.of(
                    "zh_cn", contentWrapper
            ));
        }
    }

    private static void sendProcessResultToKafka(WorkflowEventResult eventResult) {
        String topic = WorkflowEventResult.getTopic(eventResult.getProcessType());
        LOGGER.info("send event to kafka : " + topic);
        KafkaPublishService kafkaPublishService = (KafkaPublishService)BeanHelper.getBeanByName("kafkaService");
        kafkaPublishService.sendMessage(topic, eventResult);
    }

    public static ActivitiListener createActivitiListener(String event, String implementationType, String implementation) {
        ActivitiListener listener = new ActivitiListener();
        listener.setEvent(event);
        listener.setImplementationType(implementationType);
        listener.setImplementation(implementation);
        return listener;
    }

    public static int getProcessTypeInt(String proDefName) {
        try {
            int var10000;
            switch (proDefName) {
                case "DOMAIN_PUBLISH":
                    var10000 = 66601;
                    break;
                case "DOMAIN_ABOLISH":
                    var10000 = 66602;
                    break;
                case "DOMAIN_UPDATE":
                    var10000 = 66603;
                    break;
                case "METRIC_PUBLISH":
                    var10000 = 66606;
                    break;
                case "METRIC_ABOLISH":
                    var10000 = 66607;
                    break;
                case "METRIC_UPDATE":
                    var10000 = 66608;
                    break;
                case "TERRITORY_DOMAIN_PUBLISH":
                    var10000 = 66611;
                    break;
                case "TERRITORY_DOMAIN_ABOLISH":
                    var10000 = 66612;
                    break;
                case "TERRITORY_DOMAIN_UPDATE":
                    var10000 = 66613;
                    break;
                case "STANDARD_PUBLISH":
                    var10000 = 66614;
                    break;
                case "STANDARD_ABOLISH":
                    var10000 = 66615;
                    break;
                case "STANDARD_UPDATE":
                    var10000 = 66616;
                    break;
                case "TERRITORY_STANDARD_PUBLISH":
                    var10000 = 66619;
                    break;
                case "TERRITORY_STANDARD_ABOLISH":
                    var10000 = 66620;
                    break;
                case "TERRITORY_STANDARD_UPDATE":
                    var10000 = 66621;
                    break;
                case "MODEL_REPORT":
                    var10000 = 66623;
                    break;
                case "METRIC_AUTH":
                    var10000 = 66625;
                    break;
                case "ARCHY_OBJECT_PUBLISH":
                    var10000 = 66626;
                    break;
                case "ARCHY_OBJECT_ABOLISH":
                    var10000 = 66627;
                    break;
                case "ARCHY_OBJECT_UPDATE":
                    var10000 = 66628;
                    break;
                case "CATALOG_PUBLISH_APPLY":
                    var10000 = 66638;
                    break;
                case "CATALOG_OFFLINE_APPLY":
                    var10000 = 66639;
                    break;
                case "CATALOG_CHANGE_APPLY":
                    var10000 = 66636;
                    break;
                case "ASSET_PUBLISH_APPLY":
                    var10000 = 66634;
                    break;
                case "ASSET_OFFLINE_APPLY":
                    var10000 = 66635;
                    break;
                case "AUTHORITY_APPLY":
                    var10000 = 66637;
                    break;
                case "ASSET_AUTHORITY_APPLY":
                    var10000 = 66640;
                    break;
                case "TECH_RULE":
                    var10000 = 66641;
                    break;
                case "BUSINESS_RULE":
                    var10000 = 66642;
                    break;
                case "PROJECT_PUBLISH":
                    var10000 = 66643;
                    break;
                case "REQUIREMENT_APPLY":
                    var10000 = 66644;
                    break;
                case "REQUIREMENT_CHANGE_APPLY":
                    var10000 = 66645;
                    break;
                case "REQUIREMENT_ABOLISH_APPLY":
                    var10000 = 66646;
                    break;
                case "DATA_MODEL_VERSION":
                    var10000 = 66647;
                    break;
                case "DDD_METRIC_PUBLISH":
                    var10000 = 66648;
                    break;
                case "DDD_METRIC_UPDATE":
                    var10000 = 66649;
                    break;
                case "DDD_METRIC_ABOLISH":
                    var10000 = 66650;
                    break;
                default:
                    var10000 = 1;
            }

            return var10000;
        } catch (Exception var3) {
            LOGGER.error(var3.getMessage(), var3);
            return 1;
        }
    }
}
