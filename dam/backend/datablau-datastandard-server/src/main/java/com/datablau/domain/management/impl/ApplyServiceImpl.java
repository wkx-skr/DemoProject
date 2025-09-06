package com.datablau.domain.management.impl;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.data.PageResult;
import com.andorj.file.exception.ArgumentMissingException;
import com.datablau.data.common.util.ExcelUtil;
import com.datablau.domain.management.api.ApplyService;
import com.datablau.domain.management.api.BusinessTermService;
import com.datablau.domain.management.api.DomainService;
import com.datablau.domain.management.dto.*;
import com.datablau.domain.management.jpa.entity.BatchApply;
import com.datablau.domain.management.jpa.entity.BatchApplyDetail;
import com.datablau.domain.management.jpa.entity.BatchConfirmConfig;
import com.datablau.domain.management.jpa.entity.SkipReason;
import com.datablau.domain.management.jpa.repository.BatchApplyDetailRepository;
import com.datablau.domain.management.jpa.repository.BatchApplyRepository;
import com.datablau.domain.management.jpa.repository.BatchConfirmConfigRepository;
import com.datablau.domain.management.jpa.repository.SkipReasonRepository;
import com.datablau.domain.management.jpa.type.ConfirmState;
import com.datablau.project.api.RemoteArchyExtendService;
import com.datablau.project.api.RemoteDataAssetExtendService;
import com.datablau.project.api.dto.BatchApplyDetailRemoteDto;
import com.datablau.project.api.dto.BatchApplyRemoteDto;
import org.apache.logging.log4j.util.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;


import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-06-17 13:14
 * @description
 */
@Service
public class ApplyServiceImpl implements ApplyService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ApplyServiceImpl.class);

    @Autowired
    private BatchApplyRepository batchApplyRepository;

    @Autowired
    private BatchApplyDetailRepository batchApplyDetailRepository;


    @Autowired
    private DomainService domainService;

    @Autowired
    private BusinessTermService businessTermService;

    @Autowired
    private RemoteDataAssetExtendService remoteDataAssetExtendService;

    @Autowired
    private RemoteArchyExtendService applyArchyObjectState;

    @Autowired
    private BatchConfirmConfigRepository batchConfirmConfigRepository;

    @Autowired
    private SkipReasonRepository skipReasonRepository;
