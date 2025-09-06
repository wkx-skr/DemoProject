package com.datablau.archy.server.service.impl;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ObjectX;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.archy.common.enums.ArchyState;
import com.datablau.archy.server.dto.*;
import com.datablau.archy.server.dto.excel.L4ExcelDto;
import com.datablau.archy.server.dto.excel.L5ExcelDto;
import com.datablau.archy.server.dto.query.ArchyObjectQueryDto;
import com.datablau.archy.server.enums.ProcessType;
import com.datablau.archy.server.jpa.entity.ArchyObject;
import com.datablau.archy.server.jpa.entity.ArchyObjectVersion;
import com.datablau.archy.server.jpa.entity.ArchySubject;
import com.datablau.archy.server.jpa.entity.ArchySubjectExt;
import com.datablau.archy.server.jpa.repository.ArchySubjectExtRepository;
import com.datablau.archy.server.utils.DataUtility;
import com.datablau.archy.server.utils.DatablauFileUtil;
import com.datablau.archy.server.utils.ElementUtils;
import com.datablau.base.api.ModelCategoryService;
import com.datablau.base.data.ModelCategoryDto;
import com.datablau.data.common.data.FileDescriptor;
import com.datablau.domain.management.api.DomainService;
import com.datablau.domain.management.dto.DomainDto;
import com.datablau.model.common.dto.DdmModelElementDto;
import com.datablau.model.common.dto.DdmModelUdpDto;
import com.datablau.project.api.DatablauRemoteDdmModelServiceNew;
import com.datablau.project.api.RemoteDataAssetExtendService;
import com.datablau.project.api.dto.DdmElementExtDto;
import com.datablau.project.api.dto.DdmL4ExcelDto;
import com.datablau.project.api.dto.DdmL5ExcelDto;
import com.datablau.project.api.dto.DdmModelDto;
import com.datablau.project.api.dto.DdmModelVersionDto;
import com.datablau.project.api.dto.DdmModelVersionQueryDto;
import com.datablau.project.dto.L4Dto;
import com.datablau.project.dto.L5Dto;
import com.datablau.project.util.CheckNameUtil;
import com.datablau.security.management.utils.AuthTools;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Strings;
import org.apache.commons.io.FileUtils;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.persistence.criteria.Predicate;
import java.io.*;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @author: hxs
 * @date: 2025/4/22 20:21
 */
@Service("archyObjectServiceExt")
public class ArchyObjectExtendServiceImpl extends ArchyObjectServiceImpl {

    @Autowired
    ArchySubjectExtRepository subjectExtRepository;
    @Autowired
    DatablauRemoteDdmModelServiceNew datablauRemoteDdmModelServiceNew;
    @Autowired
    RemoteDataAssetExtendService remoteDataAssetExtendService;
    @Autowired
    @Qualifier("modelCategoryService")
    ModelCategoryService  modelCategoryService;
//    @Autowired
//    DomainExtService domainExtService;
    @Autowired
    @Qualifier("domainService")
    DomainService domainService;

    @Autowired
    private DatablauFileUtil datablauFileUtil;


    public Page<ArchyObjectSearchDto> findArchyObjects0(ArchyObjectQueryDto archyObjectQueryDto, Integer currentPage, Integer pageSize) {

        Specification<ArchyObject> specification = (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (!Strings.isNullOrEmpty(archyObjectQueryDto.getName())) {
                predicates.add(builder.or(
                        builder.like(root.get("name"), "%" + archyObjectQueryDto.getName().trim() + "%"),
                        builder.like(root.get("code"), "%" + archyObjectQueryDto.getName().trim() + "%"),
                        builder.like(root.get("alias"), "%" + archyObjectQueryDto.getName().trim() + "%"),
                        builder.like(root.get("abbreviation"), "%" + archyObjectQueryDto.getName().trim() + "%")));
            }

            if (archyObjectQueryDto.getSubjectId() != null) {
                List<Long> subjectIds = new ArrayList<>();
                subjectIds.add(archyObjectQueryDto.getSubjectId());
                List<Long> subIds = archySubjectService
                        .getSubSubject(Collections.singleton(archyObjectQueryDto.getSubjectId()), new ArrayList<>())
                        .stream().map(ArchySubject::getId).collect(Collectors.toList());
                subjectIds.addAll(subIds);
                predicates.add(builder.in(root.get("subjectId")).value(subjectIds));
            }

            if (archyObjectQueryDto.getSubjectTag() != null && !archyObjectQueryDto.getSubjectTag().isEmpty()) {
                predicates.add(builder.in(root.get("subjectTag")).value(archyObjectQueryDto.getSubjectTag()));
            }

            // 判断状态state
            String currentUser = AuthTools.currentUsername();
            if (AuthTools.hasAnyRole("ROLE_SUPERUSER_DDM")) {
                // 未传入状态则查询所有，传入状态则查询指定状态
                if (archyObjectQueryDto.getState() != null && !archyObjectQueryDto.getState().isEmpty()) {
                    predicates.add(builder.in(root.get("state")).value(archyObjectQueryDto.getState()));
                }
            } else {
                // 普通用户可以看到所有 已发布 + 自己创建/修改的
                if (archyObjectQueryDto.getState() == null || archyObjectQueryDto.getState().isEmpty()) {
                    predicates.add(builder.or(
                            builder.equal(root.get("state"), ArchyState.A),
                            builder.equal(root.get("owner"), currentUser),
                            builder.equal(root.get("lastModifier"), currentUser)));
                } else {
                    List<Predicate> state = new ArrayList<>();
                    if (archyObjectQueryDto.getState().contains(ArchyState.A)) {
                        state.add(builder.equal(root.get("state"), ArchyState.A));
                    }
                    if (archyObjectQueryDto.getState().contains(ArchyState.X)) {
                        state.add(builder.equal(root.get("state"), ArchyState.X));
                    }
                    if (archyObjectQueryDto.getState().contains(ArchyState.C)) {
                        state.add(builder.and(
                                builder.equal(root.get("state"), ArchyState.C),
                                builder.or(builder.equal(root.get("owner"), AuthTools.currentUsername()),
                                        builder.equal(root.get("lastModifier"), AuthTools.currentUsername()))));
                    }
                    if (archyObjectQueryDto.getState().contains(ArchyState.D)) {
                        state.add(builder.and(
                                builder.equal(root.get("state"), ArchyState.D),
                                builder.or(builder.equal(root.get("owner"), AuthTools.currentUsername()),
                                        builder.equal(root.get("lastModifier"), AuthTools.currentUsername()))));
                    }
                    predicates.add(builder.or(state.toArray(new Predicate[0])));
                }
            }

            if (archyObjectQueryDto.getReleasedStartDate() != null && archyObjectQueryDto.getReleasedEndDate() != null) {
                predicates.add(builder.between(root.get("releaseTime"), archyObjectQueryDto.getReleasedStartDate(), archyObjectQueryDto.getReleasedEndDate()));
            }

            if (archyObjectQueryDto.getReleasedStartDate() == null && archyObjectQueryDto.getReleasedEndDate() != null) {
                predicates.add(builder.lessThanOrEqualTo(root.get("releaseTime"), archyObjectQueryDto.getReleasedEndDate()));
            }

            if (archyObjectQueryDto.getReleasedStartDate() != null && archyObjectQueryDto.getReleasedEndDate() == null) {
                predicates.add(builder.greaterThanOrEqualTo(root.get("releaseTime"), archyObjectQueryDto.getReleasedStartDate()));
            }

            if (archyObjectQueryDto.getCreateStartDate() != null && archyObjectQueryDto.getCreateEndDate() != null) {
                predicates.add(builder.between(root.get("createTime"), archyObjectQueryDto.getCreateStartDate(), archyObjectQueryDto.getCreateEndDate()));
            }

            if (archyObjectQueryDto.getCreateStartDate() == null && archyObjectQueryDto.getCreateEndDate() != null) {
                predicates.add(builder.lessThanOrEqualTo(root.get("createTime"), archyObjectQueryDto.getCreateEndDate()));
            }

            if (archyObjectQueryDto.getCreateStartDate() != null && archyObjectQueryDto.getCreateEndDate() == null) {
                predicates.add(builder.greaterThanOrEqualTo(root.get("createTime"), archyObjectQueryDto.getCreateStartDate()));
            }

            return builder.and(predicates.toArray(new Predicate[0]));
        };

        Sort orders = Sort.by(Sort.Direction.DESC, "createTime");
        Page<ArchyObject> data = archyObjectDao.findAll(specification, PageRequest.of(currentPage - 1, pageSize, orders));
        ArrayList<ArchyObjectSearchDto> res = new ArrayList<>();
        if (!data.getContent().isEmpty()) {
            for (ArchyObject archyObject : data.getContent()) {
                String path = archySubjectService.findArchySubjectPath(archyObject.getSubjectId(), null);
                if (!Strings.isNullOrEmpty(path)) {
                    archyObject.setPath(path);
                    String[] split = path.split("/");
                    archyObject.setSubjectName(split[split.length - 1]);
                }
                ArchyObjectSearchDto searchDto = new ArchyObjectSearchDto();
                BeanUtils.copyProperties(archyObject, searchDto);

                ArchySubjectExt ext = subjectExtRepository.findByArchyObjectId(archyObject.getId());
                if (ext != null) {
                    searchDto.setCatalogState(ext.getPublishState());
                    searchDto.setCatalogId(ext.getDamId());
                }
                res.add(searchDto);
            }
        }
        Page<ArchyObjectSearchDto> resPage = new PageImpl<>(res, data.getPageable(), data.getTotalElements());
        List<ArchyObjectSearchDto> content = resPage.getContent();
        if (!CollectionUtils.isEmpty(content)) {
            Set<Long> modelIdSet = content.stream().map(ArchyObjectSearchDto::getLogicalModelId).collect(Collectors.toSet());
            Map<Long, String> modelIdAndName = datablauRemoteDdmModelServiceNew.getDdmModels(modelIdSet).stream().collect(Collectors.toMap(DdmModelDto::getId, DdmModelDto::getName));
            List<ArchyObjectSearchDto> objectList = content.stream().filter(a -> Objects.nonNull(a.getLogicalModelId()) && Objects.nonNull(a.getLogicalModelVersionId())).collect(Collectors.toList());
            List<DdmModelVersionQueryDto> list = new ArrayList<>();
            for (ArchyObjectSearchDto archyObject : objectList) {
                DdmModelVersionQueryDto dto = new DdmModelVersionQueryDto();
                dto.setModelId(archyObject.getLogicalModelId());
                dto.setModelVersionId(archyObject.getLogicalModelVersionId());
                list.add(dto);
            }
            //获取模型的版本信息
            List<DdmModelVersionDto> ddmModelVersionDto = datablauRemoteDdmModelServiceNew.getDdmModelVersionDto(list);
            Map<Long, DdmModelVersionDto> dtoMap = new HashMap<>();
            if (Objects.nonNull(ddmModelVersionDto)) {
                dtoMap = ddmModelVersionDto.stream().collect(Collectors.toMap(DdmModelVersionDto::getModelVersionId, d -> d));
            }
            for (ArchyObjectSearchDto searchDto : content) {
                searchDto.setModelName(modelIdAndName.get(searchDto.getLogicalModelId()));
                if (dtoMap.containsKey(searchDto.getLogicalModelVersionId())) {
                    DdmModelVersionDto versionDto = dtoMap.get(searchDto.getLogicalModelVersionId());
                    searchDto.setModelVersionName(versionDto.getModelVersionName());
                    searchDto.setModelVersionCurrentName(versionDto.getModelVersionCurrentName());
                    searchDto.setModelCurrentVersionId(versionDto.getModelCurrentVersionId());
                    searchDto.setModelEndVer(versionDto.getModelEndVer());
                }
            }
        }
        return resPage;
    }

