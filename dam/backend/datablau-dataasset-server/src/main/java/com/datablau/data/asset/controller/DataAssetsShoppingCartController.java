package com.datablau.data.asset.controller;

import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.model.common.api.MessageService;
import com.datablau.data.asset.api.DataAssetsShoppingCartService;
import com.datablau.data.asset.dto.*;
import com.datablau.data.asset.utils.FileUtility;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.data.FileDescriptor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;


@Tag(name = "资产购物车")
@RestController
@RequestMapping(value = "/shopping/cart")
public class DataAssetsShoppingCartController extends BaseController {
    private static final Logger logger = LoggerFactory.getLogger(DataAssetsShoppingCartController.class);


    @Autowired
    private DataAssetsShoppingCartService dataAssetsShoppingCartService;
    @Autowired
    private FileUtility storedFileService;
    @Autowired
    private MessageService messageService;



    @Operation(summary = "上传附件")
    @PostMapping(value = "/upload")
    public ResResultDto<FileDescriptor> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            FileDescriptor fileDescriptor = storedFileService.uploadFile(convertMultipartFileToFile(file),file.getOriginalFilename(), getCurrentUser(), true);
            return ResResultDto.ok(fileDescriptor);
        } catch (Exception e) {
            throw new UnexpectedStateException("文件大小超过20m");
        }
    }

    @Operation(summary = "添加购物车")
    @PostMapping(value = "/")
    public ResResultDto<Long> addToShoppingCart(@RequestBody ShoppingCartDto shoppingCartDto) {
        Long shoppingCartId = dataAssetsShoppingCartService.addToShoppingCart(shoppingCartDto, getCurrentUser(), false);
        return ResResultDto.ok(shoppingCartId);
    }

    @Operation(summary = "编辑购物车资产列表")
    @PostMapping(value = "/edit/list")
    public void editColumns(@RequestBody List<ShoppingCartApplyDto> applyDtoList) {
        dataAssetsShoppingCartService.editColumns(applyDtoList);
    }

    @Operation(summary = "查询购物车资产列表")
    @PostMapping(value = "/to/edit")
    public ResResultDto<List<ShoppingCartApplyDto>> toEditColumns(@RequestBody List<ShoppingCartApplyDto> applyDtoList) {
        return ResResultDto.ok(dataAssetsShoppingCartService.toEditColumns(applyDtoList));
    }


    @Operation(summary = "删除购物车")
    @DeleteMapping(value = "/")
    public ResResultDto<?> delete(@RequestBody List<Long> ids) {
        dataAssetsShoppingCartService.deleteAll(ids);
        return ResResultDto.ok();
    }


    @Operation(summary = "购物车列表")
    @PostMapping(value = "/list")
    public ResResultDto<List<ShoppingCartDto>> list(@RequestBody ShoppingCartListDto shoppingCartListDto) {
        List<ShoppingCartDto> shoppingCartDtos = dataAssetsShoppingCartService.list(shoppingCartListDto, getCurrentUser());
        return ResResultDto.ok(shoppingCartDtos);
    }

    @Operation(summary = "字段列表")
    @PostMapping(value = "/column/list")
    public ResResultDto<List<TableDto>> getColumnList(@RequestBody List<Long> tableList) {
        return ResResultDto.ok(dataAssetsShoppingCartService.getColumnList(tableList));
    }

    @Operation(summary = "购物车申请")
    @PostMapping(value = "/application")
    public ResResultDto<?> application(@RequestBody DataAssetsApplicationFormDto assetsApplicationFormDto) {
        dataAssetsShoppingCartService.application(assetsApplicationFormDto, getCurrentUser());
        return ResResultDto.ok();
    }

    @Operation(summary = "立即申请")
    @PostMapping(value = "/application/now")
    public ResResultDto<?> applyNow(@RequestBody ApplyNowDto applyNowDto) {
        dataAssetsShoppingCartService.applyNow(applyNowDto, getCurrentUser());
        return ResResultDto.ok();
    }


    @Operation(summary = "是否加入购物车")
    @GetMapping(value = "/exist")
    public ResResultDto<Boolean> exist(Long assetId) {
        return ResResultDto.ok(dataAssetsShoppingCartService.exists(assetId, getCurrentUser()));
    }

    public File convertMultipartFileToFile(MultipartFile file) {
        try {
            File convFile = null;
            if (file.equals("") || file.getSize() <= 0) {
                logger.info(messageService.getMessage("fileIsEmpty"));
            } else {
                InputStream inputStream = file.getInputStream();
                convFile = new File(file.getOriginalFilename());
                FileOutputStream fos = new FileOutputStream(convFile);
                int bytesRead = 0;
                byte[] buffer = new byte[8192];
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    fos.write(buffer, 0, bytesRead);
                }
                fos.close();
                inputStream.close();
            }
            return convFile;
        } catch (IOException e) {
            throw new UnexpectedStateException(messageService.getMessage("fileTransError"));
        }
    }
}
