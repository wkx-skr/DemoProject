package com.datablau.data.asset.enums;

public enum MappingCatalogTypeEnum {

    MANUAL_MAPPING("手动映射"),
    AUTOMATIC_MAPPING("自动映射"),
    CANCEL__MAPPING("取消映射")
    ;

    private String desc;

    public String getDesc() {
        return desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }

    MappingCatalogTypeEnum(String desc) {
        this.desc = desc;
    }
}