    @Override
    @Transactional
    public void updateArchyObjectState(String uuid, ArchyState state, ProcessType type) {
        if (Strings.isNullOrEmpty(uuid)) {
            throw new InvalidArgumentException(msgService.getMessage("业务对象uuid不能为空"));
        }
        ArchyObject archyObjectSaved = archyObjectDao.findArchyObjectById(uuid);
        if (archyObjectSaved == null) {
            throw new InvalidArgumentException(msgService.getMessage("业务对象不存在"));
        }

        if (type.equals(ProcessType.ARCHY_OBJECT_PUBLISH)) {
            if (state.equals(ArchyState.C)) {
                // 发布评审中
                // 将该数据置为评审中的状态
                archyObjectSaved.setState(ArchyState.C);
            } else if (state.equals(ArchyState.A)) {
                // 发布成功
                // 1.将该数据置为已发布
                archyObjectSaved.setState(ArchyState.A);
                archyObjectSaved.setReleaseTime(new Date());
                //发布成功之后把模型版本变成最新的
                this.updateModelVersion(archyObjectSaved);
                // 2.将数据存入历史版本表
                archyObjectVersionDao.save(new ArchyObjectVersion(archyObjectSaved));
                //同步资产目录
                this.syncDDCCatalogL4AndL5(archyObjectSaved,null);
            } else if (state.equals(ArchyState.D)) {
                // 发布失败
                // 将该数据置为待评审
                archyObjectSaved.setState(ArchyState.D);
            } else {
                throw new InvalidArgumentException(msgService.getMessage("状态不存在"));
            }
            ArchyObject save = archyObjectDao.save(archyObjectSaved);
            // 更新缓存
            if (save.getState().equals(ArchyState.A)) {
                ArchyObject cacheObj = getReleaseArchyObjectCache().get(save.getId());
                if (cacheObj == null) {
                    createArchyObjectCache(save, true);
                } else {
                    createArchyObjectCache(save, !Objects.equals(save.getLogicalModelId(), cacheObj.getLogicalModelId())
                            || !Objects.equals(save.getLogicalModelVersionId(), cacheObj.getLogicalModelVersionId()));
                }
            }
        } else if (type.equals(ProcessType.ARCHY_OBJECT_UPDATE)) {
            if (state.equals(ArchyState.C)) {
                // 变更评审中
                // 申请变更时创建的新版本默认状态为C，此处无需二次变更
//                archyObjectSaved.setState(ArchyState.C);
//                archyObjectDao.save(archyObjectSaved);
            } else if (state.equals(ArchyState.A)) {
                // 变更成功
                // 1.将之前发布的版本数据更新,将UpdateId置为NULL
                ArchyObject released = archyObjectDao.findArchyObjectByUpdateId(uuid);
                released.setName(archyObjectSaved.getName());
                released.setCode(archyObjectSaved.getCode());
                released.setAlias(archyObjectSaved.getAlias());
                released.setAbbreviation(archyObjectSaved.getAbbreviation());
                released.setPurpose(archyObjectSaved.getPurpose());
                released.setDefinition(archyObjectSaved.getDefinition());
                released.setScope(archyObjectSaved.getScope());
                released.setInclude(archyObjectSaved.getInclude());
                released.setExclude(archyObjectSaved.getExclude());
                released.setOwner(archyObjectSaved.getOwner());
                released.setCreateTime(archyObjectSaved.getCreateTime());
                released.setReleaseTime(new Date());
                released.setState(ArchyState.A);
                released.setLastModifier(archyObjectSaved.getLastModifier());
                released.setLastModifiedTime(archyObjectSaved.getLastModifiedTime());
                released.setLogicalModelId(archyObjectSaved.getLogicalModelId());
                released.setLogicalModelVersionId(archyObjectSaved.getLogicalModelVersionId());
                released.setVersion(archyObjectSaved.getVersion());
                released.setSubjectId(archyObjectSaved.getSubjectId());
                released.setSubjectTag(archyObjectSaved.getSubjectTag());
                released.setUpdateId(null);
                released.setAdditionalProperties(archyObjectSaved.getAdditionalProperties());
                ArchyObject save = archyObjectDao.save(released);
                // 2.将数据存入历史版本表
                archyObjectVersionDao.save(new ArchyObjectVersion(released));
                // 3.删除这个临时创建的数据
                archyObjectDao.deleteById(uuid);
                // 更新缓存
                if (save.getState().equals(ArchyState.A)) {
                    ArchyObject cacheObj = getReleaseArchyObjectCache().get(save.getId());
                    if (cacheObj == null) {
                        createArchyObjectCache(save, true);
                    } else {
                        createArchyObjectCache(save, !Objects.equals(save.getLogicalModelId(), cacheObj.getLogicalModelId())
                                || !Objects.equals(save.getLogicalModelVersionId(), cacheObj.getLogicalModelVersionId()));
                    }
                }
            } else if (state.equals(ArchyState.D)) {
                // 变更失败
                // 1.将updateId置为NULL
                ArchyObject released = archyObjectDao.findArchyObjectByUpdateId(uuid);
                released.setUpdateId(null);
                archyObjectDao.save(released);
                // 2.删除这个临时创建的数据
                archyObjectDao.deleteById(uuid);
            } else {
                throw new InvalidArgumentException(msgService.getMessage("状态不存在"));
            }
        } else if (type.equals(ProcessType.ARCHY_OBJECT_ABOLISH)) {
            if (state.equals(ArchyState.C)) {
                // 申请废弃中
                // 申请变更时创建的新版本默认状态为C，此处无需二次变更
//                archyObjectSaved.setState(ArchyState.C);
//                archyObjectDao.save(archyObjectSaved);
            } else if (state.equals(ArchyState.X)) {
                // 废弃成功
                // 1.更新状态
                ArchyObject released = archyObjectDao.findArchyObjectByUpdateId(uuid);
                released.setUpdateId(null);
                released.setState(ArchyState.X);
                archyObjectDao.save(released);
                // 2.删除这个临时创建的数据
                archyObjectDao.deleteById(uuid);
                // 更新缓存
                getReleaseArchyObjectElementCache().remove(released.getId());
                getReleaseArchyObjectCache().remove(released.getId());
            } else if (state.equals(ArchyState.A)) {
                // 废弃失败
                // 1.更新状态
                ArchyObject released = archyObjectDao.findArchyObjectByUpdateId(uuid);
                released.setUpdateId(null);
                archyObjectDao.save(released);
                // 2.删除这个临时创建的数据
                archyObjectDao.deleteById(uuid);
            } else {
                throw new InvalidArgumentException(msgService.getMessage("状态不存在"));
            }
        } else {
            throw new InvalidArgumentException(msgService.getMessage("ProcessType不存在"));
        }
    }




