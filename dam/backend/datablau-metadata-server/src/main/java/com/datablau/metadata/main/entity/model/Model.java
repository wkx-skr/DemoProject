/**
 * Copyright (c) 2017, Datablau. All rights reserved.
 */
package com.datablau.metadata.main.entity.model;

import com.andorj.common.core.annotation.Comment;
import com.andorj.common.core.exception.UnexpectedSystemException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.data.common.jpa.util.JpaSetLongConverter;
import com.datablau.data.common.util.IEntityDtoTransform;
import com.datablau.datasource.data.DataConnect;
import com.datablau.graph.data.annotation.GraphObject;
import com.datablau.graph.data.annotation.GraphObjectEndpoint;
import com.datablau.graph.data.annotation.GraphObjectProperty;
import com.datablau.graph.data.data.GraphRelationShipType;
import com.datablau.graph.data.util.EntityPersistForGraphListener;
import com.datablau.metadata.common.dto.model.ModelDto;
import com.datablau.metadata.main.entity.metadata.DataObject;
import com.datablau.metadata.main.listener.EntityPersistEventListener;
import com.datablau.metadata.main.util.listener.EntityPersistForBaseListener;
import com.datablau.reverse.engineering.worker.nonjdbc.ReverseForwardStrategyLogicalDataDictionary;
import com.datablau.udp.service.api.MetadataUserDefinedPropertyService;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Strings;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.hibernate.annotations.Type;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.Table;
import javax.persistence.Transient;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Set;

/**
 * @author baobao
 */
@Entity
@Table(name = "dam_model")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE, region = "dam_model")
@GraphObject(typeId = LDMTypes.oMetadataObject, idMethod = "getStringModelIdForGraph", nameMethod = "getDefinition", descriptionMethod = "getDescription")
@EntityListeners({EntityPersistForGraphListener.class, EntityPersistForBaseListener.class, EntityPersistEventListener.class})
public class Model implements IEntityDtoTransform<Model, ModelDto> {
    @Id
    @Column(name = "model_id")
    @Comment("模型ID")
    private Long modelId;

    @Column(name = "datasource_id")
    @Comment("base里面数据源的id")
    private Long datasourceId;

    @Column(name = "logical_model")
    @Comment("逻辑数据源")
    private Boolean logicalModel;

    @Column(name = "parent_id")
    @Comment("父模型ID")
    private Long parentId;

    @Column(name = "category_id")
    @Comment("系统ID")
    @GraphObjectEndpoint(endpointTypeId = LDMTypes.oSystem, relationShip = GraphRelationShipType.OWNS, methodToGetEndpointId = "getCategoryId", isEndpointSrc = true, description = "系统拥有该数据源", isPath = true)
    private Long categoryId;

    @Column(name = "definition")
    @Comment("名称")
    private String definition;

    @Column(name = "state_code")
    @Comment("状态码, 对应STATE_SCAN_DOMAIN和STATE_SCAN_TERM")
    private Long stateCode;

    @Column(name = "type")
    @Comment("数据源类型")
    private String type;

    @Column(name = "select_schema")
    @Comment("schema")
    private String schema;

    @Column(name = "select_database")
    @Comment("database")
    private String database;

    @Column(name = "owner")
    @Comment("owner")
    private String owner;

    @Column(name = "is_jdbc")
    @Comment("是否是jdbc数据源")
    private Boolean jdbcModel;

    @Column(name = "tag_ids")
    @Comment("tag_ids")
    @Convert(converter = JpaSetLongConverter.class)
    private Set<Long> tagIds;

    //@Column(name = "ddm_model_id")
    @Comment("在DDM和DAM联通的情况下，可以绑定当前数据源到一个DDM模型上")
    @Transient
    private Long ddmModelId;

    @Column(name = "backup_datasource_id")
    @Comment("备用数据源")
    private Long backupDatasourceId;

    @Column(name = "data_connect")
    @Comment("数据连接性")
    @Enumerated(EnumType.STRING)
    private DataConnect dataConnect = DataConnect.SELF;

    @Column(name = "data_sample")
    @Comment("是否可以采样")
    private Boolean dataSample;

    @Column(name = "not_load")
    @Comment("是否已经抽取了元数据")
    private Boolean notLoaded;

    @Column(name = "driver_id")
    @Comment("驱动id")
    private Long driverId;

