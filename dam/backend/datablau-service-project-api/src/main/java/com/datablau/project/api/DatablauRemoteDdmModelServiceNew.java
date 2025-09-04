package com.datablau.project.api;

import com.andorj.common.data.PageResult;
import com.datablau.project.api.dto.DdmElementExtDto;
import com.datablau.project.api.dto.DdmL4ExcelDto;
import com.datablau.project.api.dto.DdmModelDto;
import com.datablau.project.api.dto.DdmModelElementDto;
import com.datablau.project.api.dto.DdmModelInfoDto;
import com.datablau.project.api.dto.DdmModelInfoQueryDto;
import com.datablau.project.api.dto.DdmModelVersionDto;
import com.datablau.project.api.dto.DdmModelVersionQueryDto;

import java.util.Collection;
import java.util.List;


public interface DatablauRemoteDdmModelServiceNew {

    PageResult<DdmModelInfoDto> queryDdmModelInfoDtoPage(DdmModelInfoQueryDto queryDto);

    List<DdmModelElementDto> queryDdmModelElementDtos(Long ddmModelId);

    List<DdmModelElementDto> queryDdmModelElementDetail(Long ddmModelId);

    void test(Object o);

    void deleteModelById(Long modelId);

    /**
     * 根据模型id获取模型信息
     */
    List<DdmModelDto> getDdmModels(Collection<Long> modelIds);

    /**
     * 根据模型id和模型版本id获取当前模型版本的名称和最新的模型版本名称
     */
    List<DdmModelVersionDto> getDdmModelVersionDto(Collection<DdmModelVersionQueryDto> dtos);

    /**
     * 根据elementID集合查询模型元数据的扩展表
     */
    List<DdmElementExtDto> getDdmElementExtByElementIds(List<Long> elementIds, String archyObjectId);

    /**
     * 导入L4和L5时同步更新模型
     */
    void syncUpdateDDMModelX(String username, Long modelId, String objectId, List<DdmL4ExcelDto> entity) throws Exception;

    /**
     * 获取两个版本对比结果
     */
    String getElementsChangesBetweenTwoVersions(Long modelId, Long baseVerId, Long targetVerId, boolean showAll) throws Exception;
}
