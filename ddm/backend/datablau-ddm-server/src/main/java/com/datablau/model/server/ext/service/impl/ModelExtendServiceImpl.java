package com.datablau.model.server.ext.service.impl;

import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.common.core.exception.IllegalOperationException;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.NotFoundRemoteServerException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ModelX;
import com.andorj.common.core.model.ObjectX;
import com.andorj.common.data.Data;
import com.datablau.archy.common.dto.ArchyObjectDto;
import com.datablau.model.data.api.impl.ModelServiceImpl;
import com.datablau.model.data.converter.ParsedObject;
import com.datablau.model.data.dto.EditedResponseDto;
import com.datablau.model.data.dto.ModelElementWebDto;
import com.datablau.model.data.dto.ModelVersionEditObjectsDto;
import com.datablau.model.data.dto.SaveModelDto;
import com.datablau.model.data.dto.SaveWebModelDto;
import com.datablau.model.data.dto.SessionDto;
import com.datablau.model.data.general.ElementOpType;
import com.datablau.model.data.general.OperationType;
import com.datablau.model.data.jpa.entity.Model;
import com.datablau.model.data.jpa.entity.ModelElement;
import com.datablau.model.data.jpa.entity.ModelVerAuditLog;
import com.datablau.model.data.jpa.entity.ModelVerDetailAuditLog;
import com.datablau.model.data.jpa.entity.ParsedData;
import com.datablau.model.data.utility.SpringContextUtils;
import com.datablau.model.local.utility.DataExceptionCode;
import com.datablau.model.security.utility.AuthTools;
import com.datablau.model.server.jpa.entity.ModelElementExt;
import com.datablau.model.server.jpa.repostory.ModelElement0Repository;
import com.datablau.model.server.jpa.repostory.ModelElementExtRepostory;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import org.apache.commons.lang.ObjectUtils;
import org.redisson.api.RLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.w3c.dom.Node;

import javax.servlet.http.HttpSession;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import java.util.zip.ZipException;

/**
 *
 * @author: hxs
 * @date: 2025/4/23 15:14
 */
@Service("modelServiceExt")
public class ModelExtendServiceImpl extends ModelServiceImpl {
    public static final Logger LOGGER = LoggerFactory.getLogger(ModelElementDataExtendServiceImpl.class);
    public static final ObjectMapper mapper = new ObjectMapper();

    @Autowired
    private ModelElement0Repository element0Repository;
    @Autowired
    private ModelElementExtRepostory modelElementExtRepostory;

