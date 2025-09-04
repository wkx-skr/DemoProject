package com.datablau.project.api.impl;

import com.datablau.project.api.RemoteArchyExtendService;
import com.datablau.project.dto.DataAssetForArchySubjectDto;

import java.util.List;

/**
 * @author: hxs
 * @date: 2025/4/7 17:52
 */
public class EmptyRemoteArchyExtendService implements RemoteArchyExtendService {
    @Override
    public List<String> getArchyCatalogTree() {
        return List.of();
    }

    @Override
    public void createDataAssetForArchySubject(DataAssetForArchySubjectDto dto, String userName) {
    }

    @Override
    public void createataAssetForArchyObject(DataAssetForArchySubjectDto dto, String userName) {

    }

    @Override
    public void deleteArchyByDataCatalog(Long damId, int type) {

    }

    @Override
    public void updateDataAssetForArchySubject(DataAssetForArchySubjectDto dto) {

    }

    @Override
    public void updateDataAssetForArchyObject(DataAssetForArchySubjectDto dto) {

    }

    @Override
    public void updatePublishState(DataAssetForArchySubjectDto dto, int type) {

    }

    @Override
    public void importArchySubject(DataAssetForArchySubjectDto dto, String userName) {

    }

    @Override
    public void importArchyObject(DataAssetForArchySubjectDto dto, String userName) {

    }

    @Override
    public void moveArchySubject(Long damId, Long damParentId) {

    }

    @Override
    public void moveArchyObject(Long damId, Long damParentId) {

    }

    @Override
    public void applyArchyObjectState(List<String> objectId, Integer state, String username) {

    }
}
