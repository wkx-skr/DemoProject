package com.datablau.data.asset.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serial;
import java.io.Serializable;

public class ExtDataAssetsDashboardCoverageDto implements Serializable {

  @Serial
  private static final long serialVersionUID = 3762318281484770002L;

  @JsonProperty("Level1")
  private String Level1;

  private Integer count5InLevel1 = 0;

  private Integer reg5InLevel1 = 0;

  private Integer compliance5InLevel1 = 0;

  private Double compliance5RateInLevel1 = 0.0;

  public String getLevel1() {
    return Level1;
  }

  public void setLevel1(String level1) {
    Level1 = level1;
  }

  public Integer getCompliance5InLevel1() {
    return compliance5InLevel1;
  }

  public void setCompliance5InLevel1(Integer compliance5InLevel1) {
    this.compliance5InLevel1 = compliance5InLevel1;
  }

  public Double getCompliance5RateInLevel1() {
    return compliance5RateInLevel1;
  }

  public void setCompliance5RateInLevel1(Double compliance5RateInLevel1) {
    this.compliance5RateInLevel1 = compliance5RateInLevel1;
  }

  public Integer getCount5InLevel1() {
    return count5InLevel1;
  }

  public void setCount5InLevel1(Integer count5InLevel1) {
    this.count5InLevel1 = count5InLevel1;
  }

  public Integer getReg5InLevel1() {
    return reg5InLevel1;
  }

  public void setReg5InLevel1(Integer reg5InLevel1) {
    this.reg5InLevel1 = reg5InLevel1;
  }
}
