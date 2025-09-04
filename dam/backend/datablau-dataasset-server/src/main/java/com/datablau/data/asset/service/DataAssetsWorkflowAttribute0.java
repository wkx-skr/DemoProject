package com.datablau.data.asset.service;

/**
 * @author: hxs
 * @date: 2025/5/22 18:58
 */
public interface DataAssetsWorkflowAttribute0 {
    String PROCESS_TYPE = "processType";
    String CURRENT_STATUS = "currentStatus";
    String CATALOG_TYPE = "catalogType";
    String REASON = "reason";
    String CATALOG_PATH = "catalogPath";
    String CATALOG_NAME = "catalogName";
    String CATALOG_CODE = "catalogCode";
    String ABBREVIATION = "abbreviation";
    String DIRECTORY_STRUCTURE = "directoryStructure";
    String DEPARTMENT = "department";
    String CATALOG_KEYWORDS = "catalogKeywords";
    String DESCRIBE = "describe";
    String BM = "bm";
    String CATALOG_ID = "catalogId";
    String APPROVER = "approver";
    String APPROVER_NAME = "approverName";
    String APPLY_NAME = "applyName";
    String DATA_STEWARD = "dataSteward";
    String APPLY_TYPE = "applyType";
    String START_USER_ID = "startUserId";
    String PROCESS_INSTANCE_NAME = "processInstanceName";
    String CATALOG_EXTENSIONS = "catalogExtensions";
    //目录权限
    String AUTHORITY_TYPE = "authorityType";

    //目录修改
    String CHANGER = "changer";
    String NEW_CATALOG_DATA = "newCatalogData";
    String OLD_CATALOG_DATA = "oldCatalogData";


    /**
     * 资产权限申请属性
     */

    //申请有效期
    String TIMELESS = "timeless";

    //过期时间
    String EXPIRATION_TIME = "expirationTime";

    //附件ID
    String ATTACHMENT_ID = "attachmentId";

    //附件名称
    String ATTACHMENT_NAME = "attachmentName";

    // 获取方式
    String GET_WAY = "getWay";

    //用途
    String PURPOSE = "purpose";

    //表单ID
    String FORM_ID = "formId";

    //备注
    String REMARK ="remark";
    String APPLY_USER ="applyUser";
    String URGENCY ="urgency";

}
