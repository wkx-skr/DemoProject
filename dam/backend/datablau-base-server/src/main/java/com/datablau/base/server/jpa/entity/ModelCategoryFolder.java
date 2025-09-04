package com.datablau.base.server.jpa.entity;

import com.andorj.common.core.annotation.Comment;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.id.enhanced.SequenceStyleGenerator;

import javax.persistence.*;
import java.io.Serializable;

/**
 * @author zxy
 * @create 2025/4/7 上午10:21
 */
@Entity
@Table(name = "db_model_category_folder",
        indexes = {
                @Index(columnList = "name", name = "idx_folder_name")
        }
)
public class ModelCategoryFolder implements Serializable {

    @Id
    @GeneratedValue(generator = "model_category_folder_generator")
    @GenericGenerator(name = "model_category_folder_generator", strategy = "com.datablau.data.common.jpa.util.DatablauIdGenerator",
            parameters = {@org.hibernate.annotations.Parameter(name = SequenceStyleGenerator.SEQUENCE_PARAM, value = "MODEL_CATEGORY_FOLDER_SEQ"),
                    @org.hibernate.annotations.Parameter(name = SequenceStyleGenerator.INITIAL_PARAM, value = "100")})
    @Column(name = "id")
    @Comment("目录ID")
    private Long folderId;

    @Column(name = "p_id", nullable = false)
    @Comment("父目录的ID")
    private Long parentId;

    @Column(name = "name", nullable = false)
    @Comment("目录的名称")
    private String name;

    @Column(name = "folder_order")
    @Comment("排序")
    private Integer order;

    @Column(name = "folder_path")
    @Comment("排序")
    private String path;

    @Column(name = "category_id")
    @Comment("系统id")
    private Long categoryId;

    public ModelCategoryFolder() {
    }

    public ModelCategoryFolder(String name ,Long categoryId,Long parentId) {
        this.parentId = parentId;
        this.name = name;
        this.categoryId = categoryId;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public Long getFolderId() {
        return folderId;
    }

    public void setFolderId(Long folderId) {
        this.folderId = folderId;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getOrder() {
        return order;
    }

    public void setOrder(Integer order) {
        this.order = order;
    }

}
