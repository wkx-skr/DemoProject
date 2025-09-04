package com.datablau.domain.management.impl;

import com.andorj.common.core.exception.UnexpectedStateException;
import com.datablau.domain.management.api.DomainCategoryPermissionService;
import com.datablau.domain.management.api.DomainService;
import com.datablau.domain.management.data.DomainState;
import com.datablau.domain.management.dto.*;
import com.datablau.domain.management.jpa.entity.Domain;
import com.datablau.domain.management.jpa.entity.DomainFolderExt;
import com.datablau.domain.management.jpa.entity.StandardCodeFolderRela;
import com.datablau.domain.management.jpa.repository.DomainFolderExtRepository;
import com.datablau.domain.management.jpa.repository.DomainRepository;
import com.datablau.domain.management.jpa.repository.StandardCodeFolderRelaRepository;
import com.datablau.domain.management.type.PermissionLevel;
import com.datablau.domain.management.type.PermissionType;
import com.datablau.domain.management.utils.JsonUtils;
import com.datablau.security.management.utils.AuthTools;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DomainFolderExtService {
    private static final Logger logger = LoggerFactory.getLogger(DomainFolderExtService.class);

    @Autowired
    private DomainServiceImpl domainService;

    @Autowired
    private DomainFolderExtRepository domainFolderExtRepository;
    @Autowired
    public DomainCodeGenerateServiceExt generateService;

    @Autowired
    private DomainCategoryPermissionService domainCategoryPermissionService;

    @Autowired
    private DomainRepository domainRepository;

    @Autowired
    private StandardCodeFolderRelaRepository standardCodeFolderRelaRepository;

    public void checkFolderBizCodeExist(String bizCode, Long id) {
        if(StringUtils.isBlank(bizCode)) {
            return;
        }
        DomainFolderExt byBizCodeEquals = domainFolderExtRepository.findByBizCodeEquals(bizCode);
        if(byBizCodeEquals != null && byBizCodeEquals.getId() != null && !Objects.equals(id, byBizCodeEquals.getfId())) {
            throw new UnexpectedStateException(String.format("[%s] 已存在", bizCode));
        }
    }
    @Transactional
    public DomainFolderExtDto createFolder(DomainFolderExtDto folder, String user) {
        // 创建folder
        DomainFolderDto createdFolder = domainService.createFolder(folder);
        Long fId = createdFolder.getId();
        try {
            // 创建folder业务域编码
            if(folder.getParentId() == DomainService.DOMAIN_CATEGORY_ID) { // 基础标准的一级目录 保存bizCode
                String bizCode = folder.getBizCode();
                checkFolderBizCodeExist(bizCode, null);
                DomainFolderExt domainFolderExt = new DomainFolderExt();
                domainFolderExt.setfId(fId);
                domainFolderExt.setBizCode(bizCode);
                domainFolderExtRepository.save(domainFolderExt);
            }
            domainCategoryPermissionService.updateUserPermissionOfCategory(createdFolder.getId(),
                    PermissionType.USER,
                    user,
                    PermissionLevel.ADMIN);
            return JsonUtils.toObject(JsonUtils.toJSon(createdFolder), DomainFolderExtDto.class);
        } catch (Throwable tw) {
            DomainFolderResDto dto = new DomainFolderResDto();
            dto.setFolderId(createdFolder.getId());
            dto.setUsername(user);
            dto.setWithNoValid(true);
            domainService.deleteFolder(dto);

            throw new UnexpectedStateException("failed to create folder", tw);
        }
    }

    @Transactional
    public void deleteFolder(DomainFolderResDto folderResDto) {
        Long folderId = folderResDto.getFolderId();
        DomainFolderExt byFIdEquals = domainFolderExtRepository.findByFId(folderId);
        if(byFIdEquals != null && byFIdEquals.getId() != null) {
            domainFolderExtRepository.deleteById(byFIdEquals.getId());
        }
        domainService.deleteFolder(folderResDto);
    }

    @Transactional
    public DomainFolderDto updateFolder(DomainFolderExtDto folder) {
        Long fId = folder.getId();
        String bizCode = folder.getBizCode();
        if(StringUtils.isNotBlank(bizCode) && folder.getParentId() == DomainService.DOMAIN_CATEGORY_ID) {
            checkFolderBizCodeExist(bizCode, fId);
            DomainFolderExt byFIdEquals = domainFolderExtRepository.findByFId(fId);
            if(byFIdEquals != null && byFIdEquals.getId() != null) {
                domainFolderExtRepository.updateBizCodeByFId(bizCode, fId);
            } else {
                DomainFolderExt domainFolderExt = new DomainFolderExt();
                domainFolderExt.setBizCode(bizCode);
                domainFolderExt.setfId(fId);
                domainFolderExtRepository.save(domainFolderExt);
            }
        }
        return domainService.updateFolder(folder);
    }

    public Map<Long, String> getBizCodeMap() {
        DomainTreeNodeDto domainTreeNodeDto = domainService.loadDomainTree(null, DomainService.DOMAIN_CATEGORY_ID, null, true);
        List<DomainTreeNodeDto> nodes = domainTreeNodeDto.getNodes();
        if(!CollectionUtils.isEmpty(nodes)) {
            Map<Long, String> map = new HashMap<>();
            for (DomainTreeNodeDto node : nodes) {
                Long foldId = node.getFoldId();
                DomainFolderExt domainFolderExt = domainFolderExtRepository.findByFId(foldId);
                if(domainFolderExt != null) {
                    map.put(foldId, domainFolderExt.getBizCode());
                    HashSet<Long> subNodeIds = new HashSet<>();
                    DomainTreeNodeExtDto.getAllSubNodeId(node, subNodeIds);
                    for (Long subNodeId : subNodeIds) {
                        map.put(subNodeId, domainFolderExt.getBizCode());
                    }
                }
            }
            return map;
        }
        return new HashMap<>();
    }

    public DomainTreeNodeDto loadDomainTree(DomainState domainState, Long categoryId, String currentUser, Boolean onlyFolder) {
        DomainTreeNodeDto domainTreeNodeDto = domainService.loadDomainTree(domainState, categoryId, currentUser, onlyFolder);
        List<DomainTreeNodeDto> nodes = domainTreeNodeDto.getNodes();
        if(!CollectionUtils.isEmpty(nodes)) {
            // 只设置第一层目录的bizCode
            Set<Long> folderIds = nodes.stream().map(n -> n.getFoldId()).collect(Collectors.toSet());
            Map<Long, String> map = Optional.ofNullable(domainFolderExtRepository.findByFIdIn(folderIds)).orElse(Arrays.asList())
                    .stream().collect(Collectors.toMap(k -> k.getfId(), v -> v.getBizCode()));
            List nodeExtDtos = new ArrayList<>();
            for (DomainTreeNodeDto node : nodes) {
                nodeExtDtos.add(DomainTreeNodeExtDto.buildBy(node, map.getOrDefault(node.getFoldId(), "")));
            }
            domainTreeNodeDto.setNodes(nodeExtDtos);
        }
        if("基础标准".equals(domainTreeNodeDto.getName())){
            domainTreeNodeDto.setName("标准数据元");
        }
        return domainTreeNodeDto;
    }

    @Transactional
    public Boolean moveFolder(List<DomainDto> domainDtos, Long id) {
        List<DomainDto> list = domainDtos.stream().filter(v -> !v.getFolderId().equals(id)).toList();
        if(list.isEmpty()) {
            return true;
        }
        Set<String> domainIds = list.stream().map(v -> v.getDomainId()).collect(Collectors.toSet());
        List<Domain> domains = domainRepository.findByDomainIdIn(domainIds);
        for (Domain domain : domains) {
            domain.setFolderId(id);
        }
        domainRepository.saveAll(domains);
        return true;
    }

    @Transactional
    public Boolean moveFolderForCode(List<StandardCodeDto> codeDtos, Long id) {
        List<StandardCodeDto> list = codeDtos.stream().filter(v -> !v.getFolderId().equals(id)).toList();
        if(list.isEmpty()) {
            return true;
        }
        List<StandardCodeFolderRela> datas = list.stream().map(v -> v.getCode()).distinct().map(code -> new StandardCodeFolderRela(code, id)).toList();
        standardCodeFolderRelaRepository.saveAll(datas);
        return true;
    }
}
