package com.datablau.project.api;

import com.datablau.project.dto.DataAssetForArchySubjectDto;

import java.util.List;

/**
 * @author: hxs
 * @date: 2025/4/7 17:38
 */
public interface RemoteArchyExtendService {

    List<String> getArchyCatalogTree();

    void createDataAssetForArchySubject(DataAssetForArchySubjectDto dto, String userName);

    void createataAssetForArchyObject(DataAssetForArchySubjectDto dto, String userName);

    void updateDataAssetForArchySubject(DataAssetForArchySubjectDto dto);

    void updateDataAssetForArchyObject(DataAssetForArchySubjectDto dto);

    //通过资产目录删除数据架构，damId是资产目录id对应数据架构去查询。type是类型0是L1、L2目录 ，1是L3业务对象
    void deleteArchyByDataCatalog(Long damId, int type);

    void updatePublishState(DataAssetForArchySubjectDto dto, int type);

    void importArchySubject(DataAssetForArchySubjectDto dto, String userName);

    void importArchyObject(DataAssetForArchySubjectDto dto, String userName);

    void moveArchySubject(Long damId, Long damParentId);

    void moveArchyObject(Long damId, Long damParentId);


    void applyArchyObjectState(List<String> objectId, Integer state, String username);
}