    @Override
    @Transactional
    public EditedResponseDto saveWebModel(SaveWebModelDto saveWebModelDto) throws Exception {
        LOGGER.info("开始开始：：" + mapper.writeValueAsString(saveWebModelDto));

        Long modelId = saveWebModelDto.getModelId();
        final HttpSession session = SpringContextUtils.getSession();
        if (null == session) {
            throw new IllegalOperationException(msgService.getMessage("sessionMissing"));
        }
        String sessionId = session.getId();

        List<SessionDto> list = signedSessions.getOrDefault(sessionId, Collections.emptyList());
        boolean locked = list.stream()
                .anyMatch(dto -> ObjectUtils.equals(modelId, dto.getModelId()));

        Model model = self.getModelByIdForUpdate(modelId);
        if (!locked || !model.isLocked()) {
            //throw new IllegalOperationException(msgService.getMessage("modelNeedReLocked"));
        }
        checkModelLockAndLocker(model);

        try {
            checkModelVersion(model.getCurrentVersion(), saveWebModelDto.getLastVersion());
        } catch (IllegalOperationException ie) {
            modelEditAuditService.logOperationForModel(model, OperationType.WEB_EDIT_TABLE_CONFLICT, null);
            throw ie;
        }

        Boolean useProtobuf = model.getUseProto();

        ModelElement element = getModelElementOfModel(modelId).copyOf();

        ModelX modelX = null;
        try {
            modelX = getModelXFromModelElementWithSeed(element, useProtobuf);
        } catch (ZipException ze) {
            useProtobuf = true;
            modelX = getModelXFromModelElementWithSeed(element, useProtobuf);
            model.setUseProto(useProtobuf);
            model = modelDao.save(model);
        }

        List<ModelElementWebDto> udps = saveWebModelDto.getUdps();

        if (null != udps && !udps.isEmpty()) {
            ModelX udpModelX = modelX.getUdp();
            //todo udpModelX为null，需要加上
            if (null == udpModelX) {

            }

            udpModelX.getObjects().clear();
            for (ModelElementWebDto udpDto : udps) {
                Long typeId = udpDto.getLongProperty(LDMTypes.pTypeId);
                Long id = udpDto.getLongProperty(LDMTypes.pId);
                byte[] data = buildSimpleObjectX(udpDto.getProperties(), typeId, udpModelX, null, "Datablau.LDM.ObjectX", useProtobuf);
                ObjectX objectX = getObjectXFromData(data, useProtobuf);
                objectX.setOwner(udpModelX);
                objectX.setModelX(udpModelX.getModelX());
                udpModelX.getObjects().put(id, objectX);
                udpModelX.addGlobalObject(id, objectX);
                modelX.getWatcher().objectCreated(objectX);
            }
            // 如果udp有变动，前端会在updated集合放模型的modelsource对象，就可以更新modelsource对象来保存udp了
            modelX.setUdp(udpModelX);
        }

        SaveModelDto saveModel = new SaveModelDto(saveWebModelDto);
        List<ModelElement> removed = saveWebModelDto.getRemoved().stream().map(elementId -> new ModelElement(elementId)).collect(Collectors.toList());
        saveModel.setAdded(new ArrayList<>(20));
        saveModel.setUpdated(new ArrayList<>(20));
        saveModel.setRemoved(removed);
        for (ModelElementWebDto webDto : saveWebModelDto.getAdded()) {
            ModelElement me = webDto;
            byte[] data = buildSimpleObjectX(webDto.getProperties(), webDto.getLongProperty(LDMTypes.pTypeId), modelX, null, webDto.getObjectClass(), useProtobuf);
            me.setData(data);
            me.generateCombinedId();
            Object alias = webDto.getProperties().get(LDMTypes.pLogicalName);
            if (alias != null) {
                me.setAlias((String) alias);
            }
            saveModel.getAdded().add(me);
        }

        for (ModelElementWebDto webDto : saveWebModelDto.getUpdated()) {
            ModelElement me = webDto;
            byte[] data = buildSimpleObjectX(webDto.getProperties(), webDto.getLongProperty(LDMTypes.pTypeId), modelX, modelX.getUdp(), webDto.getObjectClass(), useProtobuf);
            me.setData(data);
            me.generateCombinedId();
            Object alias = webDto.getProperties().get(LDMTypes.pLogicalName);
            if (alias != null) {
                me.setAlias((String) alias);
            }
            saveModel.getUpdated().add(me);
        }

        Model savedModel = saveModel(saveModel);
        LOGGER.info("跑完跑完：：" + mapper.writeValueAsString(saveWebModelDto));
        this.dohandleModelElementExtForArchy(saveModel, savedModel);

        EditedResponseDto result = new EditedResponseDto();
        result.setCurrentVersion(savedModel.getCurrentVersion());

        List<Long> diagramIds = modelElementDao.findAllSubElementIds(modelId, element.getElementId(), LDMTypes.oDiagram);
        // result需返回模型下所有主题域对象及它们所有子孙元素的内容供前端画布使用
        Map<Long, ParsedObject> objectMap = buildObjectXMapOfElements(modelId, diagramIds, useProtobuf, true);

        List<ParsedObject> objects = objectMap.values().stream().collect(Collectors.toList());
        objects.removeIf(Objects::isNull);
        result.setObjects(objects);

        String logMsg = AuthTools.currentUsernameFailFast() + " update model " + modelId;
        modelEditAuditService.sendModelOperationLog(savedModel, OperationType.UPDATE_MODEL, logMsg);

        return result;
    }

    public void dohandleModelElementExtForArchy(SaveModelDto saveModelDto, Model model) throws Exception {
        //TODO 操作元数据保存到扩展表里，这里实在不能写到modelService里
        LOGGER.info("xxxxxxxxxxxxxxxxxxxx");
        LOGGER.info("同步过来的新模型信息：：" + mapper.writeValueAsString(saveModelDto));

        ModelElement dataSource = element0Repository.findDataSource(model.getId());
        ObjectX obj = getObjectXFromData(dataSource.getData(), model.getUseProto());
        Object property = obj.getProperty(LDMTypes.pArchyObjectRef);
        if(property == null){
            LOGGER.info("该模型的业务对象为null  xxxx");
            return;
        }
        ArchyObjectDto archyObject = remoteArchyService.getArchyObject(String.valueOf(property));
        List<ModelElementExt> all = modelElementExtRepostory.findAll();
        //objectId和生成的编码的map
        HashMap<Long, String> tableExistCode = new HashMap<>();
        HashMap<Long, String> columnExistCode = new HashMap<>();
        if(!CollectionUtils.isEmpty(all)){
            for (ModelElementExt elementExt : all) {
                if(elementExt.getTypeId() == LDMTypes.oEntity){
                    tableExistCode.put(elementExt.getModelElementId(), elementExt.getCode());
                }
                if(elementExt.getTypeId() == LDMTypes.oAttribute){
                    columnExistCode.put(elementExt.getModelElementId(), elementExt.getCode());
                }
            }
        }

        //处理新增表和字段
        ArrayList<ModelElementExt> creatElementExts = new ArrayList<>();
        this.dohandleAddTable(creatElementExts, saveModelDto.getAdded(), tableExistCode, model.getLastModifier(), archyObject);
        this.dohandleAddColumn(creatElementExts, saveModelDto.getAdded(), tableExistCode, columnExistCode,  model.getLastModifier(), archyObject);
        modelElementExtRepostory.saveAll(creatElementExts);

        //处理修改表和字段
        List<ModelElement> updated = saveModelDto.getUpdated();
        List<Long> elementIds = updated.stream().map(ModelElement::getElementId).toList();
        List<ModelElementExt> updateElements = modelElementExtRepostory.findByModelElementId(elementIds, archyObject.getId());
        for (ModelElementExt updateElement : updateElements) {
            updateElement.setUpdateDate(new Date());
            updateElement.setUpdater(model.getLastModifier());
        }
        modelElementExtRepostory.saveAll(updateElements);

        //处理删除
//        List<Long> deleteElementIds = saveModelDto.getRemoved().stream().map(ModelElement::getElementId).toList();
//        modelElementExtRepostory.deleteByElementId(deleteElementIds);
    }

