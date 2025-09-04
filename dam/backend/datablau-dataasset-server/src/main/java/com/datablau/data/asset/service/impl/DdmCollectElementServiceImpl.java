package com.datablau.data.asset.service.impl;

import com.andorj.common.data.PageResult;
import com.andorj.model.common.utility.MultiConditionQueryUtils;
import com.datablau.base.api.ModelCategoryService;
import com.datablau.base.data.ModelCategoryDto;
import com.datablau.data.asset.dto.DdmCollectElementConditionForModel;
import com.datablau.data.asset.dto.DdmCollectElementConditionForTable;
import com.datablau.data.asset.dto.DdmCollectElementQueryParamDto;
import com.datablau.data.asset.dto.DdmModelCollectElementDto;
import com.datablau.data.asset.jpa.entity.DdmCollectElement;
import com.datablau.data.asset.jpa.repository.DdmCollectElementRepository;
import com.datablau.data.asset.service.DdmCollectElementService;
import com.datablau.data.asset.service.DdmRelModelCategoryService;
import com.google.common.collect.Lists;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DdmCollectElementServiceImpl implements DdmCollectElementService {

    @Autowired
    private DdmCollectElementRepository ddmCollectElementRepository;
    @Autowired
    private DdmRelModelCategoryService ddmRelModelCategoryService;
    @Autowired
    private ModelCategoryService modelCategoryService;
    @Autowired
    private MultiConditionQueryUtils queryUtils;


    @Override
    public void deleteDdmCollectElementByDdmModelId(Long ddmModelId) {
        ddmCollectElementRepository.deleteDdmCollectElementByDdmModelId(ddmModelId);
    }

    @Override
    public void saveAll(List<DdmCollectElement> elements) {
        ddmCollectElementRepository.saveAll(elements);
    }

    @Override
    public PageResult<DdmModelCollectElementDto> queryDdmModelCollectElementPage(DdmCollectElementQueryParamDto paramDto) {
        List<DdmModelCollectElementDto> ddmModelCollectElementDtos = Lists.newArrayList();
        Long modelCategoryId = paramDto.getModelCategoryId();
        Long ddmModelId = paramDto.getDdmModelId();
        Long tableId = paramDto.getTableId();
        MultiConditionQueryUtils.MultiConditionQuery<DdmCollectElement> query = queryUtils.createQuery(DdmCollectElement.class);
        if (modelCategoryId != null) {
            query.andEqual("modelCategoryId", modelCategoryId);
        }
        if (ddmModelId != null) {
            query.andEqual("ddmModelId", ddmModelId);
        }
        if (tableId != null) {
            query.andEqual("tableId", tableId);
        }
        query.andEqual("typeId", 80000005);
        query.setPageInfo(paramDto.getCurrentPage(), paramDto.getPageSize());
        PageResult<DdmCollectElement> page = query.page();
        List<DdmCollectElement> collectElements = page.getContent();
        List<Long> modelCategoryIds = collectElements.stream().map(DdmCollectElement::getModelCategoryId).toList();
        List<ModelCategoryDto> categories = modelCategoryService.getModelCategoriesByIds(modelCategoryIds);
        Map<Long, String> categoryMap = categories.stream().collect(Collectors.toMap(ModelCategoryDto::getCategoryId, ModelCategoryDto::getCategoryName));
        for (DdmCollectElement collectElement : collectElements) {
            ddmModelCollectElementDtos.add(convertToDdmModelCollectElementDto(collectElement, categoryMap));
        }
        PageResult<DdmModelCollectElementDto> dtoPageResult = new PageResult<>();
        dtoPageResult.setCurrentPage(paramDto.getCurrentPage());
        dtoPageResult.setPageSize(paramDto.getPageSize());
        dtoPageResult.setContentDirectly(ddmModelCollectElementDtos);
        dtoPageResult.setTotalItems(page.getTotalItems());
        return dtoPageResult;
    }

    @Override
    public List<DdmCollectElementConditionForModel> queryModelByModelCategoryId(Long modelCategoryId) {
        List<DdmCollectElementConditionForModel> elementConditionForModels = ddmCollectElementRepository.queryModelByCategoryId(modelCategoryId);
        return elementConditionForModels;
    }

    @Override
    public List<DdmCollectElementConditionForTable> queryModelByModelId(Long ddmModelId) {
        //根据模型ID查询表
        List<DdmCollectElementConditionForTable> ddmCollectElementConditionForTables = ddmCollectElementRepository.queryTableByModelId(ddmModelId);
        return ddmCollectElementConditionForTables;
    }

    private DdmModelCollectElementDto convertToDdmModelCollectElementDto(DdmCollectElement ddmCollectElement, Map<Long, String> categoryMap) {
        DdmModelCollectElementDto collectElementDto = new DdmModelCollectElementDto();
        collectElementDto.setDdmModelId(ddmCollectElement.getDdmModelId());
        collectElementDto.setDdmModelName(ddmCollectElement.getDdmModelName());
        collectElementDto.setModelCategoryId(ddmCollectElement.getModelCategoryId());
        collectElementDto.setModelCategoryName(categoryMap.get(ddmCollectElement.getModelCategoryId()) == null ? "" : categoryMap.get(ddmCollectElement.getModelCategoryId()));
        collectElementDto.setTableId(ddmCollectElement.getTableId());
        collectElementDto.setTableName(ddmCollectElement.getParentName());
        collectElementDto.setTableCnName(ddmCollectElement.getParentAlias());
        collectElementDto.setColumnId(ddmCollectElement.getObjectId());
        collectElementDto.setColumnName(ddmCollectElement.getName());
        collectElementDto.setColumnCnName(ddmCollectElement.getAlias());
        collectElementDto.setPk(ddmCollectElement.getPk());
        return collectElementDto;
    }

    @Override
    @Transactional
    public void deleteAll() {
        ddmCollectElementRepository.deleteAll();
    }
}
