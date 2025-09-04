package com.datablau.data.asset.controller;


import com.datablau.data.asset.api.DataAssetsBrowsingHistoryService;
import com.datablau.data.asset.dto.ResResultDto;
import com.datablau.data.asset.jpa.entity.DataAssetsBrowsingHistory;
import com.datablau.data.asset.utils.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/browsing/history")
public class DataAssetsBrowsingHistoryController extends BaseController {


    @Autowired
    private DataAssetsBrowsingHistoryService dataAssetsBrowsingHistoryService;

    public DataAssetsBrowsingHistoryController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "保存浏览记录")
    @PostMapping(value = "/save")
    public ResResultDto<?> save(@RequestBody DataAssetsBrowsingHistory dataAssetsBrowsingHistory) {
        String currentUser = getCurrentUser();
        dataAssetsBrowsingHistory.setUsername(currentUser);
        dataAssetsBrowsingHistoryService.save(dataAssetsBrowsingHistory);
        return ResResultDto.ok();
    }


    @Operation(summary = "浏览记录")
    @GetMapping(value = "/{pageNum}/{pageSize}")
    public ResResultDto<?> page(@PathVariable int pageNum, @PathVariable int pageSize) {
        Page<DataAssetsBrowsingHistory> histories = dataAssetsBrowsingHistoryService.page(pageNum, pageSize, getCurrentUser());
        return ResResultDto.ok(histories);
    }
}
