package com.datablau.domain.management.dto;

import java.io.Serializable;

public class StatisticsDtoExt extends StatisticsDto implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * 已发布业务术语
     */
    private Long publishedBusinessTerm;

    /**
     * 待审核业务术语
     */
    private Long developingBusinessTerm;

    public Long getPublishedBusinessTerm() {
        return publishedBusinessTerm;
    }

    public void setPublishedBusinessTerm(Long publishedBusinessTerm) {
        this.publishedBusinessTerm = publishedBusinessTerm;
    }

    public Long getDevelopingBusinessTerm() {
        return developingBusinessTerm;
    }

    public void setDevelopingBusinessTerm(Long developingBusinessTerm) {
        this.developingBusinessTerm = developingBusinessTerm;
    }
}