    private void dohandleAddTable(ArrayList<ModelElementExt> creatElementExts, List<ModelElement> add,
                                  HashMap<Long, String> tableExistCode, String creater, ArchyObjectDto archyObject){
        for (ModelElement object : add) {
            //创建我要的属性 表
            if(object.getTypeId() == LDMTypes.oEntity){
                ModelElementExt elementExt = new ModelElementExt();
                elementExt.setModelElementId(object.getElementId());
                elementExt.setCreateDate(new Date());
                elementExt.setCreater(creater);//创建人
                elementExt.setArchyId(archyObject.getId());
                elementExt.setTypeId(object.getTypeId());
                elementExt.setSystem("");//来源系统

                String parentCode = archyObject.getCode();
                int maxNumOrder = this.splitLastCode(tableExistCode.values());
                long nextNumber = maxNumOrder + 1;
                String code = this.generateChildCode(parentCode, nextNumber);
                elementExt.setCode(code);
                tableExistCode.put(object.getElementId(), code);
                creatElementExts.add(elementExt);
            }
        }
    }

    private void dohandleAddColumn(ArrayList<ModelElementExt> creatElementExts, List<ModelElement> add,
                                   HashMap<Long, String> tableExistCode, HashMap<Long, String> columnExistCode,
                                   String creater, ArchyObjectDto archyObject){
        for (ModelElement object : add) {
            if(object.getTypeId() == LDMTypes.oAttribute){
                ModelElementExt elementExt = new ModelElementExt();
                elementExt.setModelElementId(object.getElementId());
                elementExt.setCreateDate(new Date());
                elementExt.setCreater(creater);//创建人
                elementExt.setArchyId(archyObject.getId());
                elementExt.setTypeId(object.getTypeId());
                elementExt.setSystem("");//来源系统
                elementExt.setParentId(object.getParentId());

                String parentCode = tableExistCode.get(object.getParentId());
                int maxNumOrder = this.splitLastCode(columnExistCode.values());
                long nextNumber = maxNumOrder + 1;
                String code = this.generateChildCode(parentCode, nextNumber);
                elementExt.setCode(code);
                columnExistCode.put(object.getElementId(), code);
                creatElementExts.add(elementExt);
            }
        }
    }

    private int splitLastCode(Collection<String> codes){
        int maxNum = 0;
        for (String code : codes) {
            String lastNum = code.substring(code.lastIndexOf('-') + 1);
            int lastNum0 = Integer.parseInt(lastNum);
            if (lastNum0 > maxNum) {
                maxNum = lastNum0;
            }
        }
        return maxNum;
    }

    /**
     * 根据父节点生成子节点编码
     */
    private String generateChildCode(String parentCatalogCode, long nextNumber) {
        return String.format("%s-%06d", parentCatalogCode, nextNumber);
    }


