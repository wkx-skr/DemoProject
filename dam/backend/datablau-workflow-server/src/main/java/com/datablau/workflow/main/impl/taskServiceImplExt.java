package com.datablau.workflow.main.impl;


import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.model.common.api.MessageService;
import com.datablau.data.common.type.SystemType;
import com.datablau.workflow.common.entity.dto.TaskDto;
import com.datablau.workflow.common.entity.dto.query.TaskQueryDto;
import com.datablau.workflow.common.entity.type.ProcessResultType;
import com.datablau.workflow.common.utils.PageVo;
import com.datablau.workflow.main.dao.WorkflowProcessInstanceRepository;
import com.datablau.workflow.main.dao.WorkflowProcessRepository;
import com.datablau.workflow.main.dao.WorkflowTaskUrgeRepository;
import com.datablau.workflow.main.service.ProcessCommonService;
import com.datablau.workflow.main.service.ProcessService;
import com.datablau.workflow.main.service.TaskServiceExt;
import com.datablau.workflow.main.service.WorkflowProcessCategoryService;
import com.datablau.workflow.main.service.impl.TaskServiceImpl;
import com.datablau.workflow.main.service.util.DateUtil;
import com.google.common.base.Strings;
import com.google.common.collect.Sets;
import org.activiti.engine.*;
import org.activiti.engine.history.HistoricTaskInstance;
import org.activiti.engine.impl.persistence.entity.IdentityLinkEntity;
import org.hibernate.query.internal.NativeQueryImpl;
import org.hibernate.transform.Transformers;
import org.hibernate.type.StandardBasicTypes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Query;
import java.util.*;
import java.util.stream.Collectors;

@Service("taskServiceImplExt")
public class taskServiceImplExt implements TaskServiceExt {

    @Autowired
    protected org.activiti.engine.TaskService taskService;
    @Autowired
    protected RuntimeService runtimeService;
    @Autowired
    protected RepositoryService repositoryService;
    @Autowired
    protected FormService formService;
    @Autowired
    protected HistoryService historyService;
    @Autowired
    protected ProcessCommonService processCommonService;
    @Autowired
    protected MessageService msgService;
    @Autowired
    protected WorkflowProcessInstanceRepository instanceRepository;
    @Autowired
    protected ManagementService managementService;
    @Autowired
    protected WorkflowTaskUrgeRepository taskUrgeRepository;
    @Autowired
    protected WorkflowProcessRepository workflowProcessRepository;
    @Autowired
    protected WorkflowProcessCategoryService processCategoryService;
    @Autowired
    protected ProcessService processService;
    @Autowired
    protected EntityManagerFactory entityManagerFactory;
    @Override
    public int domainDone() {
        TaskQueryDto dto = new TaskQueryDto();
        Calendar calendar = Calendar.getInstance();
        int currentYear = calendar.get(Calendar.YEAR);
        Date now = new Date(); // 当前时间

        // 设置今年的开始时间和当前时间
        dto.setEndTimeLeft(new Date(currentYear - 1900, 0, 1)); // 当前年份的1月1日
        dto.setEndTimeRight(now); //
        dto.setProcessEnd(true);
        dto.setAppName(Sets.newHashSet("DOMAIN"));
        List<TaskDto> taskDtos = this.doneTaskQuery(dto);

        // 使用流操作筛选出proCategoryName以“数据标准_”开头的任务
        List<TaskDto> filteredTaskDtos = taskDtos.stream()
                .filter(taskDto -> taskDto.getProCategoryName() != null && taskDto.getProCategoryName().startsWith("数据标准_"))
                .collect(Collectors.toList());


        return filteredTaskDtos.size();
    }