    public void updateArchyObjectStateCopy(String uuid, ArchyState state, ProcessType type,String username) {
        if (Strings.isNullOrEmpty(uuid)) {
            throw new InvalidArgumentException(msgService.getMessage("业务对象uuid不能为空"));
        }
        ArchyObject archyObjectSaved = archyObjectDao.findArchyObjectById(uuid);
        if (archyObjectSaved == null) {
            throw new InvalidArgumentException(msgService.getMessage("业务对象不存在"));
        }

        if (type.equals(ProcessType.ARCHY_OBJECT_PUBLISH)) {
            if (state.equals(ArchyState.C)) {
                // 发布评审中
                // 将该数据置为评审中的状态
                archyObjectSaved.setState(ArchyState.C);
            } else if (state.equals(ArchyState.A)) {
                // 发布成功
                // 1.将该数据置为已发布
                archyObjectSaved.setState(ArchyState.A);
                archyObjectSaved.setReleaseTime(new Date());
                //发布成功之后把模型版本变成最新的
                this.updateModelVersion(archyObjectSaved);
                // 2.将数据存入历史版本表
                archyObjectVersionDao.save(new ArchyObjectVersion(archyObjectSaved));
                //同步资产目录
                this.syncDDCCatalogL4AndL5(archyObjectSaved,username);
            } else if (state.equals(ArchyState.D)) {
                // 发布失败
                // 将该数据置为待评审
                archyObjectSaved.setState(ArchyState.D);
            } else {
                throw new InvalidArgumentException(msgService.getMessage("状态不存在"));
            }
            ArchyObject save = archyObjectDao.save(archyObjectSaved);
            // 更新缓存
            if (save.getState().equals(ArchyState.A)) {
                ArchyObject cacheObj = getReleaseArchyObjectCache().get(save.getId());
                if (cacheObj == null) {
                    createArchyObjectCache(save, true);
                } else {
                    createArchyObjectCache(save, !Objects.equals(save.getLogicalModelId(), cacheObj.getLogicalModelId())
                            || !Objects.equals(save.getLogicalModelVersionId(), cacheObj.getLogicalModelVersionId()));
                }
            }
        } else if (type.equals(ProcessType.ARCHY_OBJECT_UPDATE)) {
            if (state.equals(ArchyState.C)) {
                // 变更评审中
                // 申请变更时创建的新版本默认状态为C，此处无需二次变更
//                archyObjectSaved.setState(ArchyState.C);
//                archyObjectDao.save(archyObjectSaved);
            } else if (state.equals(ArchyState.A)) {
                // 变更成功
                // 1.将之前发布的版本数据更新,将UpdateId置为NULL
                ArchyObject released = archyObjectDao.findArchyObjectByUpdateId(uuid);
                released.setName(archyObjectSaved.getName());
                released.setCode(archyObjectSaved.getCode());
                released.setAlias(archyObjectSaved.getAlias());
                released.setAbbreviation(archyObjectSaved.getAbbreviation());
                released.setPurpose(archyObjectSaved.getPurpose());
                released.setDefinition(archyObjectSaved.getDefinition());
                released.setScope(archyObjectSaved.getScope());
                released.setInclude(archyObjectSaved.getInclude());
                released.setExclude(archyObjectSaved.getExclude());
                released.setOwner(archyObjectSaved.getOwner());
                released.setCreateTime(archyObjectSaved.getCreateTime());
                released.setReleaseTime(new Date());
                released.setState(ArchyState.A);
                released.setLastModifier(archyObjectSaved.getLastModifier());
                released.setLastModifiedTime(archyObjectSaved.getLastModifiedTime());
                released.setLogicalModelId(archyObjectSaved.getLogicalModelId());
                released.setLogicalModelVersionId(archyObjectSaved.getLogicalModelVersionId());
                released.setVersion(archyObjectSaved.getVersion());
                released.setSubjectId(archyObjectSaved.getSubjectId());
                released.setSubjectTag(archyObjectSaved.getSubjectTag());
                released.setUpdateId(null);
                released.setAdditionalProperties(archyObjectSaved.getAdditionalProperties());
                ArchyObject save = archyObjectDao.save(released);
                // 2.将数据存入历史版本表
                archyObjectVersionDao.save(new ArchyObjectVersion(released));
                // 3.删除这个临时创建的数据
                archyObjectDao.deleteById(uuid);
                // 更新缓存
                if (save.getState().equals(ArchyState.A)) {
                    ArchyObject cacheObj = getReleaseArchyObjectCache().get(save.getId());
                    if (cacheObj == null) {
                        createArchyObjectCache(save, true);
                    } else {
                        createArchyObjectCache(save, !Objects.equals(save.getLogicalModelId(), cacheObj.getLogicalModelId())
                                || !Objects.equals(save.getLogicalModelVersionId(), cacheObj.getLogicalModelVersionId()));
                    }
                }
            } else if (state.equals(ArchyState.D)) {
                // 变更失败
                // 1.将updateId置为NULL
                ArchyObject released = archyObjectDao.findArchyObjectByUpdateId(uuid);
                released.setUpdateId(null);
                archyObjectDao.save(released);
                // 2.删除这个临时创建的数据
                archyObjectDao.deleteById(uuid);
            } else {
                throw new InvalidArgumentException(msgService.getMessage("状态不存在"));
            }
        } else if (type.equals(ProcessType.ARCHY_OBJECT_ABOLISH)) {
            if (state.equals(ArchyState.C)) {
                // 申请废弃中
                // 申请变更时创建的新版本默认状态为C，此处无需二次变更
//                archyObjectSaved.setState(ArchyState.C);
//                archyObjectDao.save(archyObjectSaved);
            } else if (state.equals(ArchyState.X)) {
                // 废弃成功
                // 1.更新状态
                ArchyObject released = archyObjectDao.findArchyObjectByUpdateId(uuid);
                released.setUpdateId(null);
                released.setState(ArchyState.X);
                archyObjectDao.save(released);
                // 2.删除这个临时创建的数据
                archyObjectDao.deleteById(uuid);
                // 更新缓存
                getReleaseArchyObjectElementCache().remove(released.getId());
                getReleaseArchyObjectCache().remove(released.getId());
            } else if (state.equals(ArchyState.A)) {
                // 废弃失败
                // 1.更新状态
                ArchyObject released = archyObjectDao.findArchyObjectByUpdateId(uuid);
                released.setUpdateId(null);
                archyObjectDao.save(released);
                // 2.删除这个临时创建的数据
                archyObjectDao.deleteById(uuid);
            } else {
                throw new InvalidArgumentException(msgService.getMessage("状态不存在"));
            }
        } else {
            throw new InvalidArgumentException(msgService.getMessage("ProcessType不存在"));
        }
    }

    private void updateModelVersion(ArchyObject archyObject) {
        DdmModelDto model = datablauRemoteDdmModelServiceNew.getDdmModels(List.of(archyObject.getLogicalModelId())).get(0);
        List<com.datablau.model.common.dto.DdmModelVersionDto> ddmModelVersion = ddmModelService.getDdmModelVersion(model.getId());
        Map<Long, com.datablau.model.common.dto.DdmModelVersionDto> verMap = ddmModelVersion.stream().collect(Collectors.toMap(com.datablau.model.common.dto.DdmModelVersionDto::getEndVersion, a -> a));
        if (verMap.get(model.getCurrentVersion()) != null) {
            archyObject.setLogicalModelVersionId(verMap.get(model.getCurrentVersion()).getId());
        }
    }

    /**
     * 增加一个username 用于同步时候进行使用 该字段可以为空
     * @param archyObject
     * @param username
     */
    private void syncDDCCatalogL4AndL5(ArchyObject archyObject,String username) {
        ArrayList<L4Dto> l4Map = this.getArchyObjectElements(archyObject);
        ArchySubjectExt archySubjecext = subjectExtRepository.findByArchyObjectId(archyObject.getId());
        String usernames = archyObject.getOwner();
        Long damId = archySubjecext.getDamId();
        remoteDataAssetExtendService.syncL4AndL5(damId, usernames, l4Map,username);
        System.out.println();
    }

    private void createL4(List<DdmModelElementDto> modelElements, DdmModelDto model, Map<Long, DdmElementExtDto> elementExtsMap,
                          ArchySubjectExt archySubjecext, HashMap<String, DdmModelUdpDto> tableUdpMap, HashMap<Long, L4Dto> l4Map) {
        for (DdmModelElementDto element : modelElements) {
            if (element.getTypeId() == LDMTypes.oEntity) {
                ObjectX objectX = ElementUtils.getObjectXFromData(element.getData(), model.getUseProto());
                L4Dto l4 = new L4Dto();
                //中文名
                l4.setName(element.getAlias());
                //英文名
                l4.setEnglishName(element.getName());

                //定义
                Object definition = objectX.getProperty(LDMTypes.pDefinition);
                if (definition != null) {
                    l4.setDescription(String.valueOf(definition));
                }
                //编码
                DdmElementExtDto extDto = elementExtsMap.get(element.getElementId());
                if (extDto != null) {
                    l4.setCode(extDto.getCode());
                    l4.setCreator(extDto.getCreater());
                }
                //层级
                l4.setLevel(4);
                //l3的id，也就是l4的父级对象(业务对象)对应dam的id
                l4.setL3DamId(archySubjecext.getDamId());
                //数据管家
                DdmModelUdpDto dataSteward = tableUdpMap.get("数据管家");
                if (dataSteward != null) {
                    Object property = objectX.getProperty(dataSteward.getUdpId());
                    l4.setDataSteward(String.valueOf(property));
                }
                //数据分类
                DdmModelUdpDto dataClassification = tableUdpMap.get("数据分类");
                if (dataSteward != null) {
                    Object property = objectX.getProperty(dataClassification.getUdpId());
                    l4.setDataClassification(String.valueOf(property));
                }
                //来源系统
                DdmModelUdpDto sourceSystem = tableUdpMap.get("来源系统");
                if (sourceSystem != null) {
                    Object property = objectX.getProperty(sourceSystem.getUdpId());
                    l4.setSourceSystem(String.valueOf(property));
                }
                l4.setL5Children(new ArrayList<>());
                l4Map.put(element.getElementId(), l4);
            }
        }
    }

    private void createL5(List<DdmModelElementDto> modelElements, HashMap<Long, L4Dto> l4Map, DdmModelDto model,
                          Map<Long, DdmElementExtDto> elementExtsMap) {

        Set<Long> primaryKey = new HashSet<>();
        for (DdmModelElementDto modelElement : modelElements) {
            if ((modelElement.getTypeId() == LDMTypes.oKeyGroup) || (modelElement.getTypeId() == LDMTypes.oKeyGroupMember)) {
                ObjectX keyGroup = ElementUtils.getObjectXFromData(modelElement.getData(), model.getUseProto());
                String keyType = keyGroup.getPropertyStringValue(LDMTypes.pKeyGroupType);
                if ("PrimaryKey".equals(keyType)) {
                    String memberRefs = keyGroup.getPropertyStringValue(LDMTypes.pKeyGroupMemberRefs);
                    if (!Strings.isNullOrEmpty(memberRefs)) {
                        for (String s : memberRefs.split(",")) {
                            for (DdmModelElementDto e : modelElements) {
                                if (e.getElementId().equals(Long.valueOf(s))) {
                                    ObjectX member = ElementUtils.getObjectXFromData(e.getData(), true);
                                    primaryKey.add(member.getPropertyLongValue(LDMTypes.pAttributeRef));
                                }
                            }
                        }
                    }
                }
            }
        }

        for (DdmModelElementDto element : modelElements) {
            if (element.getTypeId() == LDMTypes.oAttribute) {
                L4Dto l4Dto = l4Map.get(element.getParentId());
                if (l4Dto == null) {
                    continue;
                }
                ObjectX objectX = ElementUtils.getObjectXFromData(element.getData(), model.getUseProto());
                L5Dto l5 = new L5Dto();
                //中文名
                l5.setName(element.getAlias());
                //英文名
                l5.setEnglishName(element.getName());
                //定义
                Object definition = objectX.getProperty(LDMTypes.pDefinition);
                if (definition != null) {
                    l5.setDescription(String.valueOf(definition));
                }
                //编码
                DdmElementExtDto extDto = elementExtsMap.get(element.getElementId());
                if (extDto != null) {
                    l5.setCode(extDto.getCode());
                    l5.setCreator(extDto.getCreater());
                }
                //层级
                l5.setLevel(5);
                //是否为null
                Object isNotNull = objectX.getProperty(LDMTypes.pIsNotNull);
                if (isNotNull != null) {
                    l5.setNull(Boolean.valueOf(isNotNull.toString()));
                }
                //数据标准id
                l5.setDomainId(element.getDomainId());
                //是否是主键
                if (primaryKey.contains(element.getElementId())) {
                    l5.setPk(true);
                } else {
                    l5.setPk(false);
                }
                //默认值
                Object defaultValue = objectX.getProperty(LDMTypes.pDefaultValue);
                if (defaultValue != null) {
                    l5.setDefaultValue(String.valueOf(defaultValue));
                }
                //数据类型
                Object dataType = objectX.getProperty(LDMTypes.pDataType);
                if (dataType != null) {
                    l5.setDataType(String.valueOf(dataType));
                }
                l4Dto.getL5Children().add(l5);
            }
        }
    }

