package com.datablau.domain.management.jpa.entity;


import com.andorj.common.core.annotation.Comment;
import com.datablau.domain.management.dto.DomainSimilarityCheckResultDetailDto;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;

import javax.persistence.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(
        name = "db_domain_similarity_check_result",
        indexes = {
                @Index(
                        name = "idx_domain_similarity_check_result_timepstamp",
                        columnList = "timestamp"
                )
        }
)
public class DomainSimilarityCheckResult implements Serializable {
    private static final long serialVersionUID = -8992362702417415477L;
    @Id
    @GeneratedValue(
            generator = "domain_similarity_check_result_generator"
    )
    @GenericGenerator(
            name = "domain_similarity_check_result_generator",
            strategy = "com.datablau.data.common.jpa.util.DatablauIdGenerator",
            parameters = {@org.hibernate.annotations.Parameter(
                    name = "sequence_name",
                    value = "DOMAIN_SIMILARITY_CHECK_RESULT_SEQ"
            )}
    )
    @Column(
            name = "cluster_id"
    )
    @Comment("聚合ID")
    private Long clusterId;
    @Column(
            name = "cluster_cols"
    )
    @Lob
    @Type(
            type = "com.datablau.domain.management.utils.TypeListDomainSimilarityCheckConvert"
    )
    @Comment("聚合的列")
    private List<DomainSimilarityCheckResultDetailDto> columns;
    @Column(
            name = "timestamp"
    )
    @Temporal(TemporalType.TIMESTAMP)
    private Date timestamp;
    @Column(
            name = "total_counts"
    )
    @Comment("总记录数")
    private Long totalCounts;

    public Long getClusterId() {
        return clusterId;
    }

    public void setClusterId(Long clusterId) {
        this.clusterId = clusterId;
    }

    public List<DomainSimilarityCheckResultDetailDto> getColumns() {
        return columns;
    }

    public void setColumns(List<DomainSimilarityCheckResultDetailDto> columns) {
        this.columns = columns;
    }

    public Date getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Date timestamp) {
        this.timestamp = timestamp;
    }

    public Long getTotalCounts() {
        return totalCounts;
    }

    public void setTotalCounts(Long totalCounts) {
        this.totalCounts = totalCounts;
    }
}
