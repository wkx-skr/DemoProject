package com.datablau.data.asset.util;

import com.datablau.data.asset.dto.BuAcRateDetailDto;
import com.datablau.data.asset.dto.CheckQueryDetailDto;
import com.datablau.data.asset.enums.AssetsCheckResultType;
import com.datablau.data.asset.jpa.entity.TendencyCheckResult;
import com.datablau.data.asset.jpa.entity.TendencyCheckUserDetail;
import org.springframework.data.jpa.domain.Specification;

import javax.persistence.criteria.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-06-09 11:16
 * @description
 */
public class TendencyCheckUserDetailSpecificationUtil {

    public static Specification<TendencyCheckUserDetail> build(CheckQueryDetailDto dto, AssetsCheckResultType type) {
        return (Root<TendencyCheckUserDetail> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            if (dto.getStartTime() != null && dto.getEndTime() != null) {
                predicates.add(cb.between(
                        root.get("batchDate"),
                        dto.getStartTime(),
                        dto.getEndTime()
                ));
            }

//            if (dto.getBuName() != null && !dto.getBuName().isEmpty()) {
//                predicates.add(root.get("buName").in(dto.getBuName()));
//            }

            if (dto.getUsername() != null && !dto.getUsername().isEmpty()) {
                predicates.add(root.get("username").in(dto.getUsername()));
            }

            if (type != null) {
                predicates.add(cb.equal(root.get("resultType"), type));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }


    public static BuAcRateDetailDto toDto(TendencyCheckUserDetail entity) {
        BuAcRateDetailDto dto = new BuAcRateDetailDto();
        dto.setUsername(entity.getUsername());
    //    dto.setCnUsername(entity.getCnUsername());
        dto.setCnCommentRate(entity.getCnCommentRate());
        dto.setSecurityLevelRate(entity.getSecurityLevelRate());
        dto.setBizDescRate(entity.getBizDescRate());
        dto.setUsageDescRate(entity.getUsageDescRate());
        dto.setTypeMatchRate(entity.getTypeMatchRate());
        dto.setTableDescComplianceRate(entity.getTableDescComplianceRate());
        dto.setBatchDate(entity.getBatchDate());
        return dto;
    }

//    public static BuAcRateDetailDto toBuDto(TendencyCheckResult entity) {
//        BuAcRateDetailDto dto = new BuAcRateDetailDto();
//        dto.setUsername(entity.getUsername());
//        //    dto.setCnUsername(entity.getCnUsername());
//        dto.setCnCommentRate(entity.getCnCommentRate());
//        dto.setSecurityLevelRate(entity.getSecurityLevelRate());
//        dto.setBizDescRate(entity.getBizDescRate());
//        dto.setUsageDescRate(entity.getUsageDescRate());
//        dto.setTypeMatchRate(entity.getTypeMatchRate());
//        dto.setTableDescComplianceRate(entity.getTableDescComplianceRate());
//        dto.setBatchDate(entity.getBatchDate());
//        return dto;
//    }





    public static Specification<TendencyCheckUserDetail> buildBu(CheckQueryDetailDto dto, AssetsCheckResultType type) {
        return (Root<TendencyCheckUserDetail> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            if (dto.getStartTime() != null && dto.getEndTime() != null) {
                predicates.add(cb.between(
                        root.get("batchDate"),
                        dto.getStartTime(),
                        dto.getEndTime()
                ));
            }
//
            if (dto.getBuName() != null && !dto.getBuName().isEmpty()) {
                predicates.add(root.get("username").in(dto.getBuName()));
            }

//            if (dto.getUsername() != null && !dto.getUsername().isEmpty()) {
//                predicates.add(root.get("username").in(dto.getUsername()));
//            }

            if (type != null) {
                predicates.add(cb.equal(root.get("resultType"), type));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