    //根据elementid查询元数据扩展字段
    public List<DdmElementExtDto> getModelElementExtByElementIds(List<Long> elementIds, String archyObjectId){
        return datablauRemoteDdmModelServiceNew.getDdmElementExtByElementIds(elementIds, archyObjectId);
    }

    @Override
    public void archyObjectApplyVerification(ArchyObject archyObject, ProcessType type) {
        if (archyObject == null) {
            throw new InvalidArgumentException("该业务对象不存在");
        }
        if (archyObject.getState().equals(ArchyState.X)) {
            throw new InvalidArgumentException("该业务对象已废弃");
        }

        //是否可以申请发布
        if (type.equals(ProcessType.ARCHY_OBJECT_PUBLISH)) {
            if (!archyObject.getState().equals(ArchyState.D)) {
                throw new InvalidArgumentException("业务对象未处于待审核状态");
            }
        }
        //是否可以申请变更
        if (type.equals(ProcessType.ARCHY_OBJECT_UPDATE)) {
            if (!archyObject.getState().equals(ArchyState.C)) {
                throw new InvalidArgumentException("业务对象未处于已发布状态,请刷新后重试");
            }
        }
        //是否可以申请废弃
        if (type.equals(ProcessType.ARCHY_OBJECT_ABOLISH)) {
            if (!archyObject.getState().equals(ArchyState.C)) {
                throw new InvalidArgumentException("业务对象未处于已发布状态，不可以申请废弃");
            }
        }

        this.checkL4AndL5PublishElement(archyObject);

        updateArchyObjectState(archyObject.getId(), ArchyState.C, type);
    }

    private void checkL4AndL5PublishElement(ArchyObject archyObject) {
        List<DdmModelElementDto> modelElements = ddmModelService.getDdmModelElements(archyObject.getLogicalModelId(), null, Set.of(LDMTypes.oEntity, LDMTypes.oAttribute));
        Map<Long, DdmModelElementDto> collect = modelElements.stream().collect(Collectors.toMap(DdmModelElementDto::getElementId, a -> a));
        DdmModelDto model = datablauRemoteDdmModelServiceNew.getDdmModels(List.of(archyObject.getLogicalModelId())).get(0);

        ArrayList<String> tableChineseName = new ArrayList<>();
        ArrayList<String> tableEnglishName = new ArrayList<>();

        HashMap<String, DdmModelUdpDto> tableUdpMap = new HashMap<>();
//        HashMap<String, DdmModelUdpDto> columnUdpMap = new HashMap<>();

        List<DdmModelUdpDto> ddmModelUdp = ddmModelService.getDdmModelUdp();
        for (DdmModelUdpDto udp : ddmModelUdp) {
            if (udp.getTargetTypes().contains(LDMTypes.oEntity)) {
                tableUdpMap.put(udp.getName(), udp);
            }
//            if(udp.getTargetTypes().contains(LDMTypes.oAttribute)){
//                columnUdpMap.put(udp.getName(), udp);
//            }
        }

        for (DdmModelElementDto modelElement : modelElements) {
            if (modelElement.getTypeId() == LDMTypes.oEntity) {
                this.checkTable(modelElement, model, tableChineseName, tableEnglishName, tableUdpMap);
            }

            if (modelElement.getTypeId() == LDMTypes.oAttribute) {
                this.checkColumn(modelElement, model, collect);
            }
        }
    }

    private void checkTable(DdmModelElementDto modelElement, DdmModelDto model,
                            ArrayList<String> tableChineseName, ArrayList<String> tableEnglishName, HashMap<String, DdmModelUdpDto> tableUdpMap) {

        //中文名校验
        if (Strings.isNullOrEmpty(modelElement.getAlias())) {
            throw new RuntimeException("表【" + modelElement.getName() + "】的中文名为空");
        }

        //一个业务对象下实体中文名不能重复
        if (tableChineseName.contains(modelElement.getAlias())) {
            throw new RuntimeException("该业务对象下的实体中文名【" + modelElement.getAlias() + "】重复");
        } else {
            tableChineseName.add(modelElement.getAlias());
        }

        //一个业务对象下实体英文名不能重复
        if (tableEnglishName.contains(modelElement.getName())) {
            throw new RuntimeException("该业务对象下的实体英文名【" + modelElement.getName() + "】重复");
        } else {
            tableEnglishName.add(modelElement.getName());
        }

        ObjectX objectX = ElementUtils.getObjectXFromData(modelElement.getData(), model.getUseProto());
        System.out.println();
        //定义校验
        Object definition = objectX.getProperty(LDMTypes.pDefinition);
        if (definition == null) {
            throw new RuntimeException("表【" + modelElement.getName() + "】的定义为空，不能发布");
        }
        //来源系统校验
        DdmModelUdpDto sourceSystem = tableUdpMap.get("来源系统");
        if(sourceSystem != null){

        }else {
            throw new RuntimeException("表【" + modelElement.getName() + "】的自定义属性来源系统为空，不能发布");
        }

        //数据管家
        DdmModelUdpDto dataSteward = tableUdpMap.get("数据管家");
        if (dataSteward != null) {
            Object property = objectX.getProperty(dataSteward.getUdpId());
            if (property == null) {
                throw new RuntimeException("表【" + modelElement.getName() + "】的自定义属性数据管家为空，不能发布");
            }
        } else {
            throw new RuntimeException("表【" + modelElement.getName() + "】的自定义属性数据管家为空，不能发布");
        }

        //数据分类
        DdmModelUdpDto dataClassification = tableUdpMap.get("数据分类");
        if (dataClassification != null) {
            Object property = objectX.getProperty(dataClassification.getUdpId());
            if (property == null) {
                throw new RuntimeException("表【" + modelElement.getName() + "】的自定义属性数据分类为空，不能发布");
            }
        } else {
            throw new RuntimeException("表【" + modelElement.getName() + "】的自定义属性数据分类为空，不能发布");
        }
    }

    private void checkColumn(DdmModelElementDto modelElement, DdmModelDto model, Map<Long, DdmModelElementDto> collect) {
        DdmModelElementDto table = collect.get(modelElement.getParentId());
        if(table == null){
            return;
        }
        //中文名校验
        if (Strings.isNullOrEmpty(modelElement.getAlias())) {
            throw new RuntimeException("实体【" + table.getName() + "】中的属性【" + modelElement.getName() + "】中文名为空，不能发布");
        }
        ObjectX objectX = ElementUtils.getObjectXFromData(modelElement.getData(), model.getUseProto());
        System.out.println();
        //定义校验
        Object definition = objectX.getProperty(LDMTypes.pDefinition);
        if (definition == null) {
            throw new RuntimeException("实体【" + table.getName() + "】中的属性【" + modelElement.getName() + "】的定义为空，不能发布");
        }
        //是否为空校验
        Object isNotNull = objectX.getProperty(LDMTypes.pIsNotNull);
        if (isNotNull == null) {
            throw new RuntimeException("实体【" + table.getName() + "】中的属性【" + modelElement.getName() + "】的是否为空为空，不能发布");
        }

        //数据标准校验
        if (Strings.isNullOrEmpty(modelElement.getDomainId())) {
            throw new RuntimeException("实体【" + table.getName() + "】中的属性【" + modelElement.getName() + "】未映射数据标准不能发布，请检查");
        }
    }

    public void updateArchyObjectStateForD(Long modelId) {
        List<ArchyObject> archyObjects = archyObjectDao.findArchyObjectByLogicalModelId(modelId);

        for (ArchyObject archyObject : archyObjects) {
            archyObject.setState(ArchyState.D);
        }
        archyObjectDao.saveAll(archyObjects);
    }

    public File exportcompare(CompareResultDto resultDto) throws Exception{
        // 复制业务对象模板作为导出模板
        File srcFile = new File(DataUtility.getResourcePath("/archy/compare_l4_l5.xlsx"));
        String desc = GeneralUtility.getWebRootPath() + "/resources/archy/compare_l4_l5_template.xlsx";
        File descFile = new File(desc);
        if (!descFile.exists()) {
            descFile.createNewFile();
        }
        FileUtils.copyFile(srcFile, descFile);
        XSSFWorkbook wb = new XSSFWorkbook(desc);
        // 样式
        XSSFCellStyle cellStyle = wb.createCellStyle();
        cellStyle.setFillForegroundColor(IndexedColors.GREEN.index);
        cellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        cellStyle.setAlignment(HorizontalAlignment.CENTER);
        cellStyle.setVerticalAlignment(VerticalAlignment.CENTER);
        cellStyle.setBorderBottom(BorderStyle.THIN);
        cellStyle.setBorderTop(BorderStyle.THIN);
        cellStyle.setBorderLeft(BorderStyle.THIN);
        cellStyle.setBorderRight(BorderStyle.THIN);
        XSSFFont font = wb.createFont();
        //设置字体大小
        font.setFontHeightInPoints((short) 11);
        font.setColor(IndexedColors.WHITE.index);
        cellStyle.setFont(font);

        // 实体sheet
        XSSFSheet sheet1 = wb.getSheetAt(0);
        // 属性sheet
        XSSFSheet sheet2 = wb.getSheetAt(1);

        // 1、处理实体的sheet
        ArrayList<TableCompareResultDto> tableResults = resultDto.getTableResults();
        if(!CollectionUtils.isEmpty(tableResults)){
            int sheet1RowIndex = 1;
            Row sheet1Row = sheet1.createRow(sheet1RowIndex);
            for (TableCompareResultDto tableResult : tableResults) {
                int colIndex = 0;
                //类型
                sheet1Row.createCell(colIndex++).setCellValue(tableResult.getType());
                //业务对象名
                sheet1Row.createCell(colIndex++).setCellValue(tableResult.getObjectName());
                //实体名
                sheet1Row.createCell(colIndex++).setCellValue(tableResult.getTableName());
                //实体中文名
                sheet1Row.createCell(colIndex++).setCellValue(tableResult.getTableChName());
                //实体定义
                sheet1Row.createCell(colIndex++).setCellValue(tableResult.getDefinition());
                sheet1Row = sheet1.createRow(++sheet1RowIndex);
            }
        }
        //2、处理属性
        ArrayList<ColumnCompareResultDto> columnResults = resultDto.getColumnResults();
        if(!CollectionUtils.isEmpty(columnResults)){
            int sheet2RowIndex = 1;
            Row sheet2Row = sheet2.createRow(sheet2RowIndex);
            for (ColumnCompareResultDto columnResult : columnResults) {
                int colIndex = 0;
                //类型
                sheet2Row.createCell(colIndex++).setCellValue(columnResult.getType());
                //业务对象名
                sheet2Row.createCell(colIndex++).setCellValue(columnResult.getObjectName());
                //实体名
                sheet2Row.createCell(colIndex++).setCellValue(columnResult.getTableName());
                //属性名
                sheet2Row.createCell(colIndex++).setCellValue(columnResult.getColumnName());
                //属性中文名
                sheet2Row.createCell(colIndex++).setCellValue(columnResult.getColumnChName());
                //属性英文名
                sheet2Row.createCell(colIndex++).setCellValue(columnResult.getColumnEnName());
                //属性数据类型
                sheet2Row.createCell(colIndex++).setCellValue(columnResult.getDataType());
                //属性定义
                sheet2Row.createCell(colIndex++).setCellValue(columnResult.getDefinition());
                //主键
                sheet2Row.createCell(colIndex++).setCellValue(columnResult.getPk());
                //非空
                sheet2Row.createCell(colIndex++).setCellValue(columnResult.getNotNull());
                //默认值
                sheet2Row.createCell(colIndex++).setCellValue(columnResult.getDefaultValue());
                sheet2Row = sheet2.createRow(++sheet2RowIndex);
            }
        }

        File file = new File("实体和属性发布增量数据详情.xlsx");
        try (FileOutputStream out = new FileOutputStream(file)) {
            wb.write(out);
        } finally {
            wb.close();
            if (descFile.exists()) {
                descFile.delete();
            }
        }
        return file;
    }

