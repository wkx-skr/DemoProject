package com.datablau.base.server.service.impl;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.data.PageResult;
import com.andorj.model.common.search.QueryParameterCriteria;
import com.andorj.model.common.utility.MultiConditionQueryUtils;
import com.datablau.base.data.BaseModelCategory;
import com.datablau.base.data.DatasourceEntityDto;
import com.datablau.base.mq.message.CreateDataSourceMsg;
import com.datablau.base.mq.message.DataSourceSchemaDto;
import com.datablau.base.server.impl.LocalDatasourceServiceImpl;
import com.datablau.base.server.jpa.entity.DatasourceEntity;
import com.datablau.base.server.jpa.repository.DatasourceRepositoryExt;
import com.datablau.base.server.service.DatasourceServiceExt;
import com.datablau.datasource.data.DatasourceProperties;
import com.datablau.project.util.DigestUtilsSm2;
import com.datablau.security.management.utils.AuthTools;
import com.google.common.collect.Lists;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Date;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.google.common.base.Strings;

/**
 * @author: hxs
 * @date: 2025/6/4 10:26
 */
@Service("datasourceServiceExt")
public class DatasourceServiceExtImpl extends LocalDatasourceServiceImpl implements DatasourceServiceExt {
    private static final Logger LOGGER = LoggerFactory.getLogger(DatasourceServiceExtImpl.class);

    @Autowired
    MultiConditionQueryUtils multiConditionQueryUtils;

    @Autowired
    private DatasourceRepositoryExt datasourceRepositoryExt;

    @Override
    public DatasourceEntityDto createDatasource(DatasourceProperties datasource) {
        LOGGER.info("走这了............................");
        //metaModelType元模型的类型
        List<String> metaModelType = Arrays.asList("METAMODELDEMO", "ETL", "TIMESERIES");
        datasource.setId((Long)null);
        this.checkDatasourceMandatoryProperties(datasource);
        if (this.datasourceRepositoryExt.findByNameConflicts(datasource.getSourceName().toLowerCase()) > 0) {
            throw new InvalidArgumentException("已经存在名称为 '" + datasource.getSourceName() + "' 的数据源了");
        } else {
            DatasourceEntity targetDatasource;
            if (datasource.getBackupDatasourceId() != null) {
                targetDatasource = this.datasourceRepositoryExt.findByIdEquals(datasource.getBackupDatasourceId());
                if (targetDatasource.getBackupDatasourceId() != null) {
                    throw new InvalidArgumentException("备用数据源'" + targetDatasource.getName() + "' 不可直连数据源, 请重新选择");
                }
            }

            this.fillUpJdbcDatasourceVersion(datasource);
            try {
                LOGGER.info("11111走这了............................");
                if(!metaModelType.contains(datasource.getType())){
                    if(!Strings.isNullOrEmpty(datasource.getCredentialInfo().getPassword())){
                        LOGGER.info("3333走这了............................");
                        datasource.getCredentialInfo().setPassword(DigestUtilsSm2.encryptSm2(datasource.getCredentialInfo().getPassword()));
                    }
                }
            } catch (Exception e) {
                LOGGER.info("222222走这了............................");
                throw new InvalidArgumentException("添加数据源'" + datasource.getSourceName() + "' 密码加密失败");
            }
            targetDatasource = new DatasourceEntity(datasource);
            targetDatasource.setOwner(datasource.getOwner() != null ? datasource.getOwner() : AuthTools.currentUsernameNullSafe());
            targetDatasource = (DatasourceEntity)this.datasourceRepositoryExt.save(targetDatasource);
            Logger var10000 = LOGGER;
            String var10001 = AuthTools.currentUsernameNullSafe();
            var10000.info(var10001 + " created datasource '" + targetDatasource.getName() + "'");
            new DatasourceEntityDto();
            DatasourceEntityDto res = targetDatasource.toDto();
            CreateDataSourceMsg msg = new CreateDataSourceMsg();
            msg.setDatasource(res);
            msg.setTopic(this.createDatasourceTopic);
            msg.setSendTime(new Date());
            this.kafkaService.sendMessage(this.createDatasourceTopic, msg);
            return res;
        }
    }

