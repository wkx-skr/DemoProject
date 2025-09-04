package com.datablau.metadata.main.dao;

import com.datablau.metadata.main.entity.ETLSourceInfoBind;
import com.datablau.metadata.main.entity.SimilarityJobResult;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-07-16 15:58
 * @description
 */
@Repository
public interface SimilarityJobResultRepository  extends PagingAndSortingRepository<SimilarityJobResult, Long> {




}
