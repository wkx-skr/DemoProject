package com.datablau.domain.management.dto;


import com.datablau.domain.management.data.DomainState;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
        title = "数据标准查询对象Ext",
        description = "数据标准查询对象Ext"
)
public class DomainQueryExtDto extends DomainQueryDto {

    @Schema(
            title = "数据标准状态不等于",
            description = "数据标准状态不等于"
    )
    private DomainState notEqState;

    public DomainState getNotEqState() {
        return notEqState;
    }

    public void setNotEqState(DomainState notEqState) {
        this.notEqState = notEqState;
    }
}
