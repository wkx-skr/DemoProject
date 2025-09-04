package com.datablau.data.asset.service;

import com.datablau.data.asset.dto.*;
import com.datablau.data.asset.jpa.entity.CheckResultHandlerResult;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-05-20 15:36
 * @description  检查相关代码
 */
public interface PipeAssetsCheckService {

    /**
     * 检查人任务调用的方法
     */
    void checkAssetsElement();



    List<BuAcRateDto> getBuAcRateWithQuery(CheckQueryDto queryDto);

    Page<BuAcRateDetailDto> getBuAcUserRateWithQuery(CheckQueryDetailDto param);


    Page<BuAcRateDetailDto> getBuAcUBuRateWithQuery(CheckQueryDetailDto param);


    List<AssetsDetailResultDto> monthChange(CheckQueryDto queryDto);

    Page<CheckResultHandlerResult> needHandle(CheckQueryDto queryDto);


    List<CheckResultHandlerResult> exportData(CheckQueryDto queryDto );
}
