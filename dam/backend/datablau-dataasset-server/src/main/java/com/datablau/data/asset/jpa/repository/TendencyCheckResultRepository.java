package com.datablau.data.asset.jpa.repository;

import com.datablau.data.asset.dto.AssetsDetailResultDto;
import com.datablau.data.asset.enums.AssetsCheckResultType;
import com.datablau.data.asset.jpa.entity.TendencyCheckResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-05-21 13:12
 * @description
 */
@Repository
public interface TendencyCheckResultRepository extends JpaSpecificationExecutor<TendencyCheckResult> , JpaRepository<TendencyCheckResult,Long> {


    List<TendencyCheckResult> findByBatchDate(String batchDate);

    List<TendencyCheckResult> findByResultType(AssetsCheckResultType resultType);

    List<TendencyCheckResult> findByBatchDateIn(Collection<String> batchDates);

    List<TendencyCheckResult> findByBuNameIn(Collection<String> buNames);

    List<TendencyCheckResult> findByBatchDateInAndBuNameInAndResultType(Collection<String> batchDates, Collection<String> buNames, AssetsCheckResultType resultType);

    List<TendencyCheckResult> findByBatchDateInAndResultType(Collection<String> batchDates, AssetsCheckResultType resultType);

    List<TendencyCheckResult> findByBuNameInAndResultType(Collection<String> buNames, AssetsCheckResultType resultType);


    // NONE_TYPE 查询
    List<TendencyCheckResult> findByResultTypeAndBatchDateBetween(
            AssetsCheckResultType resultType, String start, String end
    );

    @Query("SELECT new com.datablau.data.asset.dto.AssetsDetailResultDto(" +
            "SUBSTRING(t.batchDate, 1, 6), " +
            "AVG(t.dataIntegrityRate), " +
            "AVG(t.accuracyRate), " +
            "AVG(t.validityRate)) " +
            "FROM TendencyCheckResult t " +
            "WHERE t.resultType = 'BU_TYPE' AND t.buName IN :buNames AND t.batchDate BETWEEN :start AND :end " +
            "GROUP BY SUBSTRING(t.batchDate, 1, 6) " +
            "ORDER BY SUBSTRING(t.batchDate, 1, 6)")
    List<AssetsDetailResultDto> avgByMonthForBuType(@Param("buNames") List<String> buNames,
                                                    @Param("start") String start,
                                                    @Param("end") String end);


    @Query("SELECT new com.datablau.data.asset.dto.AssetsDetailResultDto(" +
            "SUBSTRING(t.batchDate, 1, 6), " +
            "AVG(t.dataIntegrityRate), " +
            "AVG(t.accuracyRate), " +
            "AVG(t.validityRate)) " +
            "FROM TendencyCheckResult t " +
            "WHERE t.resultType = 'USER_TYPE' AND t.username IN :usernames AND t.batchDate BETWEEN :start AND :end " +
            "GROUP BY SUBSTRING(t.batchDate, 1, 6) " +
            "ORDER BY SUBSTRING(t.batchDate, 1, 6)")
    List<AssetsDetailResultDto> avgByMonthForUserType(@Param("usernames") List<String> usernames,
                                                      @Param("start") String start,
                                                      @Param("end") String end);






}
