package com.datablau.data.asset.jpa.entity;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.io.Serializable;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-05-26 10:25
 * @description。元数据质量任务 负责人表 用于下拉展示  和业务域一样，不用前端去调用用户的接口，直接调用这个接口就够了
 */

@Entity
@Table(
        name = "dam_asset_tendency_check_user"
)
public class CheckUserName implements Serializable {


    @Id
    @Column(name = "id")
    @GeneratedValue(
            generator = "dam_asset_tendency_check_user"
    )
    @GenericGenerator(
            name = "dam_asset_tendency_check_user",
            strategy = "com.datablau.data.common.jpa.util.DatablauIdGenerator",
            parameters = {@org.hibernate.annotations.Parameter(
                    name = "sequence_name",
                    value = "tendency_check_user_seq"
            )}
    )
    private Long id;

    // 业务负责人名称，也就是user表里面的username
    @Column(name = "username", length = 100)
    private String username;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
