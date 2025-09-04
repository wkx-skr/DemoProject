package com.datablau.domain.management.api;

import com.andorj.common.data.PageResult;
import com.datablau.domain.management.dto.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-06-17 13:13
 * @description 主要是存储相关批次信息使用
 */
public interface ApplyService {

    void create(BatchApplyDto batchApplyDto);

    void createBatch(List<BatchApplyDto> batchApplyDtoList);
    // 不使用这个方法
    void delete(Long id);

    PageResult<BatchApplyDto> page(BatchApplyPageQueryDto queryDto, String currentUser);

    void importFile(MultipartFile file, String type,String batchNam); // 👈 新增导入方法


    // 数据发布 只有从待发布--发布的走这个方法
    void pubData(PubBatchApplyDto pubBatchApplyDto);


    // 审批是否通过
    void  applyInfo(BatchApplyDopInfoDto batchApplyDopInfoDto,String username);

    void  applyBind(BatchApplyDopInfoDto batchApplyDopInfoDto,String username);


    void  applyBindBatch(BatchApplyBindDto batchApplyDopInfoDto,String username);

    List<BatchApplyDetailDto> getDetailDtoByBatchId(Long batchId);


    void confirmBatch(List<Long> batchIds, String currentUser);

    void deleteBatch(List<Long> ids,String username);


    Map<String, List<List<Object>>> exportBatchAndDetails(Long batchId);

    void applyInfoWhitelist(FlowBatchApplyDopInfoDto flowBatchApplyDopInfoDto, String username);

    String applyValidateData(List<Long> batchIds);

    /**
     *  驳回接口
     */
    void applyReject(List<Long> applyIds, String username);
}
