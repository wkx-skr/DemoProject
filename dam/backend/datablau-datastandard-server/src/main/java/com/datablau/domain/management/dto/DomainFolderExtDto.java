//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//

package com.datablau.domain.management.dto;

import com.andorj.common.core.annotation.Comment;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import io.swagger.v3.oas.annotations.media.Schema;

import java.io.Serializable;

@JsonInclude(Include.NON_NULL)
@Schema(
        title = "标准目录Ext传输层",
        description = "标准目录Ext传输层"
)
public class DomainFolderExtDto extends DomainFolderDto {

    @Schema(
            title = "业务域编码",
            description = "业务域编码"
    )
    private String bizCode;

    public String getBizCode() {
        return bizCode;
    }

    public void setBizCode(String bizCode) {
        this.bizCode = bizCode;
    }

}