//
//    @Autowired
//    private UserSer
    
    @Override
    @Transactional
    public void create(BatchApplyDto batchApplyDto) {
        // 保存主表
        BatchApply apply = new BatchApply();
        apply.setApplyType(convertApplyType(batchApplyDto.getApplyType()));
        // 这里统一加入一个perfix 格式为 时间格式开头。如20250619-1213 （1213 表示十二点十三分-name
        apply.setApplyName(generatePrefix()+"-"+batchApplyDto.getApplyName());
        apply.setApplyCreator(batchApplyDto.getApplyCreator());
        apply.setApplyCreateTime(new Date());
        //apply.set
        apply.setApplyOperation(batchApplyDto.getApplyOperation());
        apply.setApplyInnerName(batchApplyDto.getApplyName());
        apply.setApplyBuCode(batchApplyDto.getBuCode());
        apply.setInnerState(ConfirmState.UNCONFIRMED);
        apply = batchApplyRepository.save(apply); // 保存后返回带 ID 的对象
        // 保存子表
        if (batchApplyDto.getDetails() != null && !batchApplyDto.getDetails().isEmpty()) {
            for (BatchApplyDetailDto detailDto : batchApplyDto.getDetails()) {
                BatchApplyDetail detail = new BatchApplyDetail();
                detail.setApplyType(convertApplyType(detailDto.getDataType()));
                detail.setCode(detailDto.getCode());
                detail.setCnName(detailDto.getCnName());
                detail.setEnName(detailDto.getEnName());
                detail.setNeId(detailDto.getNeId());
                detail.setOldId(detailDto.getOldId());
                detail.setDataType(convertApplyType(detailDto.getDataType()));
              //  detail.setOrderState(detailDto.getOrderState());
                detail.setOrderType(detailDto.getOrderType());
                detail.setSubmitUser(detailDto.getSubmitUser());
                detail.setDomainCode(detailDto.getDomainCode());
                detail.setBatchId(apply.getId());
                if (!ObjectUtils.isEmpty(detailDto.getOldData())){
                    detail.setOldData(detailDto.getOldData());
                }
                if (!ObjectUtils.isEmpty(detailDto.getNeData())){
                    detail.setNeData(detailDto.getNeData());
                }

                batchApplyDetailRepository.save(detail);
            }
        }
    }

    @Override
    public void createBatch(List<BatchApplyDto> batchApplyDtoList) {
        for (BatchApplyDto batchApplyDto : batchApplyDtoList) {
            BatchApply apply = new BatchApply();
            apply.setApplyType(convertApplyType(batchApplyDto.getApplyType()));
            apply.setApplyName(generatePrefix()+"-"+batchApplyDto.getApplyName());
            apply.setApplyCreator(batchApplyDto.getApplyCreator());
            apply.setApplyCreateTime(batchApplyDto.getApplyCreateTime()); // 直接使用 DTO 中的数据
            apply.setApplyOperation(batchApplyDto.getApplyOperation());
            apply.setApplyInnerName(batchApplyDto.getApplyName());
            apply.setApplyBuCode(batchApplyDto.getBuCode());
            apply.setInnerState(ConfirmState.UNCONFIRMED);
            apply = batchApplyRepository.save(apply);

            if (batchApplyDto.getDetails() != null && !batchApplyDto.getDetails().isEmpty()) {
                for (BatchApplyDetailDto detailDto : batchApplyDto.getDetails()) {
                    BatchApplyDetail detail = new BatchApplyDetail();
                    detail.setApplyType(convertApplyType(detailDto.getDataType()));
                    detail.setCode(detailDto.getCode());
                    detail.setCnName(detailDto.getCnName());
                    detail.setEnName(detailDto.getEnName());
                    detail.setNeId(detailDto.getNeId());
             //       detail.setOldId(detailDto.getOldId());
                    detail.setDataType(convertApplyType(detailDto.getDataType()));
                    detail.setOrderType(detailDto.getOrderType());
                    detail.setSubmitUser(detailDto.getSubmitUser());
                    detail.setDomainCode(detailDto.getDomainCode());
                    detail.setBatchId(apply.getId());
                    batchApplyDetailRepository.save(detail);
                }
            }
        }
    }

    @Override
    @Transactional
    public void delete(Long id) {
        // 删除子表
        // 删除主表
        // todo check stata
        batchApplyRepository.deleteById(id);
        batchApplyDetailRepository.deleteByBatchId(id);
    }

    @Override
    public PageResult<BatchApplyDto> page(BatchApplyPageQueryDto queryDto, String currentUser) {
        int pageNum = queryDto.getPageNum() != null ? queryDto.getPageNum() : 1;
        int pageSize = queryDto.getPageSize() != null ? queryDto.getPageSize() : 10;
        // 如果当前用户不为空 获取该用户是否可以 获得分页数据
//        if (!ObjectUtils.isEmpty(currentUser)){
//            Set<UserRoleDetails> rolesForUser = RemoteServiceGetter.getUserService().getRolesForUser(currentUser);
//            rolesForUser.forEach(r ->{
//                if (r.getRoleName().equals("APPLY_CONFIRM")) {
//
//                }
//            });
//
//        }

        List<BatchConfirmConfig> configs = batchConfirmConfigRepository.findByConfirmUser1OrConfirmUser2(currentUser,currentUser);
        Set<String> domainNames = configs.stream()
                .map(BatchConfirmConfig::getDomainName)
                .collect(Collectors.toSet());

        Pageable pageable = PageRequest.of(pageNum - 1, pageSize, Sort.by(Sort.Direction.DESC, "applyCreateTime"));
        DateTimeFormatter formatter = DateTimeFormatter.ISO_OFFSET_DATE_TIME;


        Specification<BatchApply> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // ✅ 当前用户的可确认 applyInnerName 集合
            Predicate isUserConfirmScope = domainNames.isEmpty()
                    ? cb.disjunction()
                    : root.get("applyInnerName").in(domainNames);


            if (!CollectionUtils.isEmpty(queryDto.getInnerName())){
                    // 如果不为空 那就重置参数 下面两个参数取交集
                List<String> innerName = queryDto.getInnerName();
                Set<String> innerNameSet = new HashSet<>(innerName);

                Set<String> collect = domainNames.stream()
                        .filter(innerNameSet::contains)
                        .collect(Collectors.toSet());
                isUserConfirmScope = collect.isEmpty()
                        ? cb.disjunction()
                        : root.get("applyInnerName").in(collect);
            }

            // ✅ 公共状态（默认可展示）
            CriteriaBuilder.In<ConfirmState> publicStates = cb.in(root.get("innerState"));
            publicStates.value(ConfirmState.CONFIRMED);
            publicStates.value(ConfirmState.BIND);
            publicStates.value(ConfirmState.PASS);
            publicStates.value(ConfirmState.REJECT);

            // ✅ 1. 显式传入 innerState 的逻辑
            if (StringUtils.hasText(queryDto.getInnerState())) {
                try {
                    ConfirmState stateEnum = ConfirmState.valueOf(queryDto.getInnerState().toUpperCase());

                    // 👇 必须满足：状态匹配 且 权限范围包含
                    Predicate matchInnerState = cb.equal(root.get("innerState"), stateEnum);
                    Predicate visibleByUser = cb.or(isUserConfirmScope, publicStates);

                    predicates.add(cb.and(matchInnerState, visibleByUser));
                } catch (IllegalArgumentException e) {
                    throw new IllegalArgumentException("非法的 innerState 值: " + queryDto.getInnerState());
                }
            } else {
                // ✅ 2. 未传 innerState：默认展示 权限数据 + 公共状态数据
                predicates.add(cb.or(isUserConfirmScope, publicStates));
            }


            if (queryDto.getApplyType() != null && !queryDto.getApplyType().isEmpty()) {
                predicates.add(cb.equal(root.get("applyType"), queryDto.getApplyType()));
            }
            if (queryDto.getApplyName() != null && !queryDto.getApplyName().isEmpty()) {
                predicates.add(cb.like(root.get("applyName"), "%" + queryDto.getApplyName() + "%"));
            }
            if (queryDto.getApplyCreator() != null && !queryDto.getApplyCreator().isEmpty()) {
                predicates.add(cb.like(root.get("applyCreator"), "%" + queryDto.getApplyCreator() + "%"));
            }
            if (StringUtils.hasText(queryDto.getStartTime())) {
                Instant instant = Instant.from(formatter.parse(queryDto.getStartTime()));
                Date startDate = Date.from(instant);
                predicates.add(cb.greaterThanOrEqualTo(root.get("applyCreateTime"), startDate));
            }
            if (StringUtils.hasText(queryDto.getEndTime())) {
                Instant instant = Instant.from(formatter.parse(queryDto.getEndTime()));
                Date endDate = Date.from(instant);
                predicates.add(cb.lessThanOrEqualTo(root.get("applyCreateTime"), endDate));
            }
//            if (!ObjectUtils.isEmpty(queryDto.getInnerState())) {
//                try {
//                    ConfirmState innerStateEnum = ConfirmState.valueOf(queryDto.getInnerState().toUpperCase());
//                    predicates.add(cb.equal(root.get("innerState"), innerStateEnum));
//                } catch (IllegalArgumentException e) {
//                    // 处理非法值（比如传了“abc”）
//                    throw new IllegalArgumentException("非法的 innerState 值: " + queryDto.getInnerState());
//                }
//            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<BatchApply> page = batchApplyRepository.findAll(spec, pageable);

        List<BatchApplyDto> list = page.getContent().stream().map(entity -> {
            BatchApplyDto dto = new BatchApplyDto();
            dto.setId(entity.getId());
            dto.setApplyType(entity.getApplyType());
            dto.setApplyName(entity.getApplyName());
            dto.setApplyCreator(entity.getApplyCreator());
            dto.setApplyCreateTime(entity.getApplyCreateTime());
            dto.setApplyOperation(entity.getApplyOperation());
            dto.setInnerState(entity.getInnerState());
            dto.setInnerName(entity.getApplyInnerName());
            dto.setBuCode(entity.getApplyBuCode());
            String confirmUser     = entity.getConfirmUser();
            String confirmUserTwo  = entity.getConfirmUserTow();

            // 把两个字段放进 Stream，过滤掉 null / 空 / 纯空白，再用逗号拼接
            String cu = Stream.of(confirmUser, confirmUserTwo)
                    .filter(StringUtils::hasText)   // 既判 null 又判空白
                    .collect(Collectors.joining(","));

           // 如果两个都为空（cu 为空串），显示“无”，否则显示实际值
            dto.setConfirmUser(cu.isEmpty() ? "无" : cu);

            return dto;
        }).collect(Collectors.toList());

        PageResult<BatchApplyDto> result = new PageResult<>();
        result.setCurrentPage(pageNum);
        result.setPageSize(pageSize);
        result.setTotalItems(page.getTotalElements());
        result.setContentDirectly(list);
        return result;
    }

    // 导入批次管理 这里 每种类型都会有一个ext 表的信息

    @Override
    public void importFile(MultipartFile file, String type,String batchNam) {


    }

    @Override
    public void pubData(PubBatchApplyDto pubBatchApplyDto) {
        if (!ObjectUtils.isEmpty(pubBatchApplyDto.getType())){
            throw  new InvalidArgumentException("类型参数为空");
        }

        // 在这里要统一判断下类型 并且将数据修改为审批中 todo
        switch (pubBatchApplyDto.getType()) {
            case "domain":
                // 如果是domain类型
                handleDomainApplyBatch(pubBatchApplyDto);
                break;
            case "business":
                handleBusinessApplyBatch(pubBatchApplyDto);
                break;
            case "asset":
                handleAssetApplyBatch(pubBatchApplyDto);
                break;
            case "buModel":
                handleBuModelApplyBatch(pubBatchApplyDto);
                break;
            case "ss":
                break;
            default:
                throw  new InvalidArgumentException("未知类型");
        }

    }

    @Override
    public void applyInfo(BatchApplyDopInfoDto batchApplyDopInfoDto,String username) {

        Map<Long,String> categoryIdsMap= new HashMap<>();
        List<String> batchIds  = new ArrayList<>();
        Optional<BatchApply> batchApply = batchApplyRepository.findById(batchApplyDopInfoDto.getBatchId());
        batchApply.ifPresent(o->{
            switch (o.getApplyType()) {
                case "标准":
                    LOGGER.info("调用标准");
                    handlePubData(o,batchApplyDopInfoDto.getApprovalStatus(),"标准",username);
                    break;
                case "标准数据元":
                    LOGGER.info("调用标准");
                    handlePubData(o,batchApplyDopInfoDto.getApprovalStatus(),"标准",username);
                    break;
                case "资产":
                    List<BatchApplyDetail> byBatchId = batchApplyDetailRepository.findByBatchId(o.getId());
                    // 构造远程 DTO 对象
                    BatchApplyRemoteDto remoteDto = new BatchApplyRemoteDto();
                    remoteDto.setId(o.getId());
                    remoteDto.setApplyType(o.getApplyType());
                    remoteDto.setApplyName(o.getApplyName());
                    remoteDto.setApplyCreator(o.getApplyCreator());
                    remoteDto.setApplyCreateTime(o.getApplyCreateTime());
                    remoteDto.setApplyOperation(o.getApplyOperation());

                    // 转换 detail 列表
                    List<BatchApplyDetailRemoteDto> detailRemoteDtos = byBatchId.stream().map(detail -> {
                        BatchApplyDetailRemoteDto dto = new BatchApplyDetailRemoteDto();
                        dto.setId(detail.getId());
                        dto.setSubmitUser(detail.getSubmitUser());
                        dto.setDataType(detail.getDataType());
                        dto.setCode(detail.getCode());
                        dto.setCnName(detail.getCnName());
                        dto.setEnName(detail.getEnName());
                        dto.setOrderState(detail.getOrderState());
                        dto.setOrderType(detail.getOrderType());
                        dto.setBatchId(detail.getBatchId());
                        dto.setOldId(detail.getOldId());
                        dto.setNeId(detail.getNeId());
                        dto.setNeData(detail.getNeData());
                        dto.setOldData(detail.getOldData());
                        if (2 == batchApplyDopInfoDto.getApprovalStatus()){
                            categoryIdsMap.put(Long.valueOf(detail.getNeId()),o.getApplyOperation());
                            batchIds.add(String.valueOf(o.getId()));
                        }
                        return dto;
                    }).collect(Collectors.toList());
                    remoteDto.setDetails(detailRemoteDtos);
                    remoteDataAssetExtendService.applyAssets(remoteDto, String.valueOf(batchApplyDopInfoDto.getApprovalStatus()),username);
                    break;
                case "资产DL123":
                    List<BatchApplyDetail> bt = batchApplyDetailRepository.findByBatchId(o.getId());
                    // 构造远程 DTO 对象
                    BatchApplyRemoteDto re = new BatchApplyRemoteDto();
                    re.setId(o.getId());
                    re.setApplyType(o.getApplyType());
                    re.setApplyName(o.getApplyName());
                    re.setApplyCreator(o.getApplyCreator());
                    re.setApplyCreateTime(o.getApplyCreateTime());
                    re.setApplyOperation(o.getApplyOperation());
                    // 转换 detail 列表
                    List<BatchApplyDetailRemoteDto> dts = bt.stream().map(detail -> {
                        BatchApplyDetailRemoteDto dto = new BatchApplyDetailRemoteDto();
                        dto.setId(detail.getId());
                        dto.setSubmitUser(detail.getSubmitUser());
                        dto.setDataType(detail.getDataType());
                        dto.setCode(detail.getCode());
                        dto.setCnName(detail.getCnName());
                        dto.setEnName(detail.getEnName());
                        dto.setOrderState(detail.getOrderState());
                        dto.setOrderType(detail.getOrderType());
                        dto.setBatchId(detail.getBatchId());
                        dto.setOldId(detail.getOldId());
                        dto.setNeId(detail.getNeId());
                        dto.setNeData(detail.getNeData());
                        dto.setOldData(detail.getOldData());
                        if (2 == batchApplyDopInfoDto.getApprovalStatus()){
                            categoryIdsMap.put(Long.valueOf(detail.getNeId()),o.getApplyOperation());
                            batchIds.add(String.valueOf(o.getId()));
                        }
                        return dto;
                    }).collect(Collectors.toList());
                    re.setDetails(dts);
                    remoteDataAssetExtendService.applyAssets(re, String.valueOf(batchApplyDopInfoDto.getApprovalStatus()),username);
                    break;
                case "业务术语":
                    LOGGER.info("调用业务术语");
                    handlePubDataBu(o,batchApplyDopInfoDto.getApprovalStatus(),"业务术语",username);
                    break;
                case "业务模型":
                    LOGGER.info("调用业务模型");
                    handlerPubBuModel(o,batchApplyDopInfoDto.getApprovalStatus(),"业务模型",null);
                    break;
                case "资产DL45":
                    LOGGER.info("调用业务模型");
                    handlerPubBuModel(o,batchApplyDopInfoDto.getApprovalStatus(),"业务模型",null);
                    break;
            }

            if (2 == batchApplyDopInfoDto.getApprovalStatus() ){
                o.setInnerState(ConfirmState.PASS);
            }else if (3 == batchApplyDopInfoDto.getApprovalStatus()){
                o.setInnerState(ConfirmState.REJECT);
            }

            batchApplyRepository.save(o);
        });

        if (!CollectionUtils.isEmpty(categoryIdsMap)){
            String batchIdsStr = String.join(",", batchIds);
            remoteDataAssetExtendService.updateDopDate(categoryIdsMap, String.valueOf(batchApplyDopInfoDto.getApprovalId()),batchIdsStr);
        }

    }

    @Override
    @Transactional
    public void applyBind(BatchApplyDopInfoDto batchApplyDopInfoDto, String username) {
        Long batchId = batchApplyDopInfoDto.getBatchId();
        Optional<BatchApply> byId = batchApplyRepository.findById(batchId);
        BatchApply batchApply = byId.get();
        if (!ObjectUtils.isEmpty(batchApply)){
            batchApply.setApplyBindUser(username);
            batchApply.setApprovalId(batchApply.getApprovalId());
            batchApply.setInnerState(ConfirmState.BIND);
            batchApplyRepository.save(batchApply);
        }else {
            LOGGER.info("未查询到批次id"+batchApplyDopInfoDto.getBatchId());
        }
    }


    @Override
    @Transactional
    public void applyBindBatch(BatchApplyBindDto batchApplyDopInfoDto, String username) {
        List<Long> batchId = batchApplyDopInfoDto.getBatchId();
        List<BatchApply> allById =(List<BatchApply>) batchApplyRepository.findAllById(batchId);
        // check 如果已经关联是不能再次绑定的
        // check
        allById.forEach( e ->{
            if (!ObjectUtils.isEmpty(e.getApprovalId())){
                throw  new IllegalArgumentException("存在已绑定的流程，绑定失败");
            }
        });
        if (!CollectionUtils.isEmpty(allById)){
            for (BatchApply batchApply : allById) {
                batchApply.setApprovalId(batchApplyDopInfoDto.getApprovalId());
                batchApply.setInnerState(ConfirmState.BIND);
            }
            batchApplyRepository.saveAll(allById);
        }else {
            LOGGER.info("未查询到批次id"+batchApplyDopInfoDto.getBatchId());
        }
    }


    private void handlerPubBuModel(BatchApply o, Integer approvalStatus, String type, String username ) {
        //业务模型只有发布。所以想对简单
        LOGGER.info("username " + username);
        List<BatchApplyDetail> byBatchId = batchApplyDetailRepository.findByBatchId(o.getId());
        List<String> collect = byBatchId.stream().map(BatchApplyDetail::getNeId).collect(Collectors.toList());
        applyArchyObjectState.applyArchyObjectState(collect,approvalStatus,username);

    }