    @Column(name = "creation_time", nullable = false)
    @Comment("创建的时间戳")
    private Date creationTime;

    @Column(name = "reverse_options", nullable = false)
    @Comment("options配置")
    @Lob
    @Type(type = "com.andorj.model.common.utility.postgres.PostgresTextType")
    private String reverseOptions;

//    @OneToMany(cascade = CascadeType.REFRESH, fetch = FetchType.LAZY)
//    @JoinColumn(name = "model_id", foreignKey = @ForeignKey(name = "null",value = ConstraintMode.NO_CONSTRAINT))
//    @OrderBy("id asc")
    @Transient
    private List<DataObject> objs;


    @Column(name = "create_user")
    @Comment("创建人")
    @GraphObjectProperty(propertyName = "typeId", methodToGetStringValue = "getTypeIdForGraph")
    private String createUser;

    @Column(name = "udp_group_id")
    @Comment("扩展属性分组id")
    private Long udpGroupId = 0L;

    @Column(name = "metamodel_code")
    @Comment("对应元模型的MetaModel.Code")
    private String metaModelCode;

    @Transient
    public Long getTypeId() {
        return LDMTypes.oModelSource;
    }

    public static final long STATE_SCAN_DOMAIN = 0x1;
    public static final long STATE_SCAN_TERM = 0x2;

    public Model() {
        this.creationTime = new Date();
        this.logicalModel = false;
    }

    public Model(Long modelId, Long parentId, String name, String type) {
        this();
        this.setModelId(modelId);
        this.setParentId(parentId);
        this.setDefinition(name);
        this.setType(type);
    }

    @JsonIgnore
    public String getStringModelId() {
        return modelId == null ? null : modelId.toString();
    }

    @JsonIgnore
    public String getStringModelIdForGraph() {
        // 逻辑数据源不进入知识图谱
        if (logicalModel) {
            return null;
        }
        return modelId == null ? null : modelId.toString();
    }


    public Long getModelId() {
        return modelId;
    }

