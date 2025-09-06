package com.datablau.archy.server.service.impl;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.model.LDMTypes;
import com.datablau.archy.common.enums.ArchyState;
import com.datablau.archy.server.enums.ProcessType;
import com.datablau.archy.server.jpa.entity.ArchyObject;
import com.datablau.archy.server.jpa.entity.ArchySubject;
import com.datablau.archy.server.jpa.entity.ArchySubjectExt;
import com.datablau.archy.server.jpa.repository.ArchyObjectExtRepository;
import com.datablau.archy.server.jpa.repository.ArchyObjectRepository;
import com.datablau.archy.server.jpa.repository.ArchyObjectVersionExtRepository;
import com.datablau.archy.server.jpa.repository.ArchySubjectExtRepository;
import com.datablau.archy.server.jpa.repository.ArchySubjectRepository;
import com.datablau.archy.server.service.ArchyObjectService;
import com.datablau.archy.server.service.ArchySubjectService;
import com.datablau.model.common.api.DatablauRemoteDdmModelService;
import com.datablau.model.common.dto.ArchyGenModelDto;
import com.datablau.model.common.dto.ArchyGenResultDto;
import com.datablau.project.api.DatablauRemoteDdmModelServiceNew;
import com.datablau.project.api.RemoteArchyExtendService;
import com.datablau.project.dto.DataAssetForArchySubjectDto;
import org.redisson.api.RedissonClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service("remoteArchyExtendService")
public class RemoteArchyExtendServiceImpl implements RemoteArchyExtendService {
    protected static final Logger logger = LoggerFactory.getLogger(RemoteArchyExtendServiceImpl.class);

    @Autowired
    ArchySubjectService archySubjectService;
    @Autowired
    ArchySubjectExtRepository subjectExtRepository;
    @Autowired
    ArchySubjectRepository archySubjectDao;
    @Autowired
    ArchyObjectService archyObjectService;
    @Autowired
    ArchyObjectExtRepository archyObjectExtRepository;
    @Autowired
    ArchyObjectRepository archyObjectDao;
    @Autowired
    ArchyObjectVersionExtRepository archyObjectVersionExtDao;
    @Autowired
    RedissonClient redissonClient;
    @Autowired
    DatablauRemoteDdmModelService ddmModelService;
    @Autowired
    DatablauRemoteDdmModelServiceNew datablauRemoteDdmModelServiceNew;
    @Autowired
    private ArchyObjectExtendServiceImpl archyObjectExtendServiceImpl;


    @Override
    @Transactional
    public void createDataAssetForArchySubject(DataAssetForArchySubjectDto dataAsseDto, String username) {
        ArchySubject subject = new ArchySubject();
        subject.setName(dataAsseDto.getCatalogName());
        subject.setCode(dataAsseDto.getCode());
        subject.setAlias(dataAsseDto.getEnglishName());
        subject.setOwner(username);

        //处理parentId，资产那边parentId是0则证明是一级目录
        if (dataAsseDto.getDamParentId().equals(0L)) {
            List<ArchySubject> rootArchySub = archySubjectDao.findArchySubjectByParentId(0L);
            subject.setParentId(rootArchySub.get(0).getId());
        } else {
            //如果不是一级目录，则从ArchySubjectExt扩展表里把数据查出来
            ArchySubjectExt subjectExt = subjectExtRepository.findByDamIdAndType(dataAsseDto.getDamParentId(), 0);
            ArchySubject subjectById = archySubjectDao.findArchySubjectById(subjectExt.getArchyId());
            subject.setParentId(subjectById.getId());
        }

        ArchySubject save = archySubjectService.createArchySubject(subject);

        ArchySubjectExt archySubjectExt = new ArchySubjectExt();
        archySubjectExt.setArchyId(save.getId());
        archySubjectExt.setDamId(dataAsseDto.getDamId());
        archySubjectExt.setDamParentId(dataAsseDto.getDamParentId());
        archySubjectExt.setType(0);
        archySubjectExt.setPublishState(dataAsseDto.getPublishState());
        subjectExtRepository.save(archySubjectExt);
    }

    @Override
    public void importArchySubject(DataAssetForArchySubjectDto dataAsseDto, String username) {
        ArchySubjectExt subjectExt = subjectExtRepository.findByDamIdAndType(dataAsseDto.getDamId(), 0);
        if(subjectExt == null){
            this.createDataAssetForArchySubject(dataAsseDto, username);
        }else {
            this.updateDataAssetForArchySubject(dataAsseDto);
        }
    }

