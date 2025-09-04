package com.datablau.data.asset.service.impl;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.datablau.data.asset.dto.DdmCollectElementTaskParamDto;
import com.datablau.data.asset.jpa.entity.DdmRelModelCategory;
import com.datablau.data.asset.service.DdmCollectElementService;
import com.datablau.job.scheduler.adapter.JobRegistryAdapter;
import com.datablau.job.scheduler.dto.JobDto;
import com.datablau.project.api.RemoteJobSchedulerServiceNew;
import com.datablau.project.api.dto.JobResultDto;
import com.google.common.collect.Lists;

import com.andorj.common.data.PageResult;
import com.datablau.base.api.ModelCategoryService70;
import com.datablau.base.data.ModelCategoryDto;
import com.datablau.data.asset.dto.DdmModelCollectDto;
import com.datablau.data.asset.dto.DdmRelModelCategoryDto;
import com.datablau.data.asset.job.descriptor.DdmCollectElementJobDescriptorHandler;
import com.datablau.data.asset.service.DataAssetDdmModelCollectService;
import com.datablau.data.asset.service.DdmRelModelCategoryService;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.project.api.DatablauRemoteDdmModelServiceNew;
import com.datablau.project.api.dto.DdmModelInfoDto;
import com.datablau.project.api.dto.DdmModelInfoQueryDto;
import com.datablau.security.management.utils.AuthTools;
import org.apache.logging.log4j.util.Strings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DataAssetDdmModelCollectServiceImpl implements DataAssetDdmModelCollectService {

    @Autowired
    private DatablauRemoteDdmModelServiceNew datablauRemoteDdmModelServiceNew;
    @Autowired
    private DdmRelModelCategoryService ddmRelModelCategoryService;
    @Autowired
    private ModelCategoryService70 modelCategoryService;
    @Autowired
    private DdmCollectElementService collectElementService;
    @Autowired
    private JobRegistryAdapter jobRegistryAdapter;
    @Autowired
    private RemoteJobSchedulerServiceNew remoteJobSchedulerServiceNew;



    @Override
    public PageResult<DdmModelCollectDto> queryDdmModelInfoPage(DdmModelInfoQueryDto queryDto) {
        PageResult<DdmModelInfoDto> modelInfoDtoPageResult = datablauRemoteDdmModelServiceNew.queryDdmModelInfoDtoPage(queryDto);
        List<DdmModelInfoDto> content = modelInfoDtoPageResult.getContent();
        List<DdmModelCollectDto> ddmModelCollectDtos = Lists.newArrayList();
        for (DdmModelInfoDto ddmModelInfoDto : content) {
            ddmModelCollectDtos.add(convertToDdmModelCollectDto(ddmModelInfoDto));
        }

        //查询是否关联业务系统
        List<Long> modelIds = ddmModelCollectDtos.stream().map(DdmModelCollectDto::getDdmModelId).toList();
        if (!CollectionUtils.isEmpty(modelIds)) {
            List<DdmRelModelCategory> ddmRelModelCategories = ddmRelModelCategoryService.queryRelModelCategories(modelIds);
            //查询业务系统名称
            List<Long> modelCategoryIds = ddmRelModelCategories.stream().map(DdmRelModelCategory::getModelCategoryId).toList();
            Map<Long, DdmRelModelCategory> ddmRelModelCategoriesMap = ddmRelModelCategories.stream().collect(Collectors.toMap(DdmRelModelCategory::getDdmModelId, x -> x, (x1, x2) -> x1));
            List<ModelCategoryDto> modelCategoryDtos = modelCategoryService.getModelCategoriesByIds(modelCategoryIds);
            Map<Long, String> categoryMap = modelCategoryDtos.stream().collect(Collectors.toMap(ModelCategoryDto::getCategoryId, ModelCategoryDto::getCategoryName));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            for (DdmModelCollectDto ddmModelCollectDto : ddmModelCollectDtos) {
                Long ddmModelId = ddmModelCollectDto.getDdmModelId();
                DdmRelModelCategory ddmRelModelCategory = ddmRelModelCategoriesMap.get(ddmModelId);
                if (ddmRelModelCategory != null) {
                    String categoryName = categoryMap.get(ddmRelModelCategory.getModelCategoryId());
                    if (Strings.isNotEmpty(categoryName)) {
                        ddmModelCollectDto.setRelModelCategory(true);
                        ddmModelCollectDto.setModelCategoryId(ddmRelModelCategory.getModelCategoryId());
                        ddmModelCollectDto.setModelCategoryName(categoryName);
                        Date updateTime = ddmRelModelCategory.getUpdateTime();
                        String updateTimeStr = formatter.format(updateTime);
                        ddmModelCollectDto.setUpdateTime(updateTimeStr);
                    }
                }

            }
            //查询是否有采集模型元数据任务
            List<String> resIds = Lists.newArrayList();
            for (Long modelId : modelIds) {
                resIds.add(Long.toString(modelId));
            }
            List<JobResultDto> jobResultDtos = remoteJobSchedulerServiceNew.queryJobByResIdAndType(resIds, "模型元数据采集更新任务");
            Map<String, Long> jobResultDtosMap = jobResultDtos.stream().collect(Collectors.toMap(JobResultDto::getResId, JobResultDto::getJobId));
            for (DdmModelCollectDto ddmModelCollectDto : ddmModelCollectDtos) {
                Long ddmModelId = ddmModelCollectDto.getDdmModelId();
                Long jobId = jobResultDtosMap.get(Long.toString(ddmModelId));
                if (jobId != null) {
                    ddmModelCollectDto.setJobId(jobId);
                    ddmModelCollectDto.setCollectTask(true);
                }
            }
        }
        PageResult<DdmModelCollectDto> dtoPageResult = new PageResult<>();
        dtoPageResult.setContentDirectly(ddmModelCollectDtos);
        dtoPageResult.setPageSize(queryDto.getPageSize());
        dtoPageResult.setCurrentPage(queryDto.getCurrentPage());
        dtoPageResult.setTotalItems(modelInfoDtoPageResult.getTotalItems());
        return dtoPageResult;
    }

    @Override
    public Long createTask(DdmCollectElementTaskParamDto paramDto) throws Exception {
        String ddmModelName = paramDto.getDdmModelName();
        Long ddmModelId = paramDto.getDdmModelId();
        DdmCollectElementJobDescriptorHandler jobDescriptorHandler = new DdmCollectElementJobDescriptorHandler();
        DatablauJobDescriptor descriptor = jobDescriptorHandler.getTemplate();
        descriptor.setName(descriptor.getTypeName()+"-"+ddmModelName);
        descriptor.setCreator(AuthTools.currentUsernameFailFast());
        descriptor.setBoundResourceId(ddmModelId.toString());
        descriptor.setBoundResourceType("DDM_MODEL_ID");
        descriptor.setParameterValueByName("ddmModelId",ddmModelId.toString());
        List<JobDto> jobDtos = jobRegistryAdapter.registerJobInfo(Collections.singleton(descriptor));
        if (CollectionUtils.isEmpty(jobDtos)) {
            throw new Exception("创建模型元数据采集任务失败");
        }
        return jobDtos.get(0).getJobId();
    }

    @Override
    public void test(Long ddmModelId) {
        datablauRemoteDdmModelServiceNew.queryDdmModelElementDtos(ddmModelId);
    }


    private DdmModelCollectDto convertToDdmModelCollectDto(DdmModelInfoDto ddmModelInfoDto) {
        DdmModelCollectDto ddmModelCollectDto = new DdmModelCollectDto();
        ddmModelCollectDto.setDdmModelId(ddmModelInfoDto.getDdmModelId());
        ddmModelCollectDto.setDdmModelName(ddmModelInfoDto.getDdmModelName());
        ddmModelCollectDto.setDbType(ddmModelInfoDto.getDbType());
        ddmModelCollectDto.setRelModelCategory(false);
        ddmModelCollectDto.setCollectTask(false);
        return ddmModelCollectDto;
    }

}
