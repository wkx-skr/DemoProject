package com.datablau.domain.management.utils;

import com.andorj.model.common.api.MessageService;
import com.datablau.domain.management.data.DomainState;

public final class StandardUtils {
    public static DomainState convertStateEnum(String stateStr, MessageService msgService) {
        if(msgService.getMessage("DomainState.A").equals(stateStr)) {
            return DomainState.A;
        } else if (msgService.getMessage("DomainState.X").equals(stateStr)) {
            return DomainState.X;
        } else if (msgService.getMessage("DomainState.D").equals(stateStr)) {
            return DomainState.D;
        } else if (msgService.getMessage("DomainState.C").equals(stateStr)) {
            return DomainState.C;
        }
        return null;
    }
    public static String convertStateStr(DomainState state, MessageService msgService) {
        String stateStr = "";
        switch (state) {
            case A:
                stateStr = msgService.getMessage("DomainState.A");
                break;
            case D:
                stateStr = msgService.getMessage("DomainState.D");
                break;
            case C:
                stateStr = msgService.getMessage("DomainState.C");
                break;
            case X:
                stateStr = msgService.getMessage("DomainState.X");
                break;
        }
        return stateStr;
    }
}