    @Override
    public void importArchyObject(DataAssetForArchySubjectDto dataAsseDto, String username) {
        ArchySubjectExt subExt = subjectExtRepository.findByDamIdAndType(dataAsseDto.getDamId(), 1);
        if(subExt == null){
            this.createataAssetForArchyObject(dataAsseDto, username);
        }else {
            this.updateDataAssetForArchyObject(dataAsseDto);
        }
    }

    @Override
    @Transactional
    public void createataAssetForArchyObject(DataAssetForArchySubjectDto dataAsseDto, String userName) {
        ArchyObject archyObject = new ArchyObject();
        archyObject.setName(dataAsseDto.getCatalogName());
        archyObject.setCode(dataAsseDto.getCode());
        archyObject.setAlias(dataAsseDto.getEnglishName());
        archyObject.setOwner(userName);

        ArchySubjectExt subjectExt = subjectExtRepository.findByDamIdAndType(dataAsseDto.getDamParentId(), 0);
        archyObject.setSubjectId(subjectExt.getArchyId());

        ArchyObject saved = archyObjectService.createArchyObject(archyObject);

        //创建模型
        ArchyGenResultDto result = this.createModel(saved, userName);
        if(result != null){
            saved.setLogicalModelId(result.getModelId());
            saved.setLogicalModelVersionId(result.getModelVersionId());
            saved.setReleaseTime(new Date());
            archyObjectDao.save(saved);
            // 清除缓存
            redissonClient.getList("archy:object:allReleaseObject").clear();
        }

        ArchySubjectExt ext = new ArchySubjectExt();
        ext.setArchyObjectId(saved.getId());
        ext.setDamId(dataAsseDto.getDamId());
        ext.setDamParentId(dataAsseDto.getDamParentId());
        ext.setType(1);
        ext.setPublishState(dataAsseDto.getPublishState());
        subjectExtRepository.save(ext);
    }

    private ArchyGenResultDto createModel(ArchyObject save, String userName) {
        ArchyGenModelDto genModelDto = new ArchyGenModelDto();
        genModelDto.setUserName(userName);
        genModelDto.setName(save.getName());
        //目录一会实现:genModelDto.setPath(archyObjectExcel.getPathList());
        LinkedList<String> pathList = this.getPathListBySubId(save.getSubjectId());
        genModelDto.setPath(pathList);

        Map<Long, String> properties = new HashMap<>();
        properties.put(LDMTypes.pArchyObjectRef, save.getId());//业务对象主键
        //业务对象名称
        properties.put(LDMTypes.pArchyObjectName, save.getName());
//        //目的
//        properties.put(LDMTypes.pTarget, archyObjectExcel.getPurpose());
//        //范围
//        properties.put(LDMTypes.pScope, archyObjectExcel.getScope());
//        //业务定义
//        properties.put(LDMTypes.pDefinition, archyObjectExcel.getDefinition());
//        //包含
//        properties.put(LDMTypes.pInclusions, archyObjectExcel.getInclude());
//        //不包含
//        properties.put(LDMTypes.pExclusions, archyObjectExcel.getExclude());
//        List<String> pathList = archyObjectExcel.getPathList();
        //目录名
        properties.put(LDMTypes.pFolderName, pathList.get(pathList.size() - 1));
        genModelDto.setProperties(properties);
        ArchyGenResultDto result = null;
        try {
            logger.info("创建[{}]对应的模型", save.getName());
            result = ddmModelService.generateArchyObjectModel(genModelDto);
//            datablauRemoteDdmModelServiceNew.test(genModelDto);
        } catch (Exception e) {
            logger.error("创建[{}]模型失败{}", save.getName(), e.getMessage());
        }
        return result;
    }

    //根据subjectId获取目录层级
    private LinkedList<String> getPathListBySubId(Long subId){
        LinkedList<String> pathLists = new LinkedList<>();

        ArchySubject subjectById = archySubjectDao.findArchySubjectById(subId);
        Long parentId = 0L;
        if(subjectById != null){
            parentId = subjectById.getParentId();
            pathLists.addFirst(subjectById.getName());
        }

        while (parentId != 0L){
            ArchySubject parentSub = archySubjectDao.findArchySubjectById(parentId);
            if(parentSub != null){
                parentId = parentSub.getParentId();
                pathLists.addFirst(parentSub.getName());
            }else {
                parentId = 0L;
            }
        }
        return pathLists;
    }

