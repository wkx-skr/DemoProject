//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//

package com.datablau.domain.management.jpa.entity;

import com.andorj.common.core.annotation.Comment;
import com.datablau.domain.management.data.CategoryType;
import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.Lob;
import javax.persistence.Table;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Parameter;
import org.hibernate.annotations.Type;

@Entity
@Table(
        name = "db_domain_folder_ext",
        indexes = {
            @Index(
                name = "idx_domain_folder_ext_f_id",
                columnList = "f_id",
                unique = true
            ),
            @Index(
                name = "idx_domain_folder_ext_biz_code",
                columnList = "biz_code",
                unique = true
            )
        }
)
public class DomainFolderExt {
    @Id
    @GeneratedValue(
            generator = "folder_ext_generator"
    )
    @GenericGenerator(
            name = "folder_ext_generator",
            strategy = "com.datablau.data.common.jpa.util.DatablauIdGenerator",
            parameters = {@Parameter(
                    name = "sequence_name",
                    value = "FOLDER_EXT_SEQ"
            ), @Parameter(
                    name = "initial_value",
                    value = "1"
            )}
    )
    @Column(
            name = "id"
    )
    @Comment("ID")
    private Long id;
    @Column(
            name = "f_id",
            nullable = false
    )
    @Comment("关联目录的ID")
    private Long fId;
    @Column(
            name = "biz_code",
            nullable = false
    )
    @Comment("业务域编码")
    private String bizCode;

    public DomainFolderExt() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getfId() {
        return fId;
    }

    public void setfId(Long fId) {
        this.fId = fId;
    }

    public String getBizCode() {
        return bizCode;
    }

    public void setBizCode(String bizCode) {
        this.bizCode = bizCode;
    }
}
