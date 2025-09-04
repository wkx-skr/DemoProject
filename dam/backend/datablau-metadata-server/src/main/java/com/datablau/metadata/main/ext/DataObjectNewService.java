package com.datablau.metadata.main.ext;

import com.datablau.metadata.main.dto.BaseDataObjectNew;
import com.datablau.metadata.main.dto.metadata.BaseDataObject;

import java.util.List;

public interface DataObjectNewService {

    List<BaseDataObjectNew> getBaseDataObjectNewByObjectIds(List<Long> objectIds);
}