    @Transactional
    public EditedResponseDto saveWebModel0(SaveWebModelDto saveWebModelDto) throws Exception {
        Long modelId = saveWebModelDto.getModelId();
//        final HttpSession session = SpringContextUtils.getSession();
//        if (null == session) {
//            throw new IllegalOperationException(msgService.getMessage("sessionMissing"));
//        }
//        String sessionId = session.getId();

//        List<SessionDto> list = signedSessions.getOrDefault(sessionId, Collections.emptyList());
//        boolean locked = list.stream()
//                .anyMatch(dto -> ObjectUtils.equals(modelId, dto.getModelId()));

        Model model = self.getModelByIdForUpdate(modelId);
        if (/*!locked ||*/ !model.isLocked()) {
            //throw new IllegalOperationException(msgService.getMessage("modelNeedReLocked"));
        }
//        checkModelLockAndLocker(model);

        try {
            checkModelVersion(model.getCurrentVersion(), saveWebModelDto.getLastVersion());
        } catch (IllegalOperationException ie) {
            modelEditAuditService.logOperationForModel(model, OperationType.WEB_EDIT_TABLE_CONFLICT, null);
            throw ie;
        }

        Boolean useProtobuf = model.getUseProto();

        ModelElement element = getModelElementOfModel(modelId).copyOf();

        ModelX modelX = null;
        try {
            modelX = getModelXFromModelElementWithSeed(element, useProtobuf);
        } catch (ZipException ze) {
            useProtobuf = true;
            modelX = getModelXFromModelElementWithSeed(element, useProtobuf);
            model.setUseProto(useProtobuf);
            model = modelDao.save(model);
        }

        List<ModelElementWebDto> udps = saveWebModelDto.getUdps();

        if (null != udps && !udps.isEmpty()) {
            ModelX udpModelX = modelX.getUdp();
            //todo udpModelX为null，需要加上
            if (null == udpModelX) {

            }

            udpModelX.getObjects().clear();
            for (ModelElementWebDto udpDto : udps) {
                Long typeId = udpDto.getLongProperty(LDMTypes.pTypeId);
                Long id = udpDto.getLongProperty(LDMTypes.pId);
                byte[] data = buildSimpleObjectX(udpDto.getProperties(), typeId, udpModelX, null, "Datablau.LDM.ObjectX", useProtobuf);
                ObjectX objectX = getObjectXFromData(data, useProtobuf);
                objectX.setOwner(udpModelX);
                objectX.setModelX(udpModelX.getModelX());
                udpModelX.getObjects().put(id, objectX);
                udpModelX.addGlobalObject(id, objectX);
                modelX.getWatcher().objectCreated(objectX);
            }
            // 如果udp有变动，前端会在updated集合放模型的modelsource对象，就可以更新modelsource对象来保存udp了
            modelX.setUdp(udpModelX);
        }

        SaveModelDto saveModel = new SaveModelDto(saveWebModelDto);
        List<ModelElement> removed = saveWebModelDto.getRemoved().stream().map(elementId -> new ModelElement(elementId)).collect(Collectors.toList());
        saveModel.setAdded(new ArrayList<>(20));
        saveModel.setUpdated(new ArrayList<>(20));
        saveModel.setRemoved(removed);
        for (ModelElementWebDto webDto : saveWebModelDto.getAdded()) {
            ModelElement me = webDto;
            byte[] data = buildSimpleObjectX(webDto.getProperties(), webDto.getLongProperty(LDMTypes.pTypeId), modelX, null, webDto.getObjectClass(), useProtobuf);
            me.setData(data);
            me.generateCombinedId();
            Object alias = webDto.getProperties().get(LDMTypes.pLogicalName);
            if (alias != null) {
                me.setAlias((String) alias);
            }
            saveModel.getAdded().add(me);
        }

        for (ModelElementWebDto webDto : saveWebModelDto.getUpdated()) {
            ModelElement me = webDto;
            byte[] data = buildSimpleObjectX(webDto.getProperties(), webDto.getLongProperty(LDMTypes.pTypeId), modelX, modelX.getUdp(), webDto.getObjectClass(), useProtobuf);
            me.setData(data);
            me.generateCombinedId();
            Object alias = webDto.getProperties().get(LDMTypes.pLogicalName);
            if (alias != null) {
                me.setAlias((String) alias);
            }
            saveModel.getUpdated().add(me);
        }

        Model savedModel = saveModel(saveModel);
        LOGGER.info("跑完跑完：：" + mapper.writeValueAsString(saveWebModelDto));
        this.dohandleModelElementExtForArchy(saveModel, savedModel);

        EditedResponseDto result = new EditedResponseDto();
        result.setCurrentVersion(savedModel.getCurrentVersion());

        List<Long> diagramIds = modelElementDao.findAllSubElementIds(modelId, element.getElementId(), LDMTypes.oDiagram);
        // result需返回模型下所有主题域对象及它们所有子孙元素的内容供前端画布使用
        Map<Long, ParsedObject> objectMap = buildObjectXMapOfElements(modelId, diagramIds, useProtobuf, true);

        List<ParsedObject> objects = objectMap.values().stream().collect(Collectors.toList());
        objects.removeIf(Objects::isNull);
        result.setObjects(objects);

        String logMsg = AuthTools.currentUsernameFailFast() + " update model " + modelId;
        modelEditAuditService.sendModelOperationLog(savedModel, OperationType.UPDATE_MODEL, logMsg);

        return result;
    }
}
