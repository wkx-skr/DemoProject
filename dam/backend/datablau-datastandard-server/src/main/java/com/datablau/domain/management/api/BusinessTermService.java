package com.datablau.domain.management.api;

import com.andorj.common.data.EditHistory;
import com.andorj.common.data.PageResult;
import com.datablau.data.common.data.instantjob.ImportInstantJobResult;
import com.datablau.domain.management.dto.BusinessTermChartDto;
import com.datablau.domain.management.dto.BusinessTermDto;
import com.datablau.domain.management.dto.BusinessTermQueryDto;
import com.datablau.domain.management.dto.NamingStandardQueryDto;
import com.datablau.domain.management.jpa.entity.BusinessTerm;
import com.datablau.workflow.common.entity.type.ProcessResultType;

import java.io.File;
import java.util.Collection;
import java.util.List;

/**
 * @ClassName：BusinessTermService
 * @Author: dingzicheng
 * @Date: 2024/9/2 14:06
 * @Description: 业务术语Service
 */
public interface BusinessTermService {
    /**
     * 新增业务术语
     *
     * @return
     * @param: businessTermDto - [BusinessTermDto]
     */
    BusinessTermDto addBusinessTerm(BusinessTermDto businessTermDto, String user, Boolean published);

    /**
     * 修改业务术语
     *
     * @return
     * @param: businessTermDto - [BusinessTermDto]
     * @param: user - [String]
     */
    BusinessTermDto updateBusinessTerm(BusinessTermDto businessTermDto, String user);

    /**
     * 批量删除业务术语
     *
     * @return
     * @param: ids - [Long>]
     * @param: user - [String]
     */
    void deleteBusinessTerm(List<Long> ids, String user);

    PageResult<BusinessTermDto> getPageOfBusinessTermDto(BusinessTermQueryDto dto);

    PageResult<BusinessTermDto> getPageOfBusinessTermDto(BusinessTermQueryDto dto, boolean isPage);

    BusinessTermDto queryBusinessTermById(Long nsId);

    List<BusinessTermDto> queryBusinessTermById(List<Long> nsIds);

    void fillDepartmentName(BusinessTermDto businessTermDto);

    void fillDepartmentName(List<BusinessTermDto> businessTermDtos);

    PageResult<EditHistory> getNamingStandardHistory(NamingStandardQueryDto queryDto);

    ImportInstantJobResult importBusinessTerm(boolean autoGenCode, File uploadFile, boolean published, String username, boolean ignoreError, Long categoryId, boolean publishUpload);

    BusinessTermDto updateDomainState(BusinessTerm dto, String message, String currentUsername);

    void checkParams(BusinessTermDto businessTermDto);

    void publicBusinessTerm(Long valueOf, String startUser, String stateOriginal);


    void passBusinessTermUpdate(Long nsId, String startUser);

    void rejectBusinessTermUpdate(Long nsId, String startUser);

    void businessTermAbolish(Long nsId, String startUser, ProcessResultType resultType);

    Boolean checkNsNameConflicts(String nsName);

    BusinessTermChartDto getNsChart();

    Boolean moveTo(Long id, List<BusinessTermDto> businessTermDtos, String currentUser);

    void updateDomainStateBatch(List<BusinessTermDto> businessTermDtos, String message, String username, String applyType, Integer approvalStatus);

    List<BusinessTermDto> getByNames(List<String> chNames);
}