    public void setModelId(Long dcId) {
        this.modelId = dcId;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public String getDefinition() {
        return definition;
    }

    public void setDefinition(String definition) {
        this.definition = definition;
    }

    public Long getStateCode() {
        return stateCode;
    }

    public void setStateCode(Long stateCode) {
        this.stateCode = stateCode;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
        if (ReverseForwardStrategyLogicalDataDictionary.LOGICAL_MODEL_TYPE.equals(this.type)) {
            this.setUdpGroupId(MetadataUserDefinedPropertyService.TEMP_LOGICAL_GROUP_ID);
        }
    }

    @JsonIgnore
    public String getStringDatasourceType() {
        return type.toString();
    }

    public Date getCreationTime() {
        return creationTime;
    }

    public void setCreationTime(Date creationTime) {
        this.creationTime = creationTime;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Long getDdmModelId() {
        return ddmModelId;
    }

    public Long getDatasourceId() {
        return datasourceId;
    }

    public void setDatasourceId(Long datasourceId) {
        this.datasourceId = datasourceId;
    }

    public String getDatabase() {
        return database;
    }

    public void setDatabase(String database) {
        this.database = database;
    }

    public Boolean getJdbcModel() {
        return jdbcModel;
    }

    public void setJdbcModel(Boolean jdbcModel) {
        this.jdbcModel = jdbcModel;
    }

    public String getReverseOptions() {
        return reverseOptions;
    }

    public void setReverseOptions(String reverseOptions) {
        this.reverseOptions = reverseOptions;
    }

    @JsonIgnore
    @Transient
    public Long getClickCount() {
        return 0L;
    }

    /**
     * Use modelMapping instead
     *
     * @param ddmModelId
     */
    @Deprecated
    public void setDdmModelId(Long ddmModelId) {
        this.ddmModelId = ddmModelId;
    }

    @JsonIgnore
    public String getDescription() {
        return "";
    }

    public Long getDriverId() {
        return driverId;
    }

    public void setDriverId(Long driverId) {
        this.driverId = driverId;
    }

    public Boolean getNotLoaded() {
        return notLoaded != null && notLoaded;
    }

    public void setNotLoaded(Boolean notLoaded) {
        this.notLoaded = notLoaded;
    }

    public String getSchema() {
        return schema;
    }

    public void setSchema(String schema) {
        this.schema = schema;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public Set<Long> getTagIds() {
        return tagIds;
    }

    public void setTagIds(Set<Long> tagIds) {
        this.tagIds = tagIds;
    }

    public Long getBackupDatasourceId() {
        return backupDatasourceId;
    }

    public void setBackupDatasourceId(Long backupDatasourceId) {
        this.backupDatasourceId = backupDatasourceId;
    }

    public DataConnect getDataConnect() {
        return dataConnect;
    }

    public void setDataConnect(DataConnect dataConnect) {
        this.dataConnect = dataConnect;
    }

    public Boolean getDataSample() {
        return dataSample;
    }

    public void setDataSample(Boolean dataSample) {
        this.dataSample = dataSample;
    }

    public Boolean getLogicalModel() {
        return logicalModel;
    }

    public void setLogicalModel(Boolean logicalModel) {
        this.logicalModel = logicalModel;
    }

    public String getCreateUser() {
        return createUser;
    }

    public void setCreateUser(String createUser) {
        this.createUser = createUser;
    }

    @JsonIgnore
    public String getTypeIdForGraph() {
        return String.valueOf(LDMTypes.oModelSource);
    }

    public Long getUdpGroupId() {
        return udpGroupId;
    }

    public void setUdpGroupId(Long udpGroupId) {
        this.udpGroupId = udpGroupId;
    }

    @Override
    public Model fromDto(ModelDto source) {
        Model target = new Model();

        target.setModelId(source.getModelId());
        target.setCategoryId(source.getCategoryId());
        target.setCreationTime(source.getCreationTime());
        target.setDefinition(source.getDefinition());
        target.setDriverId(source.getDriverId());
        target.setNotLoaded(source.getNotLoaded());
        target.setParentId(source.getParentId());
        target.setType(source.getType());
        target.setSchema(source.getSchema());
        target.setOwner(source.getOwner());
        target.setTagIds(source.getTagIds());
        target.setJdbcModel(source.getJdbcModel());
        target.setBackupDatasourceId(source.getBackupDatasourceId());
        target.setDataConnect(source.getDataConnect());
        target.setDataSample(source.getDataSample());
        target.setLogicalModel(source.getLogicalModel());
        target.setCreateUser(source.getCreateUser());
        target.setUdpGroupId(source.getUdpGroupId());
        target.setMetaModelCode(source.getMetaModelCode());

        return target;
    }

    @Override
    public ModelDto toDto() {
        ModelDto target = new ModelDto();

        Model source = this;

        target.setModelId(source.getModelId());
        target.setCategoryId(source.getCategoryId());
        target.setCreationTime(source.getCreationTime());
        target.setDefinition(source.getDefinition());
        target.setDriverId(source.getDriverId());
        target.setNotLoaded(source.getNotLoaded());
        target.setParentId(source.getParentId());
        target.setType(source.getType());
        target.setSchema(source.getSchema());
        target.setOwner(source.getOwner());
        target.setTagIds(source.getTagIds());
        target.setJdbcModel(source.getJdbcModel());
        target.setDatasourceId(source.getDatasourceId());
        target.setDataConnect(source.getDataConnect());
        target.setBackupDatasourceId(source.getBackupDatasourceId());
        target.setDataSample(source.getDataSample());
        target.setLogicalModel(source.getLogicalModel());
        target.setCreateUser(source.getCreateUser());
        target.setDatabase(source.getDatabase());
        target.setUdpGroupId(source.getUdpGroupId());
        target.setMetaModelCode(source.getMetaModelCode());

        TypeReference<HashMap<String,Object>> typeRef
                = new TypeReference<HashMap<String,Object>>() {};
        try {
            if (!Strings.isNullOrEmpty(source.getReverseOptions())) {
                target.setReverseOptions(new ObjectMapper().readValue(source.getReverseOptions(), typeRef));
            }
        } catch (JsonProcessingException e) {
            throw new UnexpectedSystemException(GeneralUtility.getMessageService().getMessage("parseJsonFailed", e.getMessage()), e);
        }

        return target;
    }

    public String getMetaModelCode() {
        return metaModelCode;
    }

    public void setMetaModelCode(String metaModelCode) {
        this.metaModelCode = metaModelCode;
    }
}
