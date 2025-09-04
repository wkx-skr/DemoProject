package com.datablau.domain.management.constants;

public enum DomainCheckState {
    UNPASS,
    PASS,
    UNCHECK,
    SKIP,
    ;

    public static boolean uncheckOrUnpassOrNull(DomainCheckState checkState) {

        return checkState == null || checkState == UNCHECK || checkState == UNPASS;
    }
}