    @Override
    public DatasourceEntityDto updateDatasource(DatasourceProperties datasource) {
        Long datasourceId = datasource.getId();
        if (datasourceId == null) {
            throw new InvalidArgumentException("数据源ID不能为空");
        } else {
            this.checkDatasourceMandatoryProperties(datasource);
            DatasourceEntity savedDatasource = this.datasourceRepositoryExt.findByIdEquals(datasourceId);
            if (savedDatasource == null) {
                throw new InvalidArgumentException("找不到对应的数据源");
            } else if (!savedDatasource.getName().equalsIgnoreCase(datasource.getSourceName()) && this.datasourceRepositoryExt.findByNameConflicts(datasource.getSourceName()) > 0) {
                throw new InvalidArgumentException("已经存在名称为 '" + datasource.getSourceName() + "' 的数据源了");
            } else {
                DatasourceEntity ds;
                if (datasource.getBackupDatasourceId() != null) {
                    ds = this.datasourceRepositoryExt.findByIdEquals(datasource.getBackupDatasourceId());
                    if (ds.getBackupDatasourceId() != null) {
                        throw new InvalidArgumentException("备用数据源'" + ds.getName() + "' 不可直连数据源, 请重新选择");
                    }
                }

                if (datasource.getCredentialInfo() == null) {
                    datasource.setCredentialInfo(savedDatasource.getConnectionInfo().getCredentialInfo());
                }

                datasource.setId(savedDatasource.getId());
                datasource.setJdbc(savedDatasource.isJdbc());
                datasource.setOwner(savedDatasource.getOwner());
                this.fillUpJdbcDatasourceVersion(datasource);

                try {
                    if(!"METAMODELDEMO".equals(datasource.getType())){
                        if(!Strings.isNullOrEmpty(datasource.getCredentialInfo().getPassword())){
                            datasource.getCredentialInfo().setPassword(DigestUtilsSm2.encryptSm2(datasource.getCredentialInfo().getPassword()));
                        }
                    }
                } catch (Exception e) {
                    throw new InvalidArgumentException("更新数据源'" + datasource.getSourceName() + "' 密码加密失败");
                }

                ds = new DatasourceEntity(datasource);
                ds.setCreationTime(savedDatasource.getCreationTime());
                ds = (DatasourceEntity)this.datasourceRepositoryExt.save(ds);
                Logger var10000 = LOGGER;
                String var10001 = AuthTools.currentUsernameNullSafe();
                var10000.info(var10001 + " updated datasource '" + ds.getName() + "'");
                this.subscribeService.updateSubscribeByTypedObject(ds.getId().toString(), 80010001L, 0, ds.getName());
                String beforeSchema = savedDatasource.getConnectionInfo().getParameter("SelectedSchemas");
                String afterSchema = datasource.getParameter("SelectedSchemas");
                String beforeDataBase = savedDatasource.getConnectionInfo().getParameter("DatabaseName");
                String afterDataBase = datasource.getParameter("DatabaseName");
                DataSourceSchemaDto msg;
                if (StringUtils.isNotBlank(beforeSchema) && !beforeSchema.equals(afterSchema)) {
                    msg = new DataSourceSchemaDto(savedDatasource.getId(), Lists.newArrayList(afterSchema.split(";")));
                    if (StringUtils.isNotBlank(afterDataBase)) {
                        msg.setDatabases(Lists.newArrayList(afterDataBase.split(";")));
                    }

                    this.kafkaService.sendMessage(this.updateSchemaTopic, msg);
                }

                if (StringUtils.isNotBlank(beforeDataBase) && !beforeDataBase.equals(afterDataBase)) {
                    msg = new DataSourceSchemaDto();
                    msg.setDataSourceId(savedDatasource.getId());
                    msg.setDatabases(Lists.newArrayList(afterDataBase.split(";")));
                    if (StringUtils.isNotBlank(afterSchema)) {
                        msg.setSchemas(Lists.newArrayList(afterSchema.split(";")));
                    }

                    this.kafkaService.sendMessage(this.updateSchemaTopic, msg);
                }
                LOGGER.info("ext end updateDatasource.....");
                return ds.toDto();
            }
        }
    }