    @Override
    @Transactional
    public void deleteArchyByDataCatalog(Long damId, int type) {
        ArchySubjectExt subjectExt = subjectExtRepository.findByDamIdAndType(damId, type);
        if (subjectExt == null) {
            return;
        }
        //L1、L2时删除目录要级联删除包括业务对象
        if (type == 0) {
            Long archyId = subjectExt.getArchyId();
            ArchySubject archySubjectSaved = archySubjectDao.findArchySubjectById(archyId);
            if(archySubjectSaved == null){
                return;
            }
            //因为不是L1就是L2，所以archySubjectSaved + subSubject就可以代表自己的目录加所有子级目录
            List<ArchySubject> subSubjects = archySubjectDao.findArchySubjectByParentId(archyId);

            ArrayList<Long> subjectIds = new ArrayList<>();
            subjectIds.add(archySubjectSaved.getId());
            if (!CollectionUtils.isEmpty(subSubjects)) {
                subjectIds.addAll(subSubjects.stream().map(ArchySubject::getId).toList());
            }

            //L2下的业务对象
            List<ArchyObject> archyObjects = archyObjectExtRepository.findArchyObjectsBySubjectIds(subjectIds);
            if (!CollectionUtils.isEmpty(archyObjects)) {
                ArrayList<String> extArchyObjectIds = new ArrayList<>();
                //有业务对象先删业务对象
                List<String> archyObjectIds = archyObjects.stream().map(ArchyObject::getId).collect(Collectors.toList());
                for (String archyObjectId : archyObjectIds) {
                    this.deleteArchyObject(archyObjectId);
                    extArchyObjectIds.add(archyObjectId);
                }
                subjectExtRepository.deleteByArchyObjectId(extArchyObjectIds);
            }
            archySubjectDao.deleteAllById(subjectIds);
            subjectExtRepository.deleteByArchySubId(subjectIds);
        }

        //L3是直接删除业务对象
        if (type == 1) {
            String archyObjectId = subjectExt.getArchyObjectId();
            this.deleteArchyObject(archyObjectId);
            subjectExtRepository.deleteByArchyObjectId(Collections.singletonList(archyObjectId));
        }
        redissonClient.getMap("archy:subject:allSubject").clear();
        redissonClient.getList("archy:subject:rootSubject").clear();
        redissonClient.getList("archy:object:allReleaseObject").clear();
    }

    //删除业务对象。当业务对象中存在逻辑实体时禁止删除所在的业务域、主题域、业务对象。
    private void deleteArchyObject(String archyObjectId) {
        ArchyObject archyObjectSaved = archyObjectDao.findArchyObjectById(archyObjectId);
        if(archyObjectSaved == null){
            return;
        }
        if(archyObjectSaved.getLogicalModelId() != null){
            datablauRemoteDdmModelServiceNew.deleteModelById(archyObjectSaved.getLogicalModelId());
        }
        archyObjectDao.deleteById(archyObjectId);
        archyObjectVersionExtDao.deleteArchyObjectVersionByObjectId(archyObjectId);
    }


    @Override
    public List<String> getArchyCatalogTree() {
        System.out.println("测试远程Archy");
        return List.of();
    }

    @Override
    @Transactional
    public void updateDataAssetForArchySubject(DataAssetForArchySubjectDto subDto) {
        ArchySubjectExt subExt = subjectExtRepository.findByDamIdAndType(subDto.getDamId(), 0);
        //已经保存的主题
        ArchySubject archySubjectSaved = this.archySubjectDao.findArchySubjectById(subExt.getArchyId());
        if (archySubjectSaved == null) {
            throw new InvalidArgumentException("技术架构主题不存在");
        }
        archySubjectSaved.setName(subDto.getCatalogName());
        archySubjectSaved.setAlias(subDto.getEnglishName());
        archySubjectSaved.setLastModifiedTime(new Date());
        archySubjectService.updateArchySubject(archySubjectSaved);
        subExt.setPublishState(subDto.getPublishState());
        subjectExtRepository.save(subExt);
    }

    @Override
    @Transactional
    public void updateDataAssetForArchyObject(DataAssetForArchySubjectDto objDto) {
        ArchySubjectExt subExt = subjectExtRepository.findByDamIdAndType(objDto.getDamId(), 1);
        ArchyObject archyObjectSaved = archyObjectDao.findArchyObjectById(subExt.getArchyObjectId());
        if (archyObjectSaved == null) {
            throw new InvalidArgumentException("业务对象不存在");
        }

        ArchyObject newArchyObject = new ArchyObject();
        BeanUtils.copyProperties(archyObjectSaved, newArchyObject);
        newArchyObject.setName(objDto.getCatalogName());
        newArchyObject.setAlias(objDto.getEnglishName());
        newArchyObject.setLastModifiedTime(new Date());

        archyObjectService.updateArchyObject(newArchyObject);
        subExt.setPublishState(objDto.getPublishState());
        subjectExtRepository.save(subExt);
    }

