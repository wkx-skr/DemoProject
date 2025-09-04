package com.datablau.data.asset.dto;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;
import java.util.Map;

public class ExtDataAssetsDashboardDto implements Serializable {

  @Serial
  private static final long serialVersionUID = 1999806708895468016L;

  private Map<String, Integer> count;

  private Map<String, Integer> registrationPct;

  private Map<String, Integer> compliancePct;

  private Map<String, Integer> conversionFunnel;

  private List<ExtDataAssetsDashboardCoverageDto> coverageList;

  public Map<String, Integer> getCompliancePct() {
    return compliancePct;
  }

  public void setCompliancePct(Map<String, Integer> compliancePct) {
    this.compliancePct = compliancePct;
  }

  public Map<String, Integer> getConversionFunnel() {
    return conversionFunnel;
  }

  public void setConversionFunnel(Map<String, Integer> conversionFunnel) {
    this.conversionFunnel = conversionFunnel;
  }

  public Map<String, Integer> getCount() {
    return count;
  }

  public void setCount(Map<String, Integer> count) {
    this.count = count;
  }

  public List<ExtDataAssetsDashboardCoverageDto> getCoverageList() {
    return coverageList;
  }

  public void setCoverageList(List<ExtDataAssetsDashboardCoverageDto> coverageList) {
    this.coverageList = coverageList;
  }

  public Map<String, Integer> getRegistrationPct() {
    return registrationPct;
  }

  public void setRegistrationPct(Map<String, Integer> registrationPct) {
    this.registrationPct = registrationPct;
  }
}
