package com.datablau.metadata.main.service.elastic.impl.global.search.executor;

import com.andorj.common.core.model.LDMTypes;
import com.andorj.model.common.utility.BeanHelper;
import com.datablau.base.api.ModelCategoryService;
import com.datablau.base.data.ModelCategoryDto;
import com.datablau.metadata.main.service.elastic.wrapper.GlobalSearchWrapper;

import java.util.ArrayList;
import java.util.List;

/**
 * @program: dam
 * @description: 应用系统同步
 * @author: wang tong
 * @create: 2025-06-23 10:11
 **/
public class ModelCategorySync extends GlobalSearchSync {

    public List<ModelCategoryDto> allMc;

    public ModelCategorySync() {
    }

    public ModelCategorySync(List<ModelCategoryDto> allMc) {
        this.allMc = allMc;
    }

    @Override
    void queryDbData() {
        ModelCategoryService modelCategoryService = BeanHelper.getBean(ModelCategoryService.class);
        allMc = modelCategoryService.getModelCategories();
    }

    @Override
    List<GlobalSearchWrapper> convertGlobalSearchWrapper() {
        List<GlobalSearchWrapper> result = new ArrayList<>();
        if (allMc == null || allMc.isEmpty()) {
            return result;
        }
        for (ModelCategoryDto m : allMc) {
            GlobalSearchWrapper wrapper = createGlobalSearchWrapper(m);
            result.add(wrapper);
        }

        return result;
    }

    public GlobalSearchWrapper createGlobalSearchWrapper(ModelCategoryDto m) {
        GlobalSearchWrapper wrapper = new GlobalSearchWrapper();
        wrapper.setItemId(m.getCategoryId().toString());
        wrapper.setItemType(LDMTypes.oSystem);
        wrapper.setChineseName(m.getCategoryName());
        wrapper.setEnglishName(m.getCategoryAbbreviation());
        wrapper.setDescription(m.getDescription());

        return wrapper;
    }

    @Override
    String getTypeName() {
        return "ModelCategory";
    }

    @Override
    List<GlobalSearchWrapper> selfIncrementSync() {
        LOGGER.info("increment sync model , current batch size [{}]...", allMc.size());
        return convertGlobalSearchWrapper();
    }
}
