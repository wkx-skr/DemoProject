package com.datablau.domain.management.api;

import com.andorj.common.data.PageResult;
import com.datablau.domain.management.dto.BatchConfirmConfigPageQueryDto;
import com.datablau.domain.management.jpa.entity.BatchConfirmConfig;

import java.util.List;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-07-09 16:26
 * @description
 */
public interface BatchConfirmConfigService {

    /**
     * 保存或更新配置
     */
    BatchConfirmConfig save(BatchConfirmConfig config);

    /**
     * 根据主键删除
     */
    void deleteById(Long id);

    /**
     * 根据主键查询
     */
    BatchConfirmConfig findById(Long id);

    /**
     * 查询全部配置
     */
    List<BatchConfirmConfig> findAll();

    /**
     * 查询当前用户作为确认人的所有配置项
     */
    List<BatchConfirmConfig> findByUser(String username);

    /**
     * 分页查询配置项
     */
    PageResult<BatchConfirmConfig> page(BatchConfirmConfigPageQueryDto dto);
}