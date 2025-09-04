package com.datablau.data.asset.service.impl;

import com.datablau.data.asset.dto.DdmRelModelCategoryDto;
import com.datablau.data.asset.jpa.entity.DdmRelModelCategory;
import com.datablau.data.asset.jpa.repository.DdmRelModelCategoryRepository;
import com.datablau.data.asset.service.DdmRelModelCategoryService;
import com.datablau.security.management.utils.AuthTools;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class DdmRelModelCategoryServiceImpl implements DdmRelModelCategoryService {

    @Autowired
    private DdmRelModelCategoryRepository ddmRelModelCategoryRepository;
    @Override
    public List<DdmRelModelCategory> queryRelModelCategories(List<Long> ddmModelIds) {

        return ddmRelModelCategoryRepository.queryDdmRelModelCategoryDtoByDdmModelIds(ddmModelIds);
    }

    /**
     * 更新模型关联的应用系统
     * @param relModelCategoryDto
     */
    @Override
    public void saveOrUpdateDdmRelModelCategory(DdmRelModelCategoryDto relModelCategoryDto) {
        Long ddmModelId = relModelCategoryDto.getDdmModelId();
        Long modelCategoryId = relModelCategoryDto.getModelCategoryId();
        Date date = new Date();
        String username = AuthTools.currentUsernameFailFast();
        DdmRelModelCategory ddmRelModelCategory = ddmRelModelCategoryRepository.queryDdmRelModelCategoryDtoByDdmModelId(ddmModelId);
        if (ddmRelModelCategory != null) {
            ddmRelModelCategory.setDdmModelId(ddmModelId);
            ddmRelModelCategory.setModelCategoryId(modelCategoryId);
            ddmRelModelCategory.setUpdater(username);
            ddmRelModelCategory.setUpdateTime(date);
            ddmRelModelCategoryRepository.save(ddmRelModelCategory);
        } else {
            DdmRelModelCategory relModelCategory = new DdmRelModelCategory();
            relModelCategory.setDdmModelId(ddmModelId);
            relModelCategory.setModelCategoryId(modelCategoryId);
            relModelCategory.setCreator(username);
            relModelCategory.setCreateTime(date);
            relModelCategory.setUpdater(username);
            relModelCategory.setUpdateTime(date);
            ddmRelModelCategoryRepository.save(relModelCategory);
        }
    }

    @Override
    public DdmRelModelCategory queryRelModelCategory(Long ddmModelId) {
        return ddmRelModelCategoryRepository.queryDdmRelModelCategoryDtoByDdmModelId(ddmModelId);
    }

    @Override
    public void saveOrUpdate(DdmRelModelCategory ddmRelModelCategory) {
        ddmRelModelCategoryRepository.save(ddmRelModelCategory);
    }

    @Override
    public List<Long> queryRelModelIdByModelCategoryId(Long modelCategoryId) {
        return ddmRelModelCategoryRepository.queryDdmModelIdByModelCategoryId(modelCategoryId);
    }
}
