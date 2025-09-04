package com.datablau.metadata.main.service.elastic.impl.global.search.executor;

import com.andorj.common.core.model.LDMTypes;
import com.andorj.model.common.utility.BeanHelper;
import com.datablau.metadata.common.dto.model.ModelDto;
import com.datablau.metadata.main.dao.model.ModelRepository;
import com.datablau.metadata.main.entity.model.Model;
import com.datablau.metadata.main.service.elastic.wrapper.GlobalSearchWrapper;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @program: dam
 * @description: 采集管理同步
 * @author: wang tong
 * @create: 2025-06-23 10:16
 **/
public class ModelSync extends GlobalSearchSync {


    private List<ModelDto> allModels;


    public ModelSync() {
    }

    public ModelSync(List<ModelDto> allModels) {
        this.allModels = allModels;
    }

    @Override
    void queryDbData() {
        ModelRepository modelRepository = BeanHelper.getBean(ModelRepository.class);
        allModels = modelRepository.findModels().stream().map(Model::toDto).collect(Collectors.toList());
    }

    @Override
    List<GlobalSearchWrapper> convertGlobalSearchWrapper() {
        List<GlobalSearchWrapper> result = new ArrayList<>();
        if (allModels == null || allModels.isEmpty()) {
            return result;
        }
        for (ModelDto m : allModels) {
            GlobalSearchWrapper wrapper = createGlobalSearchWrapper(m);
            result.add(wrapper);
        }

        return result;
    }

    public GlobalSearchWrapper createGlobalSearchWrapper(ModelDto model) {
        GlobalSearchWrapper wrapper = new GlobalSearchWrapper();
        wrapper.setItemId(model.getModelId().toString());
        wrapper.setItemType(LDMTypes.oModelSource);
        wrapper.setChineseName(model.getDefinition());
        wrapper.setDescription(model.getDefinition());
        wrapper.setType(model.getType());


        return wrapper;
    }

    @Override
    String getTypeName() {
        return "Model";
    }

    @Override
    List<GlobalSearchWrapper> selfIncrementSync() {
        LOGGER.info("increment sync model , current batch size [{}]...", allModels.size());
        return convertGlobalSearchWrapper();
    }
}