    public File exportl4l5(List<ArchyObject> exportContent) throws Exception {
        // 复制业务对象模板作为导出模板
        File srcFile = new File(DataUtility.getResourcePath("/archy/archy_l4_l5.xlsx"));
        String desc = GeneralUtility.getWebRootPath() + "/resources/archy/archy_l4_l5_template.xlsx";
        File descFile = new File(desc);
        if (!descFile.exists()) {
            descFile.createNewFile();
        }
        FileUtils.copyFile(srcFile, descFile);
        XSSFWorkbook wb = new XSSFWorkbook(desc);
        // 样式
        XSSFCellStyle cellStyle = wb.createCellStyle();
        cellStyle.setFillForegroundColor(IndexedColors.GREEN.index);
        cellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        cellStyle.setAlignment(HorizontalAlignment.CENTER);
        cellStyle.setVerticalAlignment(VerticalAlignment.CENTER);
        cellStyle.setBorderBottom(BorderStyle.THIN);
        cellStyle.setBorderTop(BorderStyle.THIN);
        cellStyle.setBorderLeft(BorderStyle.THIN);
        cellStyle.setBorderRight(BorderStyle.THIN);
        XSSFFont font = wb.createFont();
        //设置字体大小
        font.setFontHeightInPoints((short) 11);
        font.setColor(IndexedColors.WHITE.index);
        cellStyle.setFont(font);

        // 逻辑数据实体sheet
        XSSFSheet sheet1 = wb.getSheetAt(0);
        // 业务属性sheet
        XSSFSheet sheet2 = wb.getSheetAt(1);

        //查询内容为空时只导出模板
        if (exportContent != null && !exportContent.isEmpty()) {
            //获取dam的系统
            Map<String, ModelCategoryDto> categoryMap = modelCategoryService.getModelCategories()
                    .stream().collect(Collectors.toMap(a->a.getCategoryId().toString(), a -> a));
            //拿到数据标准数据
            List<String> domainIds = domainService.getAllDomainIds();
            List<DomainDto> domains = domainService.getDomainsByIds(domainIds);
            Map<String, DomainDto> domainMap = domains.stream().collect(Collectors.toMap(DomainDto::getDomainId, a -> a));

            int sheet1RowIndex = 1;
            int sheet2RowIndex = 1;
            for (ArchyObject ao : exportContent) {
                ArrayList<L4Dto> entities = this.getArchyObjectElements(ao);

                // 1、处理l4级别的sheet
                Row sheet1Row = sheet1.createRow(sheet1RowIndex);
                for (L4Dto entity : entities) {
                    int colIndex = 0;
                    //业务对象中文名
                    sheet1Row.createCell(colIndex++).setCellValue(ao.getName());
                    //逻辑数据实体编码
                    sheet1Row.createCell(colIndex++).setCellValue(entity.getCode());
                    //逻辑数据实体中文名
                    sheet1Row.createCell(colIndex++).setCellValue(entity.getName());
                    //逻辑数据实体英文名
                    sheet1Row.createCell(colIndex++).setCellValue(entity.getEnglishName());
                    //逻辑数据实体定义
                    sheet1Row.createCell(colIndex++).setCellValue(entity.getDescription());
                    //来源系统 --需要返回名称
                    ModelCategoryDto categoryDto = categoryMap.get(entity.getSourceSystem());
                    if (categoryDto != null) {
                        sheet1Row.createCell(colIndex++).setCellValue(categoryDto.getCategoryName());
                    } else {
                        sheet1Row.createCell(colIndex++).setCellValue("");
                    }
                    //数据管家
                    sheet1Row.createCell(colIndex++).setCellValue(entity.getDataSteward());
                    //数据分类
                    sheet1Row.createCell(colIndex++).setCellValue(entity.getDataClassification());

                    sheet1Row = sheet1.createRow(++sheet1RowIndex);
                }

                // 2、处理l5级别的sheet
                Row sheet2Row = sheet2.createRow(sheet2RowIndex);
                for (L4Dto entity : entities) {
                    List<L5Dto> attrs = entity.getL5Children();
                    for (L5Dto attr : attrs) {
                        int colIndex = 0;
                        //业务对象中文名
                        sheet2Row.createCell(colIndex++).setCellValue(ao.getName());
                        //逻辑实体中文名
                        sheet2Row.createCell(colIndex++).setCellValue(entity.getName());
                        //属性中文名
                        sheet2Row.createCell(colIndex++).setCellValue(attr.getName());
                        //属性英文名
                        sheet2Row.createCell(colIndex++).setCellValue(attr.getEnglishName());
                        //业务定义
                        sheet2Row.createCell(colIndex++).setCellValue(attr.getDescription());
                        //是否必填
                        if(attr.getNull() == null || (!attr.getNull())){
                            sheet2Row.createCell(colIndex++).setCellValue("否");
                        }else {
                            sheet2Row.createCell(colIndex++).setCellValue("是");
                        }

                        //标准数据元中文名(数据标准中文名)
                        DomainDto domain = domainMap.get(attr.getDomainId());
                        if(domain != null){
                            sheet2Row.createCell(colIndex++).setCellValue(domain.getChineseName());
                        }else {
                            sheet2Row.createCell(colIndex++).setCellValue("");
                        }
                        //主键
                        if (attr.getPk()) {
                            sheet2Row.createCell(colIndex++).setCellValue("Y");
                        }else {
                            sheet2Row.createCell(colIndex++).setCellValue("N");
                        }

                        //默认值
                        sheet2Row.createCell(colIndex++).setCellValue(attr.getDefaultValue());
                        //属性数据类型
                        sheet2Row.createCell(colIndex++).setCellValue(attr.getDataType());

                        sheet2Row = sheet2.createRow(++sheet2RowIndex);
                    }
                }
            }
        }

        File file = new File("业务对象.xlsx");
        try (FileOutputStream out = new FileOutputStream(file)) {
            wb.write(out);
        } finally {
            wb.close();
            if (descFile.exists()) {
                descFile.delete();
            }
        }
        return file;
    }

    private ArrayList<L4Dto> getArchyObjectElements(ArchyObject archyObject) {
        ArchySubjectExt archySubjecext = subjectExtRepository.findByArchyObjectId(archyObject.getId());
        if(archySubjecext == null){
            return new ArrayList<>();
        }
        DdmModelDto model = datablauRemoteDdmModelServiceNew.getDdmModels(List.of(archyObject.getLogicalModelId())).get(0);
        //拿到模型最新版本的元数据
        List<DdmModelElementDto> modelElements = ddmModelService.getDdmModelElements(archyObject.getLogicalModelId(), null,
                Set.of(LDMTypes.oEntity, LDMTypes.oAttribute, LDMTypes.oKeyGroup, LDMTypes.oKeyGroupMember));
        List<Long> elementIds = modelElements.stream().map(DdmModelElementDto::getElementId).toList();
        //获取模型元数据的扩展字段
        List<DdmElementExtDto> elementExts = datablauRemoteDdmModelServiceNew.getDdmElementExtByElementIds(elementIds, archyObject.getId());
        Map<Long, DdmElementExtDto> elementExtsMap = elementExts.stream().collect(Collectors.toMap(DdmElementExtDto::getModelElementId, a -> a));
        //获取表的扩展属性
        HashMap<String, DdmModelUdpDto> tableUdpMap = new HashMap<>();
        List<DdmModelUdpDto> ddmModelUdp = ddmModelService.getDdmModelUdp();
        for (DdmModelUdpDto udp : ddmModelUdp) {
            if (udp.getTargetTypes().contains(LDMTypes.oEntity)) {
                tableUdpMap.put(udp.getName(), udp);
            }
        }
        HashMap<Long, L4Dto> l4Map = new HashMap<>();
        //获取表类型的数据，这里封装表和字段的树形结构，因为这里没有dam资产目录的parentID做绑定
        this.createL4(modelElements, model, elementExtsMap, archySubjecext, tableUdpMap, l4Map);
        this.createL5(modelElements, l4Map, model, elementExtsMap);
        return new ArrayList<>(l4Map.values());
    }

