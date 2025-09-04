package com.datablau.domain.management.dto;

import java.util.Map;

/**
 * @author Syf - 数语科技有限公司
 * @date 2024/12/11
 */
public class BusinessTermChartDto {
    private Map<String, Long> countMap;

    public Map<String, Long> getCountMap() {
        return countMap;
    }

    public void setCountMap(Map<String, Long> countMap) {
        this.countMap = countMap;
    }
}
