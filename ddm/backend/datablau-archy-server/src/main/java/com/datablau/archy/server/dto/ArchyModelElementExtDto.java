package com.datablau.archy.server.dto;

import java.util.Date;

/**
 * @author: hxs
 * @date: 2025/5/13 18:08
 */
public class ArchyModelElementExtDto extends ArchyModelElementDto{
    private String operator;
    private Date operatorDate;

    public String getOperator() {
        return operator;
    }

    public void setOperator(String operator) {
        this.operator = operator;
    }

    public Date getOperatorDate() {
        return operatorDate;
    }

    public void setOperatorDate(Date operatorDate) {
        this.operatorDate = operatorDate;
    }
}
