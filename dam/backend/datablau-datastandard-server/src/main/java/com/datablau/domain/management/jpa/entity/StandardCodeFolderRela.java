package com.datablau.domain.management.jpa.entity;


import com.andorj.common.core.annotation.Comment;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;

@Entity
@Table(
        name = "db_std_code_folder_rela",
        indexes = {
                @Index(
                        name = "idx_code_folder_rela_f_id",
                        columnList = "f_id"
                )
        }
)
public class StandardCodeFolderRela {
    @Id
    @Column(
            name = "code_id",
            nullable = false
    )
    @Comment("标准代码")
    private String code;

    @Column(
            name = "f_id",
            nullable = false
    )
    @Comment("关联目录的ID")
    private Long fId;

    public StandardCodeFolderRela() {
    }

    public StandardCodeFolderRela(String code, Long fId) {
        this.code = code;
        this.fId = fId;
    }

    public Long getfId() {
        return fId;
    }

    public void setfId(Long fId) {
        this.fId = fId;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