    @Transactional
    public ArchyObjectL4L5ImportResultDto importL4L5(MultipartFile multipartFile, Map<String, List<Object>> sheets, String filePath) throws Exception {

        ArchyObjectL4L5ImportResultDto result = new ArchyObjectL4L5ImportResultDto();

        int successSize = 0, modifySize = 0, ignoreSize = 0;
        //获取dam的系统
        Map<String, ModelCategoryDto> categoryMap = modelCategoryService.getModelCategories().stream()
                .collect(Collectors.toMap(ModelCategoryDto::getCategoryName, a -> a));

        //拿到数据标准数据
        List<String> domainIds = domainService.getAllDomainIds();
        List<DomainDto> domains = domainService.getDomainsByIds(domainIds);
        Map<String, DomainDto> domainMap = domains.stream().collect(Collectors.toMap(DomainDto::getChineseName, a -> a));

        String entitySheetName = "逻辑数据实体", attrSheetName = "业务属性";
        //逻辑数据实体sheet页
        List<Object> entitySheet = sheets.get(entitySheetName);
        if (entitySheet == null) {
            throw new InvalidArgumentException("逻辑数据实体模板内容不能为空");
        }
        //业务属性sheet页
        List<Object> attrSheet = sheets.get(attrSheetName);
        if (attrSheet == null) {
            throw new InvalidArgumentException("业务属性模板内容不能为空");
        }

        // 第一页内容：逻辑数据实体
        List<L4ExcelDto> entities = new ArrayList<>();
        for(Object data : entitySheet) {
            HashMap<String, String> d = (HashMap<String, String>) data;
            entities.add(covertToL4ExcelDto(d));
        }
        logger.info("当前有:{}条逻辑数据实体数据待导入", entities.size());
        logger.info("正在校验逻辑数据实体数据......");
        HashMap<String, L4ExcelDto> tobeImportEntityMap = new HashMap<>();
        Set<String> uniqueEntityName = new HashSet<>();  // 业务对象名+业务实体中文名
        Set<String> uniqueEntityEnglishName = new HashSet<>();  // 业务对象名+业务实体英文名
        for (int i = 0; i < entities.size(); i++) {
            L4ExcelDto entity = entities.get(i);
            String sheetName = "逻辑数据实体";
            String lineNo = String.valueOf(i+1);
            this.checkImportEntity(lineNo, result, entity, sheetName, uniqueEntityName, uniqueEntityEnglishName);
            //校验来源系统存在
            ModelCategoryDto categoryDto = categoryMap.get(entity.getEntitySourceSystem());
            if(categoryDto == null){
                ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "不存在【" + entity.getEntitySourceSystem() + "】的来源系统", entity);
                result.addArchyObjectL4L5Error(errorDto);
            }

            //校验业务对象存在
            List<ArchyObject> archyObjects = archyObjectDao.findArchyObjectByName(entity.getObjectName());
            if (CollectionUtils.isEmpty(archyObjects)) {
                ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "不存在【" + entity.getObjectName() + "】业务对象", entity);
                result.addArchyObjectL4L5Error(errorDto);
            }