//    public void test(){
//        Map<String, List<List<Object>>> sheets = new LinkedHashMap<>();
//        sheets.put("已汇总", ExcelUtil.getSheetData(summaryAssets));
//        sheets.put("未汇总", ExcelUtil.getSheetData(unSummaryAssets));
//        Map<String, List<List<Object>>> stringListMap = dataAssetsCatalogService.exportSummaryAssets(assetsSummaryQueryDto.getCatalogId(), assetsSummaryQueryDto.getType());
//        ExcelUtil.exportManySheetByList(response, "汇总详情页面", stringListMap);
//
//    }

    @Override
    public List<BatchApplyDetailDto> getDetailDtoByBatchId(Long batchId) {
        LOGGER.info("测试代码。。。。。日志");
        List<BatchApplyDetail> detailList = batchApplyDetailRepository.findByBatchId(batchId);
        Optional<BatchApply> byId = batchApplyRepository.findById(batchId);
        Boolean domainType = false;
        List<String> domainIds  = new ArrayList<>();
        if (byId.isPresent()) {
            // 判断是否是标准类型的
            BatchApply batchApply = byId.get();
            // 判断标准是为了兼容之前的数据
            if (batchApply.getApplyType().equals("标准数据元") || batchApply.getApplyType().equals("标准")  ) {
                domainType = true ;
            }
            // 如果是标准的类型那么就去查找标准数据的 跳过原因去
            if (domainType){
                for (BatchApplyDetail batchApplyDetail : detailList) {
                    if (batchApplyDetail.getOrderType().equals("变更")){
                        domainIds.add(batchApplyDetail.getOldId());
                    }else {
                        domainIds.add(batchApplyDetail.getNeId());
                    }
                }
            }
        }
        LOGGER.info("查询到的domainids"+domainIds.toString());
        Map<String, SkipReason> skipReasonMap = new HashMap<>();
        if (!CollectionUtils.isEmpty(domainIds)){
            List<SkipReason> byDomainIdIn = skipReasonRepository.findByDomainIdIn(domainIds);
            if (!CollectionUtils.isEmpty(byDomainIdIn)){
                // 或者转换为 Map<String, List<SkipReason>>，按 domainId 分组
                Map<String, SkipReason> collect = byDomainIdIn.stream()
                        .filter(skipReason -> skipReason.getDomainId() != null)
                        .collect(Collectors.toMap(
                                SkipReason::getDomainId,
                                skipReason -> skipReason,
                                (existing, replacement) -> existing  // 遇到重复时保留先出现的
                        ));
                skipReasonMap.putAll(collect);
            }
        }

        if (detailList == null || detailList.isEmpty()) {
            return Collections.emptyList();
        }

        List<BatchApplyDetailDto> resultList = new ArrayList<>();

        for (BatchApplyDetail entity : detailList) { // 请将 EntityType 替换为实际的实体类型
            BatchApplyDetailDto dto = new BatchApplyDetailDto();
            dto.setId(entity.getId());
            dto.setSubmitUser(entity.getSubmitUser());
            dto.setDataType(entity.getDataType());
            dto.setCode(entity.getCode());
            dto.setCnName(entity.getCnName());
            dto.setEnName(entity.getEnName());
            // 设置属性
            dto.setOrderState(mapConfirmStateToChinese(byId.get().getInnerState()));
            dto.setOrderType(entity.getOrderType());
            dto.setBatchId(entity.getBatchId());
            dto.setOldId(entity.getOldId());
            dto.setNeId(entity.getNeId());
            dto.setOldData(entity.getOldData());
            dto.setNeData(entity.getNeData());
            dto.setCreateTime(byId.get().getApplyCreateTime());
            dto.setApplyCreator(byId.get().getApplyCreator());
            dto.setDomainCode(entity.getDomainCode());

            if (entity.getOrderType().equals("变更")) {
                if (skipReasonMap.containsKey(entity.getOldId())) {
                    LOGGER.info("查询的domainId"+entity.getOldId());
                    SkipReason skipReason = skipReasonMap.get(entity.getOldId());
                    LOGGER.info("查询到的数据"+skipReason.getAnotherDomainNames() + "   "+skipReason.getReason());
                    dto.setAnotherDomainNames(skipReason.getAnotherDomainNames());
                    dto.setSkipReason(skipReason.getReason());
                }
            } else {
                if (skipReasonMap.containsKey(entity.getNeId())) {
                    LOGGER.info("查询的domainId"+entity.getNeId());
                    SkipReason skipReason = skipReasonMap.get(entity.getNeId());
                    LOGGER.info("查询到的数据"+skipReason.getAnotherDomainNames() + "   "+skipReason.getReason());
                    dto.setAnotherDomainNames(skipReason.getAnotherDomainNames());
                    dto.setSkipReason(skipReason.getReason());
                }
            }

            resultList.add(dto);
        }

        return resultList;
    }

    @Override
    @Transactional
    public void confirmBatch(List<Long> batchIds, String currentUser) {
        List<BatchApply> applies = (List<BatchApply>)batchApplyRepository.findAllById(batchIds);
        for (BatchApply apply : applies) {

            // 已完全确认的批次直接拒绝
            if (apply.getInnerState() != ConfirmState.UNCONFIRMED) {
                throw new IllegalStateException("批次 ID " + apply.getId() + " 已确认完成，禁止重复确认！");
            }

            // ① 第一次确认
            if (!StringUtils.hasText(apply.getConfirmUser())) {
                // 防止同一个人两次确认：第一次确认人写在 confirmUser 字段
                apply.setConfirmUser(currentUser);
                // 状态保持 UNCONFIRMED（或改成 PARTIALLY_CONFIRMED）
                continue;
            }

            // ② 第二次确认
            if (!StringUtils.hasText(apply.getConfirmUserTow())) {
                // 同一个人不能二次确认
                if (currentUser.equals(apply.getConfirmUser())) {
                    throw new IllegalStateException("批次 ID " + apply.getId() +
                            " 已由当前用户确认过，不能重复确认！");
                }
                apply.setConfirmUserTow(currentUser);
                // 两人齐全，正式改状态
                apply.setInnerState(ConfirmState.CONFIRMED);
                continue;
            }

            // ③ 理论上到不了：出现说明有人越权写库
            throw new IllegalStateException("批次 ID " + apply.getId() +
                    " 已达到两次确认上限！");
        }

        batchApplyRepository.saveAll(applies);
    }

    @Override
    @Transactional
    public void deleteBatch(List<Long> ids,String username) {
        // 查询所有批次
        List<BatchApply> applies = StreamSupport
                .stream(batchApplyRepository.findAllById(ids).spliterator(), false)
                .collect(Collectors.toList());

        // 校验是否全部存在
        if (applies.size() != ids.size()) {
            throw new IllegalArgumentException("部分批次不存在，或无权限操作！");
        }

        // 校验状态是否全部为 UNCONFIRMED
        List<String> invalidIds = applies.stream()
                .filter(apply -> apply.getInnerState() != ConfirmState.UNCONFIRMED)
                .map(BatchApply::getApplyName)
                .collect(Collectors.toList());

        if (!invalidIds.isEmpty()) {
            throw new IllegalStateException("以下批次状态不为 UNCONFIRMED，无法删除：" + invalidIds);
        }

        // 全部合法后统一处理
        for (BatchApply apply : applies) {
            BatchApplyDopInfoDto dopInfoDto = new BatchApplyDopInfoDto();
            dopInfoDto.setBatchId(apply.getId());
            dopInfoDto.setApprovalStatus(3);
            this.applyInfo(dopInfoDto, username);

            batchApplyDetailRepository.deleteByBatchId(apply.getId());
            batchApplyRepository.deleteById(apply.getId());
        }
    }


    @Override
    public Map<String, List<List<Object>>> exportBatchAndDetails(Long batchId) {
        List<BatchApplyDetail> detailList = batchApplyDetailRepository.findByBatchId(batchId);
        Optional<BatchApply> applyOpt = batchApplyRepository.findById(batchId);

        if (!applyOpt.isPresent()) {
            throw new RuntimeException("批次不存在");
        }

        BatchApply apply = applyOpt.get();
        List<BatchApplyExportDto> applyList = new ArrayList<>();
        BatchApplyExportDto applyDto = new BatchApplyExportDto();
        applyDto.setBatchName(apply.getApplyName());
        applyDto.setCreateUser(apply.getApplyCreator());
        applyDto.setCreateTime(apply.getApplyCreateTime() == null ? null :
                LocalDateTime.ofInstant(apply.getApplyCreateTime().toInstant(), ZoneId.systemDefault()));
        applyDto.setDataType(apply.getApplyType());
        applyDto.setApplyState(mapConfirmStateToChinese(apply.getInnerState()));
        String confirmUser     = apply.getConfirmUser();
        String confirmUserTwo  = apply.getConfirmUserTow();

        // 把两个字段放进 Stream，过滤掉 null / 空 / 纯空白，再用逗号拼接
        String cu = Stream.of(confirmUser, confirmUserTwo)
                .filter(StringUtils::hasText)   // 既判 null 又判空白
                .collect(Collectors.joining(","));

        // 如果两个都为空（cu 为空串），显示“无”，否则显示实际值
        applyDto.setConfirmUser(cu.isEmpty() ? "无" : cu);
        applyList.add(applyDto);

        List<BatchApplyDetailExportDto> detailDtos = detailList.stream().map(detail -> {
            BatchApplyDetailExportDto dto = new BatchApplyDetailExportDto();
            dto.setCnName(detail.getCnName());
            dto.setEnName(detail.getEnName());
            dto.setCode(detail.getCode());
            dto.setDataType(detail.getDataType());
            dto.setOldData(detail.getOldData());
            dto.setNeData(detail.getNeData());
            dto.setSubmitUser(detail.getSubmitUser());
            dto.setCreateTime(apply.getApplyCreateTime() == null ? null :
                    LocalDateTime.ofInstant(apply.getApplyCreateTime().toInstant(), ZoneId.systemDefault()));
            dto.setOrderState(mapConfirmStateToChinese(apply.getInnerState()));
            return dto;
        }).collect(Collectors.toList());

        Map<String, List<List<Object>>> sheets = new LinkedHashMap<>();
        sheets.put("批次信息", ExcelUtil.getSheetData(applyList));
        sheets.put("批次详情", ExcelUtil.getSheetData(detailDtos));

        return sheets;
    }

    @Override
    public void applyInfoWhitelist(FlowBatchApplyDopInfoDto flowBatchApplyDopInfoDto, String username) {
        // 如果是资产的类型 那么后面进行数据的同步
        Map<Long,String> categoryIdsMap= new HashMap<>();
        List<String> batchIds  = new ArrayList<>();
        // 在这里做一下check

        if (CollectionUtils.isEmpty(flowBatchApplyDopInfoDto.getApplyData())){
            throw  new ArgumentMissingException("batch is must not null");
        }
        List<Long> collect = flowBatchApplyDopInfoDto.getApplyData().stream().map(SingleApplyInfo::getBatchId).collect(Collectors.toList());
        List<BatchApply> allById = (List<BatchApply>)batchApplyRepository.findAllById(collect);
        if (CollectionUtils.isEmpty(allById)){
            throw  new ArgumentMissingException("not found batch ids ");
        }
        for (SingleApplyInfo applyDatum : flowBatchApplyDopInfoDto.getApplyData()) {
            Optional<BatchApply> batchApply = batchApplyRepository.findById(applyDatum.getBatchId());
            batchApply.ifPresent(o->{
                switch (o.getApplyType()) {
                    case "标准":
                        LOGGER.info("调用标准");
                        handlePubData(o,flowBatchApplyDopInfoDto.getApprovalStatus(),"标准",username);
                        break;
                    case "标准数据元":
                        LOGGER.info("调用标准");
                        handlePubData(o,flowBatchApplyDopInfoDto.getApprovalStatus(),"标准",username);
                        break;
                    case "资产":
                        List<BatchApplyDetail> byBatchId = batchApplyDetailRepository.findByBatchId(o.getId());
                        // 构造远程 DTO 对象
                        BatchApplyRemoteDto remoteDto = new BatchApplyRemoteDto();
                        remoteDto.setId(o.getId());
                        remoteDto.setApplyType(o.getApplyType());
                        remoteDto.setApplyName(o.getApplyName());
                        remoteDto.setApplyCreator(o.getApplyCreator());
                        remoteDto.setApplyCreateTime(o.getApplyCreateTime());
                        remoteDto.setApplyOperation(o.getApplyOperation());
                        // 转换 detail 列表
                        List<BatchApplyDetailRemoteDto> detailRemoteDtos = byBatchId.stream().map(detail -> {
                            BatchApplyDetailRemoteDto dto = new BatchApplyDetailRemoteDto();
                            dto.setId(detail.getId());
                            dto.setSubmitUser(detail.getSubmitUser());
                            dto.setDataType(detail.getDataType());
                            dto.setCode(detail.getCode());
                            dto.setCnName(detail.getCnName());
                            dto.setEnName(detail.getEnName());
                            dto.setOrderState(detail.getOrderState());
                            dto.setOrderType(detail.getOrderType());
                            dto.setBatchId(detail.getBatchId());
                            dto.setOldId(detail.getOldId());
                            dto.setNeId(detail.getNeId());
                            dto.setNeData(detail.getNeData());
                            dto.setOldData(detail.getOldData());
                            if (2 == flowBatchApplyDopInfoDto.getApprovalStatus()){
                                categoryIdsMap.put(Long.valueOf(detail.getNeId()),o.getApplyOperation());
                                batchIds.add(String.valueOf(o.getId()));
                            }
                            return dto;
                        }).collect(Collectors.toList());
                        remoteDto.setDetails(detailRemoteDtos);
                        remoteDataAssetExtendService.applyAssets(remoteDto, String.valueOf(flowBatchApplyDopInfoDto.getApprovalStatus()),username);
                        break;
                    case "资产DL123":
                        List<BatchApplyDetail> ba = batchApplyDetailRepository.findByBatchId(o.getId());
                        // 构造远程 DTO 对象
                        BatchApplyRemoteDto re = new BatchApplyRemoteDto();
                        re.setId(o.getId());
                        re.setApplyType(o.getApplyType());
                        re.setApplyName(o.getApplyName());
                        re.setApplyCreator(o.getApplyCreator());
                        re.setApplyCreateTime(o.getApplyCreateTime());
                        re.setApplyOperation(o.getApplyOperation());
                        // 转换 detail 列表
                        List<BatchApplyDetailRemoteDto> dts = ba.stream().map(detail -> {
                            BatchApplyDetailRemoteDto dto = new BatchApplyDetailRemoteDto();
                            dto.setId(detail.getId());
                            dto.setSubmitUser(detail.getSubmitUser());
                            dto.setDataType(detail.getDataType());
                            dto.setCode(detail.getCode());
                            dto.setCnName(detail.getCnName());
                            dto.setEnName(detail.getEnName());
                            dto.setOrderState(detail.getOrderState());
                            dto.setOrderType(detail.getOrderType());
                            dto.setBatchId(detail.getBatchId());
                            dto.setOldId(detail.getOldId());
                            dto.setNeId(detail.getNeId());
                            dto.setNeData(detail.getNeData());
                            dto.setOldData(detail.getOldData());
                            if (2 == flowBatchApplyDopInfoDto.getApprovalStatus()){
                                categoryIdsMap.put(Long.valueOf(detail.getNeId()),o.getApplyOperation());
                                batchIds.add(String.valueOf(o.getId()));
                            }
                            return dto;
                        }).collect(Collectors.toList());
                        re.setDetails(dts);
                        remoteDataAssetExtendService.applyAssets(re, String.valueOf(flowBatchApplyDopInfoDto.getApprovalStatus()),username);
                        break;
                    case "业务术语":
                        LOGGER.info("调用业务术语");
                        handlePubDataBu(o,flowBatchApplyDopInfoDto.getApprovalStatus(),"业务术语",username);
                        break;
                    case "业务模型":
                        LOGGER.info("调用业务模型");
                        handlerPubBuModel(o,flowBatchApplyDopInfoDto.getApprovalStatus(),"业务模型",applyDatum.getFlowApprover());
                        break;
                    case "资产DL45":
                        LOGGER.info("调用业务模型");
                        handlerPubBuModel(o,flowBatchApplyDopInfoDto.getApprovalStatus(),"业务模型",applyDatum.getFlowApprover());
                        break;
                }
                if (2 == flowBatchApplyDopInfoDto.getApprovalStatus() ){
                    o.setInnerState(ConfirmState.PASS);
                }else if (3 == flowBatchApplyDopInfoDto.getApprovalStatus()){
                    o.setInnerState(ConfirmState.REJECT);
                }
                batchApplyRepository.save(o);
            });
        }

        if (!CollectionUtils.isEmpty(categoryIdsMap)){
            String batchIdsStr = String.join(",", batchIds);
            remoteDataAssetExtendService.updateDopDate(categoryIdsMap, String.valueOf(flowBatchApplyDopInfoDto.getApprovalId()),batchIdsStr);
        }

    }

    /**
     * 用于验证批次是否已经被绑定了
     * @param batchIds
     * @return
     */
    @Override
    public String applyValidateData(List<Long> batchIds) {
        if (CollectionUtils.isEmpty(batchIds)) {
            return "批次ID列表不能为空";
        }
        
        List<BatchApply> allById = (List<BatchApply>) batchApplyRepository.findAllById(batchIds);
        if (CollectionUtils.isEmpty(allById)) {
            return "未找到指定的批次信息";
        }
        
        // 检查批次数量是否匹配
        if (allById.size() != batchIds.size()) {
            return "部分批次ID未找到，请检查批次ID是否正确";
        }
        List<BatchApply> hasBind = allById.stream()
                .filter(batch -> !ObjectUtils.isEmpty(batch.getApprovalId()))
                .collect(Collectors.toList());

        if (!CollectionUtils.isEmpty(hasBind)) {
            StringBuilder errorMsg = new StringBuilder();
            errorMsg.append("以下批次不正确，已经被绑定：\n");

            for (BatchApply batch : hasBind) {
                String stateChinese = mapConfirmStateToChinese(batch.getInnerState());
                errorMsg.append("批次ID: ").append(batch.getId())
                        .append(", 批次名称: ").append(batch.getApplyName())
                        .append(", 当前状态: ").append(stateChinese)
                        .append("\n");
            }

            return errorMsg.toString();
        }


        // 验证批次状态，只有已确认状态的批次才能进行后续操作
        List<BatchApply> invalidStateBatches = allById.stream()
                .filter(batch -> !ConfirmState.CONFIRMED.equals(batch.getInnerState()))
                .collect(Collectors.toList());
        
        if (!CollectionUtils.isEmpty(invalidStateBatches)) {
            StringBuilder errorMsg = new StringBuilder();
            errorMsg.append("以下批次状态不正确，只有已确认状态的批次才能进行操作：\n");
            
            for (BatchApply batch : invalidStateBatches) {
                String stateChinese = mapConfirmStateToChinese(batch.getInnerState());
                errorMsg.append("批次ID: ").append(batch.getId())
                        .append(", 批次名称: ").append(batch.getApplyName())
                        .append(", 当前状态: ").append(stateChinese)
                        .append("\n");
            }
            
            return errorMsg.toString();
        }
        
        // 所有批次状态都正确
        return null;
    }

    @Override
    public void applyReject(List<Long> applyIds, String username) {
        List<BatchApply> allById =(List<BatchApply>)batchApplyRepository.findAllById(applyIds);
        // 先check 只有未确认的能够驳回
        for (BatchApply batchApply : allById) {
            if (ConfirmState.UNCONFIRMED != batchApply.getInnerState() ){
                throw  new IllegalArgumentException("当然审批单中存在不是未确认状态，无法驳回");
            }
        }
        if (!CollectionUtils.isEmpty(allById)){
            for (BatchApply batchApply : allById) {
                BatchApplyDopInfoDto dopInfoDto = new BatchApplyDopInfoDto();
                dopInfoDto.setBatchId(batchApply.getId());
                dopInfoDto.setApprovalStatus(3);
                this.applyInfo(dopInfoDto, username);
            }
        }

    }


    private void handlePubDataBu(BatchApply o, Integer approvalStatus, String type, String username) {
        Long id = o.getId();
        List<BatchApplyDetail> details = batchApplyDetailRepository.findByBatchId(id);
        // 我们只记录通过 或者未通过两种情况
        List<Long> collect = details.stream().map(BatchApplyDetail::getNeId)
                .filter(Objects::nonNull)
                .map(Long::valueOf).collect(Collectors.toList());
        List<BusinessTermDto> businessTermDtos = businessTermService.queryBusinessTermById(collect);

        businessTermService.updateDomainStateBatch(businessTermDtos,"",username,o.getApplyOperation(),approvalStatus);


    }


    private void handlePubData(BatchApply o, Integer approvalStatus,String type,String username) {
        Long id = o.getId();
        List<BatchApplyDetail> details = batchApplyDetailRepository.findByBatchId(id);
        // 我们只记录通过 或者未通过两种情况
        Set<String> collect = details.stream().map(BatchApplyDetail::getOldId).collect(Collectors.toSet());
        if ("废弃".equals(o.getApplyOperation())){
            collect = details.stream().map(BatchApplyDetail::getNeId).collect(Collectors.toSet());
        }
        List<DomainDto> domainsByDomainIds = domainService.getDomainsByDomainIds(collect);
        domainService.updateDomainStateBatch(domainsByDomainIds,"",username,o.getApplyOperation(),approvalStatus ,details,o);
    }

    private void handleBuModelApplyBatch(PubBatchApplyDto pubBatchApplyDto) {
        if (!CollectionUtils.isEmpty(pubBatchApplyDto.getData())){
            Set<String> code = pubBatchApplyDto.getData().stream().map(PubBatchApplyChildDto::getCode).collect(Collectors.toSet());
            //todo
            List<BatchApplyDetail> exitData = batchApplyDetailRepository.findByCodeInAndDataType(code, "业务模型");
            // 如果存在关联信息则进行将信息抛出,
            if (!CollectionUtils.isEmpty(exitData)){
                StringBuilder msg = new StringBuilder();
                Map<String, List<BatchApplyDetail>> map = exitData.stream().collect(Collectors.groupingBy(BatchApplyDetail::getBatchName));
                map.forEach((k,v)->{
                    String s= new String();
                    for (BatchApplyDetail b : v) {
                        s += b+",";
                    }
                    msg.append("业务模型编码为 "+s +"与"+k+"批次绑定");
                });
            }

            Map<String, List<PubBatchApplyChildDto>> groupData = pubBatchApplyDto.getData().stream().collect(Collectors.groupingBy(PubBatchApplyChildDto::getBuName));
            // 通过buname 也就是业务域名称进行分组 每个批次名称是业务域名城
            List<BatchApplyDto>  needSaveData= new ArrayList<>();
            Date date = new Date();
            groupData.forEach((k,v)->{
                BatchApplyDto batchApplyDto = new BatchApplyDto();
                batchApplyDto.setApplyCreateTime(date);
                batchApplyDto.setApplyOperation("发布");
                batchApplyDto.setApplyCreator(pubBatchApplyDto.getCreator());
                batchApplyDto.setApplyName(k);
                //todo
                List<BatchApplyDetailDto>  tm =  new ArrayList<>();
                for (PubBatchApplyChildDto pbacd : v) {
                    BatchApplyDetailDto badd = new BatchApplyDetailDto(pubBatchApplyDto.getCreator(), "业务模型", pbacd.getId() ,"发布");
                    badd.setCode(pbacd.getCode());
                    badd.setEnName(pbacd.getEnName());
                    badd.setCnName(pbacd.getCnName());
                    badd.setNeId(pbacd.getDataId());
                    badd.setNeId(pbacd.getDataId());
                    tm.add(badd);
                }
                batchApplyDto.setDetails(tm);
                needSaveData.add(batchApplyDto);
            });
            createBatch(needSaveData);
        }

    }

    private void handleAssetApplyBatch(PubBatchApplyDto pubBatchApplyDto) {
        if (!CollectionUtils.isEmpty(pubBatchApplyDto.getData())){
            Set<String> code = pubBatchApplyDto.getData().stream().map(PubBatchApplyChildDto::getCode).collect(Collectors.toSet());
            //todo
            List<BatchApplyDetail> exitData = batchApplyDetailRepository.findByCodeInAndDataType(code, "资产");
            // 如果存在关联信息则进行将信息抛出,
            if (!CollectionUtils.isEmpty(exitData)){
                StringBuilder msg = new StringBuilder();
                Map<String, List<BatchApplyDetail>> map = exitData.stream().collect(Collectors.groupingBy(BatchApplyDetail::getBatchName));
                map.forEach((k,v)->{
                    String s= new String();
                    for (BatchApplyDetail b : v) {
                        s += b+",";
                    }
                    msg.append("业务模型编码为 "+s +"与"+k+"批次绑定");
                });
            }

            Map<String, List<PubBatchApplyChildDto>> groupData = pubBatchApplyDto.getData().stream().collect(Collectors.groupingBy(PubBatchApplyChildDto::getBuName));
            // 通过buname 也就是业务域名称进行分组 每个批次名称是业务域名城
            List<BatchApplyDto>  needSaveData= new ArrayList<>();
            Date date = new Date();
            groupData.forEach((k,v)->{
                BatchApplyDto batchApplyDto = new BatchApplyDto();
                batchApplyDto.setApplyCreateTime(date);
                batchApplyDto.setApplyOperation("发布");
                batchApplyDto.setApplyCreator(pubBatchApplyDto.getCreator());
                batchApplyDto.setApplyName(k);
                List<BatchApplyDetailDto>  tm =  new ArrayList<>();
                for (PubBatchApplyChildDto pbacd : v) {
                    BatchApplyDetailDto badd = new BatchApplyDetailDto(pubBatchApplyDto.getCreator(), "资产", pbacd.getId() ,"发布");
                    badd.setCode(pbacd.getCode());
                    badd.setEnName(pbacd.getEnName());
                    badd.setCnName(pbacd.getCnName());
                    badd.setNeId(pbacd.getDataId());
                    tm.add(badd);
                }
                batchApplyDto.setDetails(tm);
                needSaveData.add(batchApplyDto);
            });

            createBatch(needSaveData);
        }
    }

    private void handleBusinessApplyBatch(PubBatchApplyDto pubBatchApplyDto) {
        if (!CollectionUtils.isEmpty(pubBatchApplyDto.getData())){
            Set<String> code = pubBatchApplyDto.getData().stream().map(PubBatchApplyChildDto::getCode).collect(Collectors.toSet());
            List<BatchApplyDetail> exitData = batchApplyDetailRepository.findByCodeInAndDataType(code, "业务术语");
            // 如果存在关联信息则进行将信息抛出,
            if (!CollectionUtils.isEmpty(exitData)){
                StringBuilder msg = new StringBuilder();
                Map<String, List<BatchApplyDetail>> map = exitData.stream().collect(Collectors.groupingBy(BatchApplyDetail::getBatchName));
                map.forEach((k,v)->{
                    String s= new String();
                    for (BatchApplyDetail b : v) {
                        s += b+",";
                    }
                    msg.append("业务术语编码为 "+s +"与"+k+"批次绑定");
                });
            }

            Map<String, List<PubBatchApplyChildDto>> groupData = pubBatchApplyDto.getData().stream().collect(Collectors.groupingBy(PubBatchApplyChildDto::getBuName));
            // 通过buname 也就是业务域名称进行分组 每个批次名称是业务域名城
            List<BatchApplyDto>  needSaveData= new ArrayList<>();
            Date date = new Date();
            groupData.forEach((k,v)->{
                BatchApplyDto batchApplyDto = new BatchApplyDto();
                batchApplyDto.setApplyCreateTime(date);
                batchApplyDto.setApplyOperation("发布");
                batchApplyDto.setApplyCreator(pubBatchApplyDto.getCreator());
                batchApplyDto.setApplyName(k);
                List<BatchApplyDetailDto>  tm =  new ArrayList<>();
                for (PubBatchApplyChildDto pbacd : v) {
                    BatchApplyDetailDto badd = new BatchApplyDetailDto(pubBatchApplyDto.getCreator(), "业务术语", pbacd.getId() ,"发布");
                    badd.setCode(pbacd.getCode());
                    badd.setEnName(pbacd.getEnName());
                    badd.setCnName(pbacd.getCnName());
                    badd.setNeId(pbacd.getDataId());
                    tm.add(badd);
                }
                batchApplyDto.setDetails(tm);
                needSaveData.add(batchApplyDto);
            });
            createBatch(needSaveData);
        }
    }


    private void handleDomainApplyBatch(PubBatchApplyDto pubBatchApplyDto) {
        if (!CollectionUtils.isEmpty(pubBatchApplyDto.getData())){
            Set<String> code = pubBatchApplyDto.getData().stream().map(PubBatchApplyChildDto::getCode).collect(Collectors.toSet());
            List<BatchApplyDetail> exitData = batchApplyDetailRepository.findByCodeInAndDataType(code, "标准数据元");
            // 如果存在关联信息则进行将信息抛出,
            if (!CollectionUtils.isEmpty(exitData)){
                StringBuilder msg = new StringBuilder();
                Map<String, List<BatchApplyDetail>> map = exitData.stream().collect(Collectors.groupingBy(BatchApplyDetail::getBatchName));
                map.forEach((k,v)->{
                    String s= new String();
                    for (BatchApplyDetail b : v) {
                        s += b+",";
                    }
                    msg.append("标准数据元编码为 "+s +"与"+k+"批次绑定");
                });
            }

            Map<String, List<PubBatchApplyChildDto>> groupData = pubBatchApplyDto.getData().stream().collect(Collectors.groupingBy(PubBatchApplyChildDto::getBuName));
            // 通过buname 也就是业务域名称进行分组 每个批次名称是业务域名城
            List<BatchApplyDto>  needSaveData= new ArrayList<>();
            Date date = new Date();
            groupData.forEach((k,v)->{
                BatchApplyDto batchApplyDto = new BatchApplyDto();
                batchApplyDto.setApplyCreateTime(date);
                batchApplyDto.setApplyOperation("发布");
                batchApplyDto.setApplyCreator(pubBatchApplyDto.getCreator());
                batchApplyDto.setApplyName(k);
                List<BatchApplyDetailDto>  tm =  new ArrayList<>();
                for (PubBatchApplyChildDto pbacd : v) {
                    BatchApplyDetailDto badd = new BatchApplyDetailDto(pubBatchApplyDto.getCreator(), "标准数据元", pbacd.getId() ,"发布");
                    badd.setCode(pbacd.getCode());
                    badd.setEnName(pbacd.getEnName());
                    badd.setCnName(pbacd.getCnName());
                    badd.setNeId(pbacd.getDataId());
                    tm.add(badd);
                }
                batchApplyDto.setDetails(tm);
                needSaveData.add(batchApplyDto);
            });

            createBatch(needSaveData);
        }
        //
    }





    public String generatePrefix() {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd-HHmm");
        return now.format(formatter);
    }


    public static ConfirmState parseInnerState(String stateStr) {
        if (stateStr == null) return null;
        try {
            return ConfirmState.valueOf(stateStr.trim().toUpperCase());
        } catch (Exception e) {
            throw new IllegalArgumentException("非法的 innerState 值: " + stateStr +
                    "，可选值为：" + Arrays.toString(ConfirmState.values()));
        }
    }


    public static String mapConfirmStateToChinese(ConfirmState state) {
        if (state == null) {
            return "未知状态";
        }
        switch (state) {
            case UNCONFIRMED:
                return "未确认";
            case CONFIRMED:
                return "已确认";
            case BIND:
                return "已绑定";
            case PASS:
                return "通过";
            case REJECT:
                return "未通过";
            default:
                return "未知状态";
        }
    }


    /**
     * 由于类型名称要进行修改，由于改动的地方太多 所以冲保存的地方改
     * @param name
     * @return
     */
    public String convertApplyType(String name){
        if (name == null) {
            return "未知类型";
        }
        switch (name) {
            case "资产":
                return "资产DL123";
            case "标准", "标准数据元":
                return "标准数据元";
            case "业务术语":
                return "业务术语";
            case "业务模型":
                return "资产DL45";
            default:
                return "未知状态";
        }
    }





}
