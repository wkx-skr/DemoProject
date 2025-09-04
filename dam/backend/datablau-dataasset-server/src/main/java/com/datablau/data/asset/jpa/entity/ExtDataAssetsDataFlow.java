package com.datablau.data.asset.jpa.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.IdClass;
import javax.persistence.Table;
import java.io.Serializable;

@Entity
@Table(name = "ext_ddc_assets_dataflow")
@IdClass(ExtDataAssetsDataFlowId.class)
public class ExtDataAssetsDataFlow implements Serializable {

  @Id
  @Column(name = "l4_code")
  private String l4Code;

  @Id
  @Column(name = "model_category_id")
  private Long modelCategoryId;

  @Column(name = "distribution_source")
  private Boolean distributionSource;

  @Column(name = "l3_code")
  private String l3Code;

  /*
   * 使用二进制位掩码表示数据权限：
   * 每个权限对应一个二进制位，具体规则如下：
   * C（创建）: 8 (1000)
   * R（读取）: 4 (0100)
   * U（更新）: 2 (0010)
   * D（删除）: 1 (0001)
   *
   * 示例：
   * - "CD" 权限：1001 (9)
   * - "U"  权限：0010 (2)
   */
  @Column(name = "dataflow_permissions")
  private Integer dataFlowPermissions;

  public String getL3Code() {
    return l3Code;
  }

  public void setL3Code(String l3Code) {
    this.l3Code = l3Code;
  }

  public String getL4Code() {
    return l4Code;
  }

  public void setL4Code(String l4Code) {
    this.l4Code = l4Code;
  }

  public Integer getDataFlowPermissions() {
    return dataFlowPermissions;
  }

  public void setDataFlowPermissions(Integer dataFlowPermissions) {
    this.dataFlowPermissions = dataFlowPermissions;
  }

  public Long getModelCategoryId() {
    return modelCategoryId;
  }

  public void setModelCategoryId(Long modelCategoryId) {
    this.modelCategoryId = modelCategoryId;
  }

  public Boolean getDistributionSource() {
    return distributionSource;
  }

  /**
   * 辅助方法：用于业务逻辑判断
   * @return 如果为null则返回false，否则返回实际值
   */
  public boolean isDistributionSource() {
    return distributionSource != null && distributionSource;
  }

  public void setDistributionSource(Boolean distributionSource) {
    this.distributionSource = distributionSource;
  }
}