    protected List<TaskDto> doneTaskQuery(TaskQueryDto queryDto) {
        if (queryDto == null) {
            throw new InvalidArgumentException("queryDto cannot be null");
        }
        queryDto.setStartTimeLeft(DateUtil.setDateHourAndMin(queryDto.getStartTimeLeft(), 0, 0));
        queryDto.setStartTimeRight(DateUtil.setDateHourAndMin(queryDto.getStartTimeRight(), 23, 59));
        queryDto.setEndTimeLeft(DateUtil.setDateHourAndMin(queryDto.getEndTimeLeft(), 0, 0));
        queryDto.setEndTimeRight(DateUtil.setDateHourAndMin(queryDto.getEndTimeRight(), 23, 59));
        EntityManager em = this.entityManagerFactory.createEntityManager();

        try {
            String selectSql = "select task.id_ as taskId, task.proc_inst_id_ as processInstanceId, wi.process_name as processName,  wi.process_category_code as proCategoryCode, wpc.process_category_name as proCategoryName, wi.start_user as startUserId,  task.start_time_ as startTimeDate, task.end_time_ as endTimeDate ";
            String countSql = "select count(*) ";
            String var10000 = this.managementService.getTableName(HistoricTaskInstance.class);
            String fromSql = " from  " + var10000 + " task  left join " + this.managementService.getTableName(IdentityLinkEntity.class) + " link on link.task_id_ = task.id_  inner join db_workflow_process_instance wi  on task.proc_inst_id_ = wi.process_instance_id inner join db_workflow_process_category wpc on wi.process_category_code = wpc.process_category_code  inner join db_workflow_process_system ws on wi.process_category_code = ws.process_category_code ";
            int idx = 1;
            Map<Integer, Object> parameters = new HashMap();
            String whereStmt = "where 1=1";
            if (queryDto.getAppNames() != null && !queryDto.getAppNames().isEmpty()) {
                whereStmt = whereStmt + " and ws.app_name in (";
                StringBuilder sb = new StringBuilder();
                Iterator var11 = queryDto.getAppNames().iterator();

                while(var11.hasNext()) {
                    SystemType appName = (SystemType)var11.next();
                    sb.append(",").append("'").append(appName).append("'");
                }

                whereStmt = whereStmt + sb.substring(1);
                whereStmt = whereStmt + ")";
            } else {
                whereStmt = whereStmt + " and ws.app_name is null";
            }

            if (!Strings.isNullOrEmpty(queryDto.getProcessName())) {
                whereStmt = whereStmt + " and (wi.process_name like ?" + idx + " or wi.start_user like ?" + (idx + 1) + ")";
                parameters.put(idx++, "%" + queryDto.getProcessName() + "%");
                parameters.put(idx++, "%" + queryDto.getStartUserId() + "%");
            }

            if (queryDto.getProcessType() != null) {
                whereStmt = whereStmt + " and wi.process_category_code = ?" + idx;
                parameters.put(idx++, queryDto.getProcessType());
            }

            if (queryDto.getStartTimeLeft() != null && queryDto.getStartTimeRight() != null) {
                whereStmt = whereStmt + " and task.start_time_ between ?" + idx + " and ?" + (idx + 1);
                parameters.put(idx++, queryDto.getStartTimeLeft());
                parameters.put(idx++, queryDto.getStartTimeRight());
            }

            if (queryDto.getEndTimeLeft() != null && queryDto.getEndTimeRight() != null) {
                whereStmt = whereStmt + " and task.end_time_ between ?" + idx + " and ?" + (idx + 1);
                parameters.put(idx++, queryDto.getEndTimeLeft());
                parameters.put(idx++, queryDto.getEndTimeRight());
            }
            /*whereStmt = whereStmt + " and (task.assignee_ = ?" + idx + " or (task.assignee_ is null and link.type_ = 'candidate' and link.user_id_ = ?" + idx + ")) ";
            parameters.put(idx++, queryDto.getUsername());*/
            if (queryDto.getProcessEnd()) {
                whereStmt = whereStmt + " and task.end_time_ is not null and wi.apply_result != '" + this.msgService.getMessage("process.key.revoked") + "'";
            } else {
                whereStmt = whereStmt + " and task.end_time_ is null";
            }

            String orderSql = " order by task.start_time_ desc";
            NativeQueryImpl<TaskDto> valueQuery = (NativeQueryImpl)em.createNativeQuery(selectSql + fromSql + whereStmt + orderSql).unwrap(NativeQueryImpl.class);
            valueQuery.addScalar("taskId", StandardBasicTypes.STRING);
            valueQuery.addScalar("processInstanceId", StandardBasicTypes.STRING);
            valueQuery.addScalar("processName", StandardBasicTypes.STRING);
            valueQuery.addScalar("proCategoryCode", StandardBasicTypes.STRING);
            valueQuery.addScalar("proCategoryName", StandardBasicTypes.STRING);
            valueQuery.addScalar("startUserId", StandardBasicTypes.STRING);
            valueQuery.addScalar("startTimeDate", StandardBasicTypes.TIMESTAMP);
            valueQuery.addScalar("endTimeDate", StandardBasicTypes.TIMESTAMP);
            valueQuery.setResultTransformer(Transformers.aliasToBean(TaskDto.class));
            Iterator var21 = parameters.keySet().iterator();

            while(var21.hasNext()) {
                int key = (Integer)var21.next();
                valueQuery.setParameter(key, parameters.get(key));
            }
            List<TaskDto> resultList = valueQuery.getResultList();
            return resultList;
        } finally {
            em.close();
        }
    }
}
