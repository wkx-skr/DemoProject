package com.datablau.data.asset.job;

import com.andorj.common.core.model.LDMTypes;
import com.andorj.model.common.utility.BeanHelper;
import com.datablau.data.asset.jpa.entity.DdmCollectElement;
import com.datablau.data.asset.jpa.entity.DdmRelModelCategory;
import com.datablau.data.asset.service.DdmCollectElementService;
import com.datablau.data.asset.service.DdmRelModelCategoryService;
import com.datablau.job.scheduler.adapter.DatablauJobAdapter;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.job.scheduler.data.DatablauJobExecutionException;
import com.datablau.project.api.DatablauRemoteDdmModelServiceNew;
import com.datablau.project.api.dto.DdmModelElementDto;
import com.datablau.security.management.utils.AuthTools;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Lists;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Date;
import java.util.List;
import java.util.Objects;

public class DdmCollectElementJob extends DatablauJobAdapter {

    private static final Logger logger = LoggerFactory.getLogger(DdmCollectElementJob.class);
    public static final ObjectMapper mapper = new ObjectMapper();

    private DatablauRemoteDdmModelServiceNew datablauRemoteDdmModelServiceNew;
    private DdmCollectElementService ddmCollectElementService;

    private DdmRelModelCategoryService ddmRelModelCategoryService;

    private Long ddmModelId;

    public DdmCollectElementJob(DatablauJobDescriptor jobDescriptor) {
        this.ddmModelId = jobDescriptor.getParameterByName("ddmModelId").getLongValue();
    }

    public void prepare() throws Exception {
        this.datablauRemoteDdmModelServiceNew = (DatablauRemoteDdmModelServiceNew) BeanHelper.getBeanByName("datablauRemoteDdmModelServiceNew");
        this.ddmCollectElementService = BeanHelper.getBean(DdmCollectElementService.class);
        this.ddmRelModelCategoryService = BeanHelper.getBean(DdmRelModelCategoryService.class);
        if (this.datablauRemoteDdmModelServiceNew == null) {
            throw new DatablauJobExecutionException("Cannot find DatablauRemoteDdmModelServiceNew");
        }
        if (this.ddmCollectElementService == null) {
            throw new DatablauJobExecutionException("Cannot find DdmCollectElementService");
        }
        if (this.ddmRelModelCategoryService == null) {
            throw new DatablauJobExecutionException("Cannot find DdmRelModelCategoryService");
        }
    }

    public void execute() throws Exception {
        logger.info("DdmCollectElementJob is executing...");
        //先删除已采集的数据
        ddmCollectElementService.deleteDdmCollectElementByDdmModelId(ddmModelId);
        DdmRelModelCategory ddmRelModelCategory = ddmRelModelCategoryService.queryRelModelCategory(ddmModelId);
        if (ddmRelModelCategory == null) {
            throw new DatablauJobExecutionException("未找到应用系统");
        }
        //获取ddm元素
        List<DdmModelElementDto> modelElementDtos = datablauRemoteDdmModelServiceNew.queryDdmModelElementDtos(ddmModelId);
        List<DdmModelElementDto> models = modelElementDtos.stream().filter(x -> Objects.equals(LDMTypes.oModelSource, x.getTypeId())).toList();
        List<DdmModelElementDto> tables = modelElementDtos.stream().filter(x -> Objects.equals(LDMTypes.oEntity, x.getTypeId())).toList();
        List<DdmModelElementDto> columns = modelElementDtos.stream().filter(x -> Objects.equals(LDMTypes.oAttribute, x.getTypeId())).toList();
        List<DdmCollectElement> ddmCollectElements = Lists.newArrayList();
        DdmCollectElement ddmCollectElement;
        for (DdmModelElementDto model : models) {
            ddmCollectElement = new DdmCollectElement();
            ddmCollectElement.setModelCategoryId(ddmRelModelCategory.getModelCategoryId());
            ddmCollectElement.setDdmModelId(model.getDdmModelId());
            ddmCollectElement.setDdmModelName(model.getDdmModelName());
            ddmCollectElement.setObjectId(model.getDdmModelId());
            ddmCollectElement.setParentId(model.getParentId());
            ddmCollectElement.setParentAlias(null);
            ddmCollectElement.setParentName(null);
            ddmCollectElement.setName(model.getDdmModelName());
            ddmCollectElement.setAlias(model.getDdmModelAlias());
            ddmCollectElement.setTableId(null);
            ddmCollectElement.setTypeId(model.getTypeId());
            ddmCollectElement.setDdmCategoryId(model.getDdmCategoryId());
            ddmCollectElement.setDdmCategoryPath(model.getDdmCategoryPath());
            ddmCollectElements.add(ddmCollectElement);
        }
        for (DdmModelElementDto table : tables) {
            ddmCollectElement = new DdmCollectElement();
            ddmCollectElement.setModelCategoryId(ddmRelModelCategory.getModelCategoryId());
            ddmCollectElement.setDdmModelId(table.getDdmModelId());
            ddmCollectElement.setDdmModelName(table.getDdmModelName());
            ddmCollectElement.setObjectId(table.getTableId());
            ddmCollectElement.setParentId(table.getParentId());
            ddmCollectElement.setParentAlias(table.getDdmModelAlias());
            ddmCollectElement.setParentName(table.getDdmModelName());
            ddmCollectElement.setName(table.getTableName());
            ddmCollectElement.setAlias(table.getTableCnName());
            ddmCollectElement.setTableId(table.getTableId());
            ddmCollectElement.setTypeId(table.getTypeId());
            ddmCollectElement.setDdmCategoryId(table.getDdmCategoryId());
            ddmCollectElement.setDdmCategoryPath(table.getDdmCategoryPath());
            ddmCollectElements.add(ddmCollectElement);
        }
        for (DdmModelElementDto column : columns) {
            ddmCollectElement = new DdmCollectElement();
            ddmCollectElement.setModelCategoryId(ddmRelModelCategory.getModelCategoryId());
            ddmCollectElement.setDdmModelId(column.getDdmModelId());
            ddmCollectElement.setDdmModelName(column.getDdmModelName());
            ddmCollectElement.setObjectId(column.getColumnId());
            ddmCollectElement.setParentId(column.getParentId());
            ddmCollectElement.setParentAlias(column.getTableCnName());
            ddmCollectElement.setParentName(column.getTableName());
            ddmCollectElement.setName(column.getColumnName());
            ddmCollectElement.setAlias(column.getColumnCnName());
            ddmCollectElement.setTableId(column.getParentId());
            ddmCollectElement.setTypeId(column.getTypeId());
            ddmCollectElement.setPk(column.getPk());
            ddmCollectElement.setDdmCategoryId(column.getDdmCategoryId());
            ddmCollectElement.setDdmCategoryPath(column.getDdmCategoryPath());
            ddmCollectElements.add(ddmCollectElement);
        }
        //保存数据
        ddmCollectElementService.saveAll(ddmCollectElements);
        //更新ddm_rel_model_category表更新时间
        ddmRelModelCategory.setUpdater(AuthTools.currentUsernameFailFast());
        ddmRelModelCategory.setUpdateTime(new Date());
        ddmRelModelCategoryService.saveOrUpdate(ddmRelModelCategory);
    }

}
