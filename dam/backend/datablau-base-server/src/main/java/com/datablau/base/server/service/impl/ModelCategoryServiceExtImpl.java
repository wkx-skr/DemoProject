package com.datablau.base.server.service.impl;


import com.andorj.common.core.exception.AndorjRuntimeException;
import com.datablau.base.api.ModelCategoryService70;
import com.datablau.base.data.ModelCategoryDto;
import com.datablau.base.data.ModelCategoryParamDto;
import com.datablau.base.server.dto.ModelCategoryExtDto;
import com.datablau.base.server.dto.ModelCategoryParamExtDto;
import com.datablau.base.server.dto.ModelCategoryTreeNodeDto;
import com.datablau.base.server.impl.ModelCategoryServiceImpl;
import com.datablau.base.server.jpa.entity.ModelCategoryFolder;
import com.datablau.base.server.jpa.repository.ModelCategoryFolderRepository;
import com.datablau.base.server.service.ModelCategoryServiceExt;
import com.datablau.security.management.utils.AuthTools;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;


@Service("modelCategoryServiceExtImpl")
public class ModelCategoryServiceExtImpl implements ModelCategoryServiceExt {
    private static final Logger logger = LoggerFactory.getLogger(ModelCategoryServiceExtImpl.class);

    @Autowired
    private ModelCategoryFolderRepository modelCategoryFolderRepository;

    @Autowired
    private ModelCategoryService70 modelCategoryService;

    @Override
    public ModelCategoryExtDto createModelCategoryNew(ModelCategoryParamExtDto modelCategoryParamExtDto, String appName) {

        ModelCategoryDto modelCategory = modelCategoryService.createModelCategory(modelCategoryParamExtDto, appName);
        ModelCategoryFolder modelCategoryFolder = new ModelCategoryFolder();
        modelCategoryFolder.setParentId(modelCategoryParamExtDto.getParentId());
        modelCategoryFolder.setName(modelCategoryParamExtDto.getCategoryName());
        modelCategoryFolder.setCategoryId(modelCategory.getCategoryId());
        ModelCategoryFolder saved = modelCategoryFolderRepository.save(modelCategoryFolder);
        ModelCategoryExtDto modelCategoryExtDto = new ModelCategoryExtDto();
        BeanUtils.copyProperties(modelCategory, modelCategoryExtDto);
        modelCategoryExtDto.setFolderId(saved.getFolderId());
        modelCategoryExtDto.setParentId(saved.getParentId());
        return modelCategoryExtDto;
    }

    @Override
    public ModelCategoryExtDto updateModelCategoryNew(ModelCategoryParamExtDto modelCategoryParamExtDto) {
        ModelCategoryDto modelCategoryDto = modelCategoryService.updateModelCategory(modelCategoryParamExtDto);
        ModelCategoryFolder modelCategoryFolder = new ModelCategoryFolder();
        modelCategoryFolder.setParentId(modelCategoryParamExtDto.getParentId());
        modelCategoryFolder.setName(modelCategoryParamExtDto.getCategoryName());
        modelCategoryFolder.setCategoryId(modelCategoryDto.getCategoryId());
        modelCategoryFolder.setFolderId(modelCategoryParamExtDto.getFolderId());
        ModelCategoryFolder saved = modelCategoryFolderRepository.save(modelCategoryFolder);
        ModelCategoryExtDto modelCategoryExtDto = new ModelCategoryExtDto();
        BeanUtils.copyProperties(modelCategoryDto, modelCategoryExtDto);
        modelCategoryExtDto.setFolderId(saved.getFolderId());
        modelCategoryExtDto.setParentId(saved.getParentId());
        return modelCategoryExtDto;
    }

    @Override
    public ModelCategoryTreeNodeDto loadStandardCodeTree() {
        ModelCategoryTreeNodeDto root = new ModelCategoryTreeNodeDto("应用系统");
        List<ModelCategoryTreeNodeDto> subNodes = new ArrayList<>();
        List<ModelCategoryFolder> folderList = modelCategoryFolderRepository.findAll();
        List<ModelCategoryFolder> topList = folderList.stream().filter(f -> f.getParentId().equals(0L)).toList();
        for (ModelCategoryFolder top : topList) {
            ModelCategoryTreeNodeDto nodeDto = convertToTreeNode(top);
            subNodes.add(loadStandardCodeTree(nodeDto));
        }
        root.setNodes(subNodes);
        return root;
    }

    @Override
    @Transactional
    public void deleteModelCategory(Long categoryId, String appName) {
        ModelCategoryFolder categoryFolder = modelCategoryFolderRepository.findByCategoryId(categoryId);
        if (categoryFolder != null && modelCategoryFolderRepository.existsByParentId(categoryFolder.getFolderId())){
            throw new AndorjRuntimeException("当前系统下还存在子系统，不可删除");
        }
        modelCategoryService.deleteModelCategory(categoryId,appName);
        if (categoryFolder != null) {
            modelCategoryFolderRepository.deleteById(categoryFolder.getFolderId());
        }
    }

    public ModelCategoryTreeNodeDto loadStandardCodeTree(ModelCategoryTreeNodeDto parent) {
        List<ModelCategoryFolder> subs = modelCategoryFolderRepository.findAllByParentIdEquals(parent.getFolderId());
        List<ModelCategoryTreeNodeDto> nodeDtos = convertToTreeNodeList(subs);
        for (ModelCategoryTreeNodeDto sub : nodeDtos) {
            loadStandardCodeTree(sub);
        }
        parent.setNodes(nodeDtos);
        return parent;
    }

    public List<ModelCategoryTreeNodeDto> convertToTreeNodeList(List<ModelCategoryFolder> folders) {
        List<ModelCategoryTreeNodeDto> treeNodeDtos = new ArrayList<>();
        for (ModelCategoryFolder folder : folders) {
            treeNodeDtos.add(convertToTreeNode(folder));
        }
        return treeNodeDtos;
    }

    public ModelCategoryTreeNodeDto convertToTreeNode(ModelCategoryFolder folder) {
        ModelCategoryTreeNodeDto nodeDto = new ModelCategoryTreeNodeDto();
        BeanUtils.copyProperties(folder, nodeDto);
        return nodeDto;
    }

}
