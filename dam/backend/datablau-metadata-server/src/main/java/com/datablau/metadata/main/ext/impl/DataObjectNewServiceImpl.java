package com.datablau.metadata.main.ext.impl;

import com.datablau.metadata.main.dao.DataObjectRepositoryExt;
import com.datablau.metadata.main.dto.BaseDataObjectNew;
import com.datablau.metadata.main.ext.DataObjectNewService;
import com.google.common.collect.Lists;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.List;

@Service
public class DataObjectNewServiceImpl implements DataObjectNewService {

    @Autowired
    private DataObjectRepositoryExt dataObjectRepositoryExt;

    @Override
    public List<BaseDataObjectNew> getBaseDataObjectNewByObjectIds(List<Long> objectIds) {
        List<BaseDataObjectNew> baseDataObjectNews = Lists.newArrayList();
        if (CollectionUtils.isEmpty(objectIds)) {
            return baseDataObjectNews;
        } else {
            for (List<Long> items : Lists.partition(objectIds, 999)) {
                List<BaseDataObjectNew> dataObjectNews = dataObjectRepositoryExt.getAllDataObjectNewByObjectIds(items);
                if (!CollectionUtils.isEmpty(dataObjectNews)) {
                    baseDataObjectNews.addAll(dataObjectNews);
                }
            }
            return baseDataObjectNews;
        }
    }
}
