package com.datablau.data.asset.jpa.entity;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.io.Serializable;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-06-16 13:32
 * @description  元数据质量任务运行完之后需要处理的数据
 */

@Entity
@Table(
        name = "dam_asset_tendency_check_handler_result"
)
public class CheckResultHandlerResult implements Serializable {

    @Id
    @Column(name = "id")
//    @GeneratedValue(
//            generator = "dam_asset_tendency_check_handler_result"
//    )
//    @GenericGenerator(
//            name = "dam_asset_tendency_check_handler_result",
//            strategy = "com.datablau.data.common.jpa.util.DatablauIdGenerator",
//            parameters = {@org.hibernate.annotations.Parameter(
//                    name = "sequence_name",
//                    value = "tendency_check_handler_result_seq"
//            )}
//    )
    private String id;

    // 资产的id
    @Column(name = "asset_object_id")
    private Long  objectId;

    // 资产的类型 8000004 8000005 表和字段 就这两种
    @Column(name = "asset_type_id")
    private Long typeId;
    //   业务名称
    @Column(name = "asset_bu_name")
    private String buName;
    // 负责人名称
    @Column(name = "asset_username")
    private String userName;
    //   资产中文名
    @Column(name = "asset_cn_name")
    private String cnName;
    // 资产英文名
    @Column(name = "asset_en_name")
    private String enName;

    //      会有一个表存储这个最新字段的值 uuid 批次值
    @Column(name = "asset_batch_nu")
    private String batchNu;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Long getObjectId() {
        return objectId;
    }

    public void setObjectId(Long objectId) {
        this.objectId = objectId;
    }

    public Long getTypeId() {
        return typeId;
    }

    public void setTypeId(Long typeId) {
        this.typeId = typeId;
    }

    public String getBuName() {
        return buName;
    }

    public void setBuName(String buName) {
        this.buName = buName;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getCnName() {
        return cnName;
    }

    public void setCnName(String cnName) {
        this.cnName = cnName;
    }

    public String getEnName() {
        return enName;
    }

    public void setEnName(String enName) {
        this.enName = enName;
    }

    public String getBatchNu() {
        return batchNu;
    }

    public void setBatchNu(String batchNu) {
        this.batchNu = batchNu;
    }
}
