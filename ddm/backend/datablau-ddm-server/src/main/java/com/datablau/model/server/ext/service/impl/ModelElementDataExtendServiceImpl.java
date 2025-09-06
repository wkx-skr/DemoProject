package com.datablau.model.server.ext.service.impl;

import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ObjectX;
import com.datablau.archy.common.dto.ArchyObjectDto;
import com.datablau.archy.common.service.RemoteArchyService;
import com.datablau.model.data.api.impl.ModelElementDataServiceImpl;
import com.datablau.model.data.dto.SaveModelDto;
import com.datablau.model.data.jpa.entity.Model;
import com.datablau.model.data.jpa.entity.ModelElement;
import com.datablau.model.server.jpa.entity.ModelElementExt;
import com.datablau.model.server.jpa.repostory.ModelElement0Repository;
import com.datablau.model.server.jpa.repostory.ModelElementExtRepostory;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

/**
 * @author: hxs
 * @date: 2025/4/24 17:31
 */
@Service("modelElementDataServiceExt")
public class ModelElementDataExtendServiceImpl extends ModelElementDataServiceImpl {
    public static final Logger LOGGER = LoggerFactory.getLogger(ModelElementDataExtendServiceImpl.class);
    @Autowired
    private ModelElementExtRepostory modelElementExtRepostory;
    @Autowired
    private ModelElement0Repository element0Repository;
    @Autowired
    private RemoteArchyService remoteArchyService;

    @Override
    @Transactional
    public void dataParse(SaveModelDto saveModelDto, Model model) {
        super.dataParse(saveModelDto, model);
//        //TODO 操作元数据保存到扩展表里，这里实在不能写到modelService里
//        System.out.println("xxxxxxxxxxxxxxxxxxxx");
//        ObjectMapper mapper = new ObjectMapper();
//        try {
//            LOGGER.info("同步过来的新模型信息：：" + mapper.writeValueAsString(saveModelDto));
//        } catch (JsonProcessingException e) {
//            throw new RuntimeException(e);
//        }
//
//        ModelElement dataSource = element0Repository.findDataSource(model.getId());
//        ObjectX obj = this.modelService.getObjectXFromData(dataSource.getData(), model.getUseProto());
//        Object property = obj.getProperty(LDMTypes.pArchyObjectRef);
//        if(property == null){
//            return;
//        }
//        ArchyObjectDto archyObject = remoteArchyService.getArchyObject(String.valueOf(property));
//        List<ModelElementExt> all = modelElementExtRepostory.findAll();
//        //objectId和生成的编码的map
//        HashMap<Long, String> tableExistCode = new HashMap<>();
//        HashMap<Long, String> columnExistCode = new HashMap<>();
//        if(!CollectionUtils.isEmpty(all)){
//            for (ModelElementExt elementExt : all) {
//                if(elementExt.getTypeId() == LDMTypes.oEntity){
//                    tableExistCode.put(elementExt.getModelElementId(), elementExt.getCode());
//                }
//                if(elementExt.getTypeId() == LDMTypes.oAttribute){
//                    columnExistCode.put(elementExt.getModelElementId(), elementExt.getCode());
//                }
//            }
//        }
//
//        //处理新增表和字段
//        ArrayList<ModelElementExt> creatElementExts = new ArrayList<>();
//        this.dohandleAddTable(creatElementExts, saveModelDto.getAdded(), tableExistCode, model.getLastModifier(), archyObject);
//        this.dohandleAddColumn(creatElementExts, saveModelDto.getAdded(), tableExistCode, columnExistCode,  model.getLastModifier(), archyObject);
//        modelElementExtRepostory.saveAll(creatElementExts);
//
//        //处理修改表和字段
//        List<ModelElement> updated = saveModelDto.getUpdated();
//        List<Long> elementIds = updated.stream().map(ModelElement::getElementId).toList();
//        List<ModelElementExt> updateElements = modelElementExtRepostory.findByModelElementId(elementIds, archyObject.getId());
//        for (ModelElementExt updateElement : updateElements) {
//            updateElement.setUpdateDate(new Date());
//            updateElement.setUpdater(model.getLastModifier());
//        }
//        modelElementExtRepostory.saveAll(updateElements);

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
}
