package com.datablau.metadata.main.controller;

import com.andorj.common.core.exception.IllegalOperationException;
import com.andorj.model.common.api.MessageService;
import com.datablau.base.api.ModelCategoryService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.type.SystemType;
import com.datablau.metadata.main.entity.metadata.DataObject;
import com.datablau.metadata.main.util.ServerConstants;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;

/**
 * @description:
 * @author: huajun.li
 * @create: 2023-05-26 16:49
 **/
@RestController
public class LocalBaseController extends BaseController {

    @Autowired
    private MessageService msgService;
    @Autowired
    private ModelCategoryService modelCategoryService;


    public LocalBaseController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    /**
     * 校验元数据修改权限
     */
    protected void checkMetadataEditPermissions(DataObject dataObject) {
        if (!AuthTools.hasAnyRole(AuthTools.ROLE_SUPERUSER) && !AuthTools.hasAnyRole("METADATA_EDIT")) {
            boolean hasRoleMetadataEditCurrentSystem = AuthTools.hasAnyRole(
                    "METADATA_EDIT_CURRENT_SYSTEM");
            if (!hasRoleMetadataEditCurrentSystem) {
                throw new IllegalOperationException(
                        msgService.getMessage("notPermissionsToEditMetadata"));
            } else {
                String username = AuthTools.currentUsername();
                //todo:7.0 commented
                Collection<Long> categoryIds = modelCategoryService
                        .getModelCategoryOwnerGroupIdsOfUser(username, SystemType.DAM.name());
                if (!categoryIds.contains(dataObject.getModelCategoryId())) {
                    throw new IllegalOperationException(
                        msgService.getMessage("notPermissionsToEditMetadata"));
                }
            }
        }
    }

}