            String uniqueName = entity.getObjectName() + entity.getEntityName();
            tobeImportEntityMap.put(uniqueName, entity);
        }
        logger.info("逻辑数据实体数据校验完成");

        // 第二页内容：业务属性
        List<L5ExcelDto> attrs = new ArrayList<>();
        for(Object data : attrSheet) {
            HashMap<String, String> d = (HashMap<String, String>) data;
            attrs.add(covertToL5ExcelDto(d));
        }
        logger.info("当前有:{}条业务属性数据待导入", attrs.size());
        logger.info("正在校验业务属性数据......");
        for (int i = 0; i < attrs.size(); i++) {
            L5ExcelDto attr = attrs.get(i);
            String sheetName = "业务属性";
            String lineNo = String.valueOf(i+1);
            this.checkImportAttr(lineNo, result, attr, sheetName, domainMap);
            List<ArchyObject> archyObjects = archyObjectDao.findArchyObjectByName(attr.getObjectName());
            if (CollectionUtils.isEmpty(archyObjects)) {
                ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "不存在【" + attr.getObjectName() + "】业务对象", attr);
                result.addArchyObjectL4L5Error(errorDto);
            }
            String uniqueName = attr.getObjectName() + attr.getEntityName();
            L4ExcelDto l4ExcelDto = tobeImportEntityMap.get(uniqueName);
            if(l4ExcelDto == null){
                ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "找不到表【" + attr.getEntityName() + "】", attr);
                result.addArchyObjectL4L5Error(errorDto);
            }
            l4ExcelDto.addSubAttr(attr);
        }
        logger.info("业务属性数据校验完成");

        //校验表下有没有字段，没有字段的表要报错
        for (L4ExcelDto l4 : tobeImportEntityMap.values()) {
            if(CollectionUtils.isEmpty(l4.getSubAttrs())){
                ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto("逻辑数据实体", "1", "表【" + l4.getEntityName()+"】下没有字段（系统未找到模板中是哪行数据有问题，请人工确认）", l4);
                for (int i=0; i<entities.size(); i++) {
                    L4ExcelDto l4ExcelDto = entities.get(i);
                    if (l4.equals(l4ExcelDto)) {
                        String lineNo = String.valueOf(i+2);
                        errorDto.setLineNo(lineNo);
                        errorDto.setErrorMsg("表【" + l4.getEntityName()+"】下没有字段");
                        break;
                    }
                }
                result.addArchyObjectL4L5Error(errorDto);
            }
        }

        if (result.getArchyObjectL4L5ErrorMap() != null && !result.getArchyObjectL4L5ErrorMap().isEmpty()) {
            logger.info("存在问题数据，停止导入，开始保存问题数据文件");
            try {
                result.setSuccess(0L);
                result.setFailed((long) result.getArchyObjectL4L5ErrorMap().size());
                result.setFileId(getProblemFile(result.getArchyObjectL4L5ErrorMap(), AuthTools.currentUsername(), filePath));
            } catch (Exception e) {
                throw new RuntimeException("保存错误文件失败，", e);
            }
            return result;
        }

        logger.info("开始导入......");

        HashMap<String, List<DdmL4ExcelDto>> l3AndEntityMap = new HashMap<>();
        for (L4ExcelDto value : tobeImportEntityMap.values()) {
            List<DdmL4ExcelDto> ddmL4ExcelDtos = l3AndEntityMap.computeIfAbsent(value.getObjectName(), k -> new ArrayList<>());
            DdmL4ExcelDto ddmL4ExcelDto = this.coverDdmL4ExcelDto(value, categoryMap, domainMap);
            ddmL4ExcelDtos.add(ddmL4ExcelDto);
        }

        for (Map.Entry<String, List<DdmL4ExcelDto>> entry : l3AndEntityMap.entrySet()) {
            String objectName = entry.getKey();
            List<ArchyObject> archyObjects = archyObjectDao.findArchyObjectByName(objectName);

            ArchyObject archyObject = archyObjects.get(0);
            Long modelId = archyObject.getLogicalModelId();
            String archyId = archyObject.getId();
            String username = AuthTools.currentUsername();
            datablauRemoteDdmModelServiceNew.syncUpdateDDMModelX(username, modelId, archyId, entry.getValue());
        }
        result.setSuccess((long) (entities.size() + attrs.size()));
        result.setFailed(0L);

        return result;
    }

    private L5ExcelDto covertToL5ExcelDto(HashMap<String, String> d) {
        L5ExcelDto l5ExcelDto = new L5ExcelDto();
        l5ExcelDto.setObjectName(d.get("业务对象中文名"));
        l5ExcelDto.setEntityName(d.get("逻辑实体中文名"));
        l5ExcelDto.setAttrName(d.get("属性中文名"));
        l5ExcelDto.setAttrEnglishName(d.get("属性英文名"));
        l5ExcelDto.setAttrDescription(d.get("业务定义"));
        l5ExcelDto.setAttrNull(d.get("是否必填"));
        l5ExcelDto.setAttrDomainName(d.get("标准数据元中文名"));
        l5ExcelDto.setAttrPk(d.get("主键"));
        l5ExcelDto.setAttrDefaultValue(d.get("默认值"));
        l5ExcelDto.setAttrDataType(d.get("属性数据类型"));
        return l5ExcelDto;
    }

    private L4ExcelDto covertToL4ExcelDto(HashMap<String, String> data) {
        L4ExcelDto l4ExcelDto = new L4ExcelDto();
        l4ExcelDto.setObjectName(data.get("业务对象中文名"));
        l4ExcelDto.setEntityCode(data.get("逻辑数据实体编码"));
        l4ExcelDto.setEntityName(data.get("逻辑数据实体中文名"));
        l4ExcelDto.setEntityEnglishName(data.get("逻辑数据实体英文名"));
        l4ExcelDto.setEntityDescription(data.get("逻辑数据实体定义"));
        l4ExcelDto.setEntitySourceSystem(data.get("来源系统"));
        l4ExcelDto.setEntityDataSteward(data.get("数据管家"));
        l4ExcelDto.setEntityDataClassification(data.get("数据分类"));
        return l4ExcelDto;
    }

    public String getProblemFile(Map<String, ArchyObjectL4L5ErrorDto> archyObjectL4L5ErrorMap, String userName, String filePath) throws Exception {

        if (archyObjectL4L5ErrorMap == null || archyObjectL4L5ErrorMap.isEmpty()) {
            return null;
        }

        String res = "";
        // 直接使用传入的文件路径
        File originFile = new File(filePath);

        Map<Integer, String> entityErrorMap = new HashMap<>();
        Map<Integer, String> attrErrorMap = new HashMap<>();

        for (String key : archyObjectL4L5ErrorMap.keySet()) {
            if (key.startsWith("逻辑数据实体")) {
                entityErrorMap.put(Integer.parseInt(key.split("-")[1]), archyObjectL4L5ErrorMap.get(key).getErrorMsg());
            } else if (key.startsWith("业务属性")) {
                attrErrorMap.put(Integer.parseInt(key.split("-")[1]), archyObjectL4L5ErrorMap.get(key).getErrorMsg());
            }
        }

        String filename = "业务对象导入错误数据清单.xlsx";
        File outputFile = new File(filename);

        try (FileInputStream fileInputStream = new FileInputStream(originFile);
             XSSFWorkbook workbook = new XSSFWorkbook(fileInputStream)) {

            //逻辑数据实体sheet页
            if (entityErrorMap.size() > 0) {
                Sheet sheet = workbook.getSheetAt(0);
                if (sheet == null) {
                    throw new InvalidArgumentException("模板不正确: 逻辑数据实体sheet页不存在");
                }
                com.datablau.data.common.util.ExcelUtil.fillingImportError(workbook, 0, entityErrorMap, false);
            }
            //业务属性sheet页
            if (attrErrorMap.size() > 0) {
                Sheet sheet = workbook.getSheetAt(1);
                if (sheet == null) {
                    throw new InvalidArgumentException("模板不正确: 业务属性sheet页不存在");
                }
                com.datablau.data.common.util.ExcelUtil.fillingImportError(workbook, 1, attrErrorMap, false);
            }

            try (FileOutputStream fos = new FileOutputStream(outputFile)) {
                workbook.write(fos);
            } catch (IOException e) {
                e.printStackTrace();
            }

            FileDescriptor fileDescriptor = datablauFileUtil.uploadFileToRemote(outputFile,
                    filename, userName, false);

            res = fileDescriptor.getFileId();

        } catch (Exception e) {
            throw new InvalidArgumentException(e.getMessage());
        } finally {
            // 清理输出文件
            if (outputFile != null && outputFile.exists()) {
                outputFile.delete();
            }
        }
        return res;
    }

    private DdmL4ExcelDto coverDdmL4ExcelDto(L4ExcelDto value, Map<String, ModelCategoryDto> categoryMap, Map<String, DomainDto> domainMap) {
        DdmL4ExcelDto res = new DdmL4ExcelDto();
        res.setObjectName(value.getObjectName());
        res.setEntityCode(value.getEntityCode());
        res.setEntityName(value.getEntityName());
        res.setEntityEnglishName(value.getEntityEnglishName());
        res.setEntityDescription(value.getEntityDescription());
        res.setEntityDataSteward(value.getEntityDataSteward());
        res.setEntityDataClassification(value.getEntityDataClassification());
        ModelCategoryDto categoryDto = categoryMap.get(value.getEntitySourceSystem());
        res.setEntitySourceSystem(String.valueOf(categoryDto.getCategoryId()));
        for (L5ExcelDto subAttr : value.getSubAttrs()) {
            DdmL5ExcelDto subDdm = new DdmL5ExcelDto();
            subDdm.setObjectName(subAttr.getObjectName());
            subDdm.setEntityName(subAttr.getEntityName());
            subDdm.setAttrName(subAttr.getAttrName());
            subDdm.setAttrEnglishName(subAttr.getAttrEnglishName());
            subDdm.setAttrDescription(subAttr.getAttrDescription());
            if("是".equals(subAttr.getAttrNull())){
                subDdm.setAttrNull("true");
            }else {
                subDdm.setAttrNull("false");
            }
//            subDdm.setAttrNull(subAttr.getAttrNull());
            subDdm.setAttrPk(subAttr.getAttrPk());
            subDdm.setAttrDefaultValue(subAttr.getAttrDefaultValue());
            subDdm.setAttrDataType(subAttr.getAttrDataType());
            DomainDto domainDto = domainMap.get(subAttr.getAttrDomainName());
            if(domainDto != null){
                subDdm.setAttrDomainId(domainDto.getDomainId());
            }
            res.addSubAttr(subDdm);
        }
        return res;
    }

    private void checkImportAttr(String lineNo, ArchyObjectL4L5ImportResultDto result, L5ExcelDto attr, String sheetName, Map<String, DomainDto> domainMap) {
        // 业务对象中文名
        if (Strings.isNullOrEmpty(attr.getObjectName())) {
            ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "业务对象中文名不能为空", attr);
            result.addArchyObjectL4L5Error(errorDto);
        }
        //业务对象中文名称不能有特殊字符（中文+字母+数字以外的都不可以）
        if (!CheckNameUtil.checkChineseName(attr.getObjectName())) {
            ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "业务对象中文名称不能有特殊字符（中文+字母+数字以外的都不可以）", attr);
            result.addArchyObjectL4L5Error(errorDto);
        }
        //业务对象中文名称长度不能超过15位
        if (CheckNameUtil.checkChineseNameLength(attr.getObjectName(), 15)) {
            ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "业务对象中文名称长度不能超过15位", attr);
            result.addArchyObjectL4L5Error(errorDto);
        }
        //校验逻辑实体中文名
        if (Strings.isNullOrEmpty(attr.getEntityName())) {
            ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "逻辑数据实体中文名不能为空", attr);
            result.addArchyObjectL4L5Error(errorDto);
        }
        //逻辑数据实体中文名称不能有特殊字符（中文+字母+数字以外的都不可以）
        if (!CheckNameUtil.checkChineseName(attr.getEntityName())) {
            ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "逻辑数据实体中文名称不能有特殊字符（中文+字母+数字以外的都不可以）", attr);
            result.addArchyObjectL4L5Error(errorDto);
        }
        //逻辑数据实体中文名称长度不能超过15位
        if (CheckNameUtil.checkChineseNameLength(attr.getEntityName(), 15)) {
            ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "逻辑数据实体中文名称长度不能超过15位", attr);
            result.addArchyObjectL4L5Error(errorDto);
        }
        // 属性中文名
        if (Strings.isNullOrEmpty(attr.getAttrName())) {
            ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "属性中文名不能为空", attr);
            result.addArchyObjectL4L5Error(errorDto);
        }
        //属性中文名称不能有特殊字符（中文+字母+数字以外的都不可以）
        if (!CheckNameUtil.checkChineseName(attr.getAttrName())) {
            ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "属性中文名称不能有特殊字符（中文+字母+数字以外的都不可以）", attr);
            result.addArchyObjectL4L5Error(errorDto);
        }
        //属性中文名称长度不能超过15位
        if (CheckNameUtil.checkChineseNameLength(attr.getAttrName(), 15)) {
            ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "属性中文名称长度不能超过15位", attr);
            result.addArchyObjectL4L5Error(errorDto);
        }

        // 属性英文名
        if (Strings.isNullOrEmpty(attr.getAttrEnglishName())) {
            ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "属性英文名不能为空", attr);
            result.addArchyObjectL4L5Error(errorDto);
        }else {
            String englishNameStyle = CheckNameUtil.checkEnglishNameStyle(attr.getAttrEnglishName());
            if(!Strings.isNullOrEmpty(englishNameStyle)){
                ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, englishNameStyle, attr);
                result.addArchyObjectL4L5Error(errorDto);
            }
        }

        // 业务定义
        if (Strings.isNullOrEmpty(attr.getAttrDescription())) {
            ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "业务定义不能为空", attr);
            result.addArchyObjectL4L5Error(errorDto);
        }
        // 是否为空
        if (Strings.isNullOrEmpty(attr.getAttrNull())) {
            ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "是否必填不能为空", attr);
            result.addArchyObjectL4L5Error(errorDto);
        }

        // 属性数据类型
        if (Strings.isNullOrEmpty(attr.getAttrDataType())) {
            ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "属性数据类型不能为空", attr);
            result.addArchyObjectL4L5Error(errorDto);
        }

        //校验数据标准是否存在
        if(!Strings.isNullOrEmpty(attr.getAttrDomainName())){
            DomainDto domainDto = domainMap.get(attr.getAttrDomainName());
            if(domainDto == null){
                ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "标准数据元【" + attr.getAttrDomainName() + "】不存在", attr);
                result.addArchyObjectL4L5Error(errorDto);
            }
        }
    }

    private void checkImportEntity(String lineNo, ArchyObjectL4L5ImportResultDto result, L4ExcelDto entity, String sheetName, Set<String> uniqueEntityName, Set<String> uniqueEntityEnglishName) {
        //校验业务对象中文名
        if (Strings.isNullOrEmpty(entity.getObjectName())) {
            ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "业务对象中英文名不能为空", entity);
            result.addArchyObjectL4L5Error(errorDto);
        }
        //业务对象中文名称不能有特殊字符（中文+字母+数字以外的都不可以）
        if (!CheckNameUtil.checkChineseName(entity.getObjectName())) {
            ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "业务对象中文名称不能有特殊字符（中文+字母+数字以外的都不可以）", entity);
            result.addArchyObjectL4L5Error(errorDto);
        }
        //业务对象中文名称长度不能超过15位
        if (CheckNameUtil.checkChineseNameLength(entity.getObjectName(), 15)) {
            ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "业务对象中文名称长度不能超过15位", entity);
            result.addArchyObjectL4L5Error(errorDto);
        }
        //校验逻辑数据实体中文名
        if (Strings.isNullOrEmpty(entity.getEntityName())) {
            ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "逻辑数据实体中文名不能为空", entity);
            result.addArchyObjectL4L5Error(errorDto);
        }
        //逻辑数据实体中文名称不能有特殊字符（中文+字母+数字以外的都不可以）
        if (!CheckNameUtil.checkChineseName(entity.getEntityName())) {
            ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "逻辑数据实体中文名称不能有特殊字符（中文+字母+数字以外的都不可以）", entity);
            result.addArchyObjectL4L5Error(errorDto);
        }
        //逻辑数据实体中文名称长度不能超过15位
        if (CheckNameUtil.checkChineseNameLength(entity.getEntityName(), 15)) {
            ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "逻辑数据实体中文名称长度不能超过15位", entity);
            result.addArchyObjectL4L5Error(errorDto);
        }
        //校验逻辑数据实体英文名
        if (Strings.isNullOrEmpty(entity.getEntityEnglishName())) {
            ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "逻辑数据实体英文名不能为空", entity);
            result.addArchyObjectL4L5Error(errorDto);
        }else {
            String englishNameStyle = CheckNameUtil.checkEnglishNameStyle(entity.getEntityEnglishName());
            if(!Strings.isNullOrEmpty(englishNameStyle)){
                ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, englishNameStyle, entity);
                result.addArchyObjectL4L5Error(errorDto);
            }
        }

        //校验逻辑数据实体定义
        if (Strings.isNullOrEmpty(entity.getEntityDescription())) {
            ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "逻辑数据实体定义不能为空", entity);
            result.addArchyObjectL4L5Error(errorDto);
        }
        //校验来源系统
        if (Strings.isNullOrEmpty(entity.getEntitySourceSystem())) {
            ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "来源系统不能为空", entity);
            result.addArchyObjectL4L5Error(errorDto);
        }
        //校验数据管家
        if (Strings.isNullOrEmpty(entity.getEntityDataSteward())) {
            ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "数据管家不能为空", entity);
            result.addArchyObjectL4L5Error(errorDto);
        }
        //校验数据分类
        if (Strings.isNullOrEmpty(entity.getEntityDataClassification())) {
            ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "数据分类不能为空", entity);
            result.addArchyObjectL4L5Error(errorDto);
        }
        //校验同一个业务对象下的逻辑实体中文重复
        String uniqueName = entity.getObjectName() + entity.getEntityName();
        if (uniqueEntityName.contains(uniqueName)) {
            ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "逻辑实体名中文名重复", entity);
            result.addArchyObjectL4L5Error(errorDto);
        } else {
            uniqueEntityName.add(uniqueName);
        }
        //校验同一个业务对象下的逻辑实体英文重复
        String uniqueEnglishName = entity.getObjectName() + entity.getEntityEnglishName();
        if (uniqueEntityEnglishName.contains(uniqueEnglishName)) {
            ArchyObjectL4L5ErrorDto errorDto = new ArchyObjectL4L5ErrorDto(sheetName, lineNo, "逻辑实体名英文名重复", entity);
            result.addArchyObjectL4L5Error(errorDto);
        } else {
            uniqueEntityEnglishName.add(uniqueEnglishName);
        }
    }

    private Set<Long> getPrimaryKey(List<DdmModelElementDto> modelElements, boolean proto){
        Set<Long> primaryKey = new HashSet<>();
        for (DdmModelElementDto modelElement : modelElements) {
            if ((modelElement.getTypeId() == LDMTypes.oKeyGroup) || (modelElement.getTypeId() == LDMTypes.oKeyGroupMember)) {
                ObjectX keyGroup = ElementUtils.getObjectXFromData(modelElement.getData(), proto);
                String keyType = keyGroup.getPropertyStringValue(LDMTypes.pKeyGroupType);
                if ("PrimaryKey".equals(keyType)) {
                    String memberRefs = keyGroup.getPropertyStringValue(LDMTypes.pKeyGroupMemberRefs);
                    if (!Strings.isNullOrEmpty(memberRefs)) {
                        for (String s : memberRefs.split(",")) {
                            for (DdmModelElementDto e : modelElements) {
                                if (e.getElementId().equals(Long.valueOf(s))) {
                                    ObjectX member = ElementUtils.getObjectXFromData(e.getData(), true);
                                    primaryKey.add(member.getPropertyLongValue(LDMTypes.pAttributeRef));
                                }
                            }
                        }
                    }
                }
            }
        }
        return primaryKey;
    }

    public CompareResultDto getElementsChangesBetweenTwoVersions(Long modelId, Long baseVerId, Long targetVerId, boolean showAll, String archyName) throws Exception {

        List<DdmModelElementDto> modelElements = ddmModelService.getDdmModelElements(modelId, null,
                Set.of(LDMTypes.oEntity, LDMTypes.oAttribute, LDMTypes.oKeyGroup, LDMTypes.oKeyGroupMember));

        Map<Long, DdmModelElementDto> modelElementMap = modelElements.stream().collect(Collectors.toMap(DdmModelElementDto::getElementId, a -> a));

        DdmModelDto model = datablauRemoteDdmModelServiceNew.getDdmModels(List.of(modelId)).get(0);
        Set<Long> primaryKey = this.getPrimaryKey(modelElements, model.getUseProto());

        //获取两个版本对比信息
        String changeStr = datablauRemoteDdmModelServiceNew.getElementsChangesBetweenTwoVersions(modelId, baseVerId, targetVerId, showAll);
        ObjectMapper mapper = new ObjectMapper();
        VersionElementChangesDto change = mapper.readValue(changeStr, VersionElementChangesDto.class);


        //只有CP没有PP没有变化证明是新增，都有证明是更新，只有PP没有CP是删除
        ArrayList<TableCompareResultDto> tableResults = new ArrayList<>();
        ArrayList<ColumnCompareResultDto> columnResults = new ArrayList<>();
        List<ElementChangesDto> elements = change.getElements();
        if(!CollectionUtils.isEmpty(elements)){
            for (ElementChangesDto element : elements) {
                if("Entity".equals(element.getTypeName())){
                    //处理一个表下的
                    this.getTableCompareResultDto(element, archyName, tableResults, columnResults, modelElementMap, primaryKey, model.getUseProto());
                }

                if("Attribute".equals(element.getTypeName())){
                    //处理只有字段的
                    Long parentId = element.getParentId();
                    DdmModelElementDto tableElement = modelElementMap.get(parentId);
                    if(tableElement == null){
                        throw new RuntimeException("字段id【" + element.getElementId() +"】找不到对应的表id【" + parentId + "】");
                    }
                    ColumnCompareResultDto columnResult = this.getColumnCompareResultDto(element, modelElementMap, primaryKey, model.getUseProto(), archyName, tableElement.getName());
                    columnResults.add(columnResult);
                }
            }
        }
        CompareResultDto res = new CompareResultDto();
        res.setTableResults(tableResults);
        res.setColumnResults(columnResults);
        return res;
    }

    public void getTableCompareResultDto(ElementChangesDto element, String archyName, List<TableCompareResultDto> tableResults, List<ColumnCompareResultDto> columnResults,
                                                          Map<Long, DdmModelElementDto> modelElementMap, Set<Long> primaryKey, boolean proto){
        //只有CP没有PP，新增
        if((!CollectionUtils.isEmpty(element.getCurrentProperties())) && (CollectionUtils.isEmpty(element.getPreviousProperties()))){
            TableCompareResultDto tableResult = new TableCompareResultDto();
            tableResult.setType("新增");
            tableResult.setObjectName(archyName);
            Map<String, String> cp = element.getCurrentProperties();
            tableResult.setTableName(cp.get("Name"));
            tableResult.setTableChName(cp.get("LogicalName"));
            tableResult.setDefinition(cp.get("Definition"));
            tableResults.add(tableResult);

            for (ElementChangesDto sub : element.getSub()) {
                if("Attribute".equals(sub.getTypeName())){
                    ColumnCompareResultDto columnResult = this.getColumnCompareResultDto(sub, modelElementMap, primaryKey, proto, archyName, tableResult.getTableName());
                    columnResults.add(columnResult);
                }
            }
        }

        //都有证明是更新
        if((!CollectionUtils.isEmpty(element.getCurrentProperties())) && (!CollectionUtils.isEmpty(element.getPreviousProperties()))){
            TableCompareResultDto tableResult = new TableCompareResultDto();
            tableResult.setType("修改");
            tableResult.setObjectName(archyName);
            Map<String, String> cp = element.getCurrentProperties();
            tableResult.setTableName(cp.get("Name"));
            tableResult.setTableChName(cp.get("LogicalName"));
            tableResult.setDefinition(cp.get("Definition"));
            tableResults.add(tableResult);

            for (ElementChangesDto sub : element.getSub()) {
                if("Attribute".equals(sub.getTypeName())){
                    ColumnCompareResultDto columnResult = this.getColumnCompareResultDto(sub, modelElementMap, primaryKey, proto, archyName, tableResult.getTableName());
                    columnResults.add(columnResult);
                }
            }
        }

        //只有PP没有CP是删除
        if((CollectionUtils.isEmpty(element.getCurrentProperties())) && (!CollectionUtils.isEmpty(element.getPreviousProperties()))){
            TableCompareResultDto tableResult = new TableCompareResultDto();
            tableResult.setType("删除");
            tableResult.setObjectName(archyName);
            Map<String, String> pp = element.getPreviousProperties();
            tableResult.setTableName(pp.get("Name"));
            tableResult.setTableChName(pp.get("LogicalName"));
            tableResult.setDefinition(pp.get("Definition"));
            tableResults.add(tableResult);

            for (ElementChangesDto sub : element.getSub()) {
                if("Attribute".equals(sub.getTypeName())){
                    ColumnCompareResultDto columnResult = this.getColumnCompareResultDto(sub, modelElementMap, primaryKey, proto, archyName, tableResult.getTableName());
                    columnResults.add(columnResult);
                }
            }
        }
    }

    public ColumnCompareResultDto getColumnCompareResultDto(ElementChangesDto element, Map<Long, DdmModelElementDto> modelElementMap, Set<Long> primaryKey,
                                                            boolean porto, String archyName, String tableName) {
        ColumnCompareResultDto res = null;
        //只有CP没有PP，新增
        if((!CollectionUtils.isEmpty(element.getCurrentProperties())) && (CollectionUtils.isEmpty(element.getPreviousProperties()))){
            res = this.getColumnBase(element, modelElementMap, primaryKey, porto, archyName, tableName, element.getCurrentProperties());
            res.setType("新增");
        }

        //都有证明是更新
        if((!CollectionUtils.isEmpty(element.getCurrentProperties())) && (!CollectionUtils.isEmpty(element.getPreviousProperties()))){
            res = this.getColumnBase(element, modelElementMap, primaryKey, porto, archyName, tableName, element.getCurrentProperties());
            res.setType("修改");
        }

        //只有PP没有CP是删除
        if((CollectionUtils.isEmpty(element.getCurrentProperties())) && (!CollectionUtils.isEmpty(element.getPreviousProperties()))){
            //删除的情况下，取上一个版本的数据
            res = this.getColumnBase(element, modelElementMap, primaryKey, porto, archyName, tableName, element.getPreviousProperties());
            res.setType("删除");
        }
        return res;
    }

    private ColumnCompareResultDto getColumnBase(ElementChangesDto element, Map<Long, DdmModelElementDto> modelElementMap, Set<Long> primaryKey,
                                                 boolean porto, String archyName, String tableName, Map<String, String> properties){
        ColumnCompareResultDto res = new ColumnCompareResultDto();
        Long elementId = element.getElementId();
        DdmModelElementDto elementDto = modelElementMap.get(elementId);
        if(elementDto == null){
            throw new RuntimeException("找不到id是" + elementId + "的元数据");
        }
        ObjectX objectX = ElementUtils.getObjectXFromData(elementDto.getData(), porto);
        //业务对象名称
        res.setObjectName(archyName);
        //实体名
        res.setTableName(tableName);
        //属性名
        res.setColumnName(properties.get("Name"));
        //属性中文名
        res.setColumnChName(properties.get("LogicalName"));
        //属性英文名
        res.setColumnEnName(properties.get("EnName"));
        //属性数据类型
        res.setDataType(properties.get("DataType"));
        //属性定义
        res.setDefinition(properties.get("Definition"));
        //主键
        if(primaryKey.contains(elementId)){
            res.setPk("Y");
        }else {
            res.setPk("N");
        }
        //非空
        Object isNotNull = objectX.getProperty(LDMTypes.pIsNotNull);
        if (isNotNull != null) {
            res.setNotNull("Y");
        }else {
            res.setNotNull("N");
        }
        //默认值
        Object defaultValue = objectX.getProperty(LDMTypes.pDefaultValue);
        if (defaultValue != null) {
            res.setDefaultValue(String.valueOf(defaultValue));
        }
        return res;
    }
}
