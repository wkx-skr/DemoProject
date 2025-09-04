package com.datablau.metadata.main.ext;

import com.andorj.lineage.data.LineageContainer;

import java.io.File;

public interface EtlSourceService {


    void saveEtlSource(File file, Long lineageId, Long folderId, LineageContainer container) throws Exception;




}
