package com.datablau.metadata.main.entity;

import com.andorj.common.core.annotation.Comment;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Parameter;
import org.hibernate.id.enhanced.SequenceStyleGenerator;

import javax.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "etl_source_info_bind")
public class ETLSourceInfoBind implements Serializable {

    @Id
    @GeneratedValue(generator = "etl_source_generator")
    @GenericGenerator(name = "etl_source_generator", strategy = "com.datablau.data.common.jpa.util.DatablauIdGenerator",
            parameters = {@Parameter(name = SequenceStyleGenerator.SEQUENCE_PARAM, value = "ETL_SOURCE_SEQ"),
                    @Parameter(name = SequenceStyleGenerator.INITIAL_PARAM, value = "100")})
    @Column(name = "id")
    @Comment("ID")
    private Long id;

    @Column(name = "etl_objectId")
    @Comment("来源ETL对象ID")
    private Long etlObjectId;

    @Column(name = "etl_name")
    @Comment("来源ETL名称")
    private String etlName;

    @Column(name = "src_objectId")
    @Comment("上游对象ID")
    private Long srcObjectId;

    @Column(name = "target_objectId")
    @Comment("下游对象ID")
    private Long targetObjectId;

    public ETLSourceInfoBind() {
    }

    public ETLSourceInfoBind(Long etlObjectId, String etlName, Long srcObjectId, Long targetObjectId) {
        this.etlObjectId = etlObjectId;
        this.etlName = etlName;
        this.srcObjectId = srcObjectId;
        this.targetObjectId = targetObjectId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEtlObjectId() {
        return etlObjectId;
    }

    public void setEtlObjectId(Long etlObjectId) {
        this.etlObjectId = etlObjectId;
    }

    public String getEtlName() {
        return etlName;
    }

    public void setEtlName(String etlName) {
        this.etlName = etlName;
    }

    public Long getSrcObjectId() {
        return srcObjectId;
    }

    public void setSrcObjectId(Long srcObjectId) {
        this.srcObjectId = srcObjectId;
    }

    public Long getTargetObjectId() {
        return targetObjectId;
    }

    public void setTargetObjectId(Long targetObjectId) {
        this.targetObjectId = targetObjectId;
    }
}