    @Override
    public List<DatasourceProperties> getDatasources(QueryParameterCriteria criteria) {
        LOGGER.info("ext start getDatasources.....");
        MultiConditionQueryUtils.MultiConditionQuery<DatasourceEntity> query = this.multiConditionQueryUtils.createQuery(DatasourceEntity.class);
        boolean pageQuery = this.datasourceQueryHelper.buildCriteria(criteria, query);
        List<DatasourceProperties> result = new LinkedList();
        List<BaseModelCategory> modelCategoryParamDtos = this.modelCategoryService.getAllBaseModelCategories();
        Map<Long, String> maps = (Map)modelCategoryParamDtos.stream().collect(Collectors.toMap(BaseModelCategory::getId, BaseModelCategory::getName));
        DatasourceProperties res = null;
        if (pageQuery) {
            PageResult<DatasourceEntity> pageResult = query.page();
            Iterator var9 = pageResult.getContent().iterator();

            while(var9.hasNext()) {
                DatasourceEntity datasource = (DatasourceEntity)var9.next();
                res = datasource.toDatasourceProperties();
                res.setCategoryName((String)maps.get(res.getCategoryId()));
                try {
                    if(!Strings.isNullOrEmpty(res.getCredentialInfo().getPassword())){
                        res.getCredentialInfo().setPassword(DigestUtilsSm2.decryptEncodedSm2(res.getCredentialInfo().getPassword()));
                    }
                } catch (Exception e) {
                    LOGGER.info("getDatasources var9 decryptEncodedSm2 fail ", e);
                }
                result.add(res);
            }
        } else {
            Iterator var11 = query.list().iterator();

            while(var11.hasNext()) {
                DatasourceEntity datasource = (DatasourceEntity)var11.next();
                res = datasource.toDatasourceProperties();
                res.setCategoryName((String)maps.get(res.getCategoryId()));
                try {
                    if(!Strings.isNullOrEmpty(res.getCredentialInfo().getPassword())){
                        res.getCredentialInfo().setPassword(DigestUtilsSm2.decryptEncodedSm2(res.getCredentialInfo().getPassword()));
                    }
                } catch (Exception e) {
                    LOGGER.info("getDatasources var11 decryptEncodedSm2 fail ", e);
                }
                result.add(res);
            }
        }

        return result;
    }

    @Override
    public List<DatasourceEntity> findExtDatasources(QueryParameterCriteria criteria) {
        MultiConditionQueryUtils.MultiConditionQuery<DatasourceEntity> query = this.multiConditionQueryUtils.createQuery(DatasourceEntity.class);
        boolean pageQuery = this.datasourceQueryHelper.buildCriteria(criteria, query);
        List<DatasourceEntity> result = new LinkedList();
        if (pageQuery) {
            PageResult<DatasourceEntity> pageResult = query.page();
            Iterator var9 = pageResult.getContent().iterator();
            while(var9.hasNext()) {
                DatasourceEntity datasource = (DatasourceEntity)var9.next();
//                try {
//                    if(!Strings.isNullOrEmpty(datasource.getConnectionInfo().getCredentialInfo().getPassword())){
//                        datasource.getConnectionInfo().getCredentialInfo().setPassword(DigestUtilsSm2.decryptEncodedSm2(datasource.getConnectionInfo().getCredentialInfo().getPassword()));
//                    }
//                } catch (Exception e) {
//                    LOGGER.info("findExtDatasources var9 decryptEncodedSm2 fail ", e);
//                }
                result.add(datasource);
            }
        } else {
            Iterator var11 = query.list().iterator();
            while(var11.hasNext()) {
                DatasourceEntity datasource = (DatasourceEntity)var11.next();
//                try {
//                    if(!Strings.isNullOrEmpty(datasource.getConnectionInfo().getCredentialInfo().getPassword())){
//                        datasource.getConnectionInfo().getCredentialInfo().setPassword(DigestUtilsSm2.decryptEncodedSm2(datasource.getConnectionInfo().getCredentialInfo().getPassword()));
//                    }
//                } catch (Exception e) {
//                    LOGGER.info("findExtDatasources var11 decryptEncodedSm2 fail ", e);
//                }
                result.add(datasource);
            }
        }

        return result;
    }
}