    @Override
    @Transactional
    public void updatePublishState(DataAssetForArchySubjectDto dto, int type) {
        ArchySubjectExt subExt;
        if(type < 3){
            //查L1和L2
            subExt = subjectExtRepository.findByDamIdAndType(dto.getDamId(), 0);
        }else {
            //查L3
            subExt = subjectExtRepository.findByDamIdAndType(dto.getDamId(), 1);
        }
        if(subExt != null){
            subExt.setPublishState(dto.getPublishState());
            subjectExtRepository.save(subExt);
        }
    }

    @Override
    @Transactional
    public void moveArchySubject(Long damId, Long damParentId) {
        logger.info("移动目录damID:" + damId);
        ArchySubjectExt subParentExt = subjectExtRepository.findByDamIdAndType(damParentId, 0);
        ArchySubject parentSubjectSaved = this.archySubjectDao.findArchySubjectById(subParentExt.getArchyId());
        if (parentSubjectSaved == null) {
            throw new InvalidArgumentException("需要迁移的父级技术架构主题不存在");
        }

        ArchySubjectExt subExt = subjectExtRepository.findByDamIdAndType(damId, 0);
        ArchySubject subjectSaved = this.archySubjectDao.findArchySubjectById(subExt.getArchyId());
        if (subjectSaved == null) {
            throw new InvalidArgumentException("需要迁移的技术架构主题不存在");
        }
        subjectSaved.setParentId(parentSubjectSaved.getId());
        archySubjectDao.save(subjectSaved);
//        archySubjectService.updateArchySubject(subjectSaved);
        subExt.setDamParentId(damParentId);
        subjectExtRepository.save(subExt);
        redissonClient.getMap("archy:subject:allSubject").clear();
        redissonClient.getList("archy:subject:rootSubject").clear();
    }

    @Override
    @Transactional
    public void moveArchyObject(Long damId, Long damParentId) {
        logger.info("移动业务对象damID:" + damId);
        //业务对象查询2级目录
        ArchySubjectExt subParentExt = subjectExtRepository.findByDamIdAndType(damParentId, 0);
        ArchySubject parentSubjectSaved = this.archySubjectDao.findArchySubjectById(subParentExt.getArchyId());
        if (parentSubjectSaved == null) {
            throw new InvalidArgumentException("需要迁移的父级技术架构主题不存在");
        }

        ArchySubjectExt subExt = subjectExtRepository.findByDamIdAndType(damId, 1);
        ArchyObject objectSaved = archyObjectDao.findArchyObjectById(subExt.getArchyObjectId());
        if (objectSaved == null) {
            throw new InvalidArgumentException("需要迁移的业务对象不存在");
        }
        objectSaved.setSubjectId(parentSubjectSaved.getId());
        archyObjectDao.save(objectSaved);
//        archyObjectService.updateArchyObject(objectSaved);
        subExt.setDamParentId(damParentId);
        subjectExtRepository.save(subExt);
        redissonClient.getMap("archy:subject:allSubject").clear();
        redissonClient.getList("archy:subject:rootSubject").clear();
    }

    @Override
    public void applyArchyObjectState(List<String> objectId, Integer state, String username) {
        List<ArchyObject> acceptedArchyObjectsByIds = archyObjectDao.findArchyObjectByIds(objectId);
        logger.info("username "+ username);
        if (state == 2){
            //  通过
            for (ArchyObject acceptedArchyObjectsById : acceptedArchyObjectsByIds) {
                archyObjectExtendServiceImpl.updateArchyObjectStateCopy(acceptedArchyObjectsById.getId(), ArchyState.A, ProcessType.ARCHY_OBJECT_PUBLISH,username);
            }

        }else if (state == 3){

            // 驳回
            for (ArchyObject acceptedArchyObjectsById : acceptedArchyObjectsByIds) {
                archyObjectExtendServiceImpl.updateArchyObjectStateCopy(acceptedArchyObjectsById.getId(), ArchyState.D, ProcessType.ARCHY_OBJECT_PUBLISH,username);
            }

        }else {

        }
    }


}

























