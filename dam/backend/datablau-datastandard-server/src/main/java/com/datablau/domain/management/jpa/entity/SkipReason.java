package com.datablau.domain.management.jpa.entity;

import com.andorj.common.core.annotation.Comment;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Parameter;
import org.hibernate.id.enhanced.SequenceStyleGenerator;

import javax.persistence.*;
import java.io.Serializable;


@Entity
@Table(name = "db_skip_reason")
public class SkipReason implements Serializable {

    @Id
    @GeneratedValue(generator = "skip_reason_generator")
    @GenericGenerator(name = "skip_reason_generator", strategy = "com.datablau.data.common.jpa.util.DatablauIdGenerator",
            parameters = {@Parameter(name = SequenceStyleGenerator.SEQUENCE_PARAM, value = "SKIP_REASON_SEQ"),
                    @Parameter(name = SequenceStyleGenerator.INITIAL_PARAM, value = "100")})
    @Column(name = "id")
    @Comment("ID")
    private Long id;

    @Column(name = "reason")
    @Comment("跳过原因")
    private String reason;
    //跳过标准id
    @Column(name = "domain_id")
    @Comment("跳过标准id")
    private String domainId;
    //跳过标准名称
    @Column(name = "domain_name")
    @Comment("跳过标准名称")
    private String domainName;
    //其他相似标准名称
    @Column(name = "another_domain_names")
    @Comment("其他相似标准名称")
    private String anotherDomainNames;
    //其他相似标准id
    @Column(name = "another_domainIds")
    @Comment("其他相似标准id")
    private String anotherDomainIds;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDomainId() {
        return domainId;
    }

    public void setDomainId(String domainId) {
        this.domainId = domainId;
    }

    public String getDomainName() {
        return domainName;
    }

    public void setDomainName(String domainName) {
        this.domainName = domainName;
    }

    public String getAnotherDomainNames() {
        return anotherDomainNames;
    }

    public void setAnotherDomainNames(String anotherDomainNames) {
        this.anotherDomainNames = anotherDomainNames;
    }

    public String getAnotherDomainIds() {
        return anotherDomainIds;
    }

    public void setAnotherDomainIds(String anotherDomainIds) {
        this.anotherDomainIds = anotherDomainIds;
    }
}
