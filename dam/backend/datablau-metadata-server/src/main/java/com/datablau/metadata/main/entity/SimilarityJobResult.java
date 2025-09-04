package com.datablau.metadata.main.entity;

import com.andorj.common.core.annotation.Comment;
import com.datablau.metadata.main.dto.MetaDataSimilarityResultDto;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;
import org.hibernate.id.enhanced.SequenceStyleGenerator;

import javax.persistence.*;
import java.io.Serializable;
import java.util.List;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-07-16 15:50
 * @description
 */

@Entity
@Table(name = "dam_metadata_similarity")
public class SimilarityJobResult implements Serializable {

    @Id
    @GeneratedValue(generator = "metadata_similarity_generator")
    @GenericGenerator(name = "metadata_similarity_generator", strategy = "com.datablau.data.common.jpa.util.DatablauIdGenerator",
            parameters = {@org.hibernate.annotations.Parameter(name = SequenceStyleGenerator.SEQUENCE_PARAM, value = "METADATA_SIMILARITY_SEQ"),
                    @org.hibernate.annotations.Parameter(name = SequenceStyleGenerator.INITIAL_PARAM, value = "100")})
    @Column(name = "id")
    @Comment("ID")
    private Long id;

    @Lob
    @Type(
            type = "com.datablau.metadata.main.util.TypeListMetadataSimilarityCheckConvert"
    )
    @Comment("聚合的列")
    private List<MetaDataSimilarityResultDto> columns;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<MetaDataSimilarityResultDto> getColumns() {
        return columns;
    }

    public void setColumns(List<MetaDataSimilarityResultDto> columns) {
        this.columns = columns;
    }
}
