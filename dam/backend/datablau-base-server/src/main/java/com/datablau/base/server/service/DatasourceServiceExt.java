package com.datablau.base.server.service;

import com.andorj.model.common.search.QueryParameterCriteria;
import com.datablau.base.server.jpa.entity.DatasourceEntity;

import java.util.List;

/**
 * @author: hxs
 * @date: 2025/6/4 10:32
 */
public interface DatasourceServiceExt {

    List<DatasourceEntity> findExtDatasources(QueryParameterCriteria multipleCriteria);
}
