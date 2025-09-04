package com.datablau.base.server.controller;

import com.andorj.common.data.PageResult;
import com.datablau.base.server.jpa.entity.EsRemoteIKDictItem;
import com.datablau.base.server.jpa.entity.EsRemoteIkDict;
import com.datablau.base.server.service.EsRemoteIkDictItemService;
import com.datablau.base.server.service.EsRemoteIkDictService;
import com.datablau.base.server.utility.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.security.management.api.RoleService;
import org.apache.commons.lang.time.DateFormatUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2021/9/6 16:06
 */
@RestController
@RequestMapping("/ikdict")
public class EsRemoteIkDictController extends BaseController {

    private static final Logger logger = LoggerFactory.getLogger(EsRemoteIkDictController.class);

    @Autowired
    private EsRemoteIkDictService remoteIkDictService;

    @Autowired
    private EsRemoteIkDictItemService remoteIkDictItemService;

    public EsRemoteIkDictController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @PostMapping("/getLatestDict")
    public void getLatestRemoteIkDict(HttpServletResponse response){
        EsRemoteIkDict latestRemoteIkDict = remoteIkDictService.getLatestRemoteIkDict();
        String formatDictItems = remoteIkDictItemService.getFormatDictItems();
        if(latestRemoteIkDict != null) {
            exportRemoteIkDict(latestRemoteIkDict, response, formatDictItems);
        }
    }

    @PostMapping(value = "/updateDictItem")
    public void updateDictItem(@RequestBody EsRemoteIKDictItem dictItem){
        remoteIkDictItemService.updateDictItems(dictItem);
    }

    @PostMapping(value = "/deleteDictItem")
    public void deleteDictItem(@RequestBody List<Long> dictItemIds){
        remoteIkDictItemService.deleteDictItems(dictItemIds);
    }

    @PostMapping(value = "/getPageOfDictItem")
    public PageResult<EsRemoteIKDictItem> getPageOfDictItem(@RequestParam("currentPage") int currentPage,
                                                            @RequestParam("pageSize") int pageSize,
                                                            @RequestParam(name = "keyword", required = false, defaultValue = "") String keyword){
        return remoteIkDictItemService.getPageDictItem(currentPage, pageSize, keyword);
    }


    private void exportRemoteIkDict(EsRemoteIkDict dict, HttpServletResponse response, String dictContents) {
        response.setHeader("Last-Modified", DateFormatUtils.format(dict.getUpdateDate(), "yyyy-MM-dd hh:mm:ss"));
        response.setHeader("ETag", dict.getEsTag());
        response.setContentType("text/plain;charset=UTF-8");
        try {
            if(dictContents != null){
                response.getWriter().write(dictContents);
            }else {
                response.getWriter().write("");
            }
        } catch (IOException e) {
            logger.error("read remote ikDict fail");
            throw new RuntimeException("read remote ikDict fail:"+e.getMessage());
        }
    }
}
