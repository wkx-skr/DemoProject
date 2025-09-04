//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//

package com.datablau.domain.management.jpa.type;

public enum DatablauDomainType {
    BASIC_CODE(1L),
    STANDARD_CODE(8L),
    DOMAIN_STANDARD(4L),
    NORM_SYS(2L),
    BUSINESS_TERM(9l);

    private Long categoryId;

    private DatablauDomainType(Long categoryId) {
        this.categoryId = categoryId;
    }

    public static DatablauDomainType formByCategoryId(Long categoryId) {
        DatablauDomainType[] var1 = values();
        int var2 = var1.length;

        for(int var3 = 0; var3 < var2; ++var3) {
            DatablauDomainType domainType = var1[var3];
            if (domainType.categoryId == categoryId) {
                return domainType;
            }
        }

        return null;
    }
}
