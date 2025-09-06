package com.datablau.domain.management.impl;

import com.datablau.domain.management.api.BatchConfirmConfigService;

import com.andorj.common.data.PageResult;
import com.datablau.domain.management.dto.BatchConfirmConfigPageQueryDto;
import com.datablau.domain.management.jpa.entity.BatchConfirmConfig;
import com.datablau.domain.management.jpa.repository.BatchConfirmConfigRepository;
import com.datablau.domain.management.utility.RemoteServiceGetter;
import com.datablau.security.management.dto.UserDto;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;

import javax.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-07-09 17:17
 * @description
 */
@Service
public class BatchConfirmConfigServiceImpl implements BatchConfirmConfigService {

    @Autowired
    private BatchConfirmConfigRepository repository;

    @Override
    public BatchConfirmConfig save(BatchConfirmConfig config) {
        // 进行check  第一 重复的业务域名不能重复添加  由于更新也用的这个方法 所以这里要多一点check
        String msg = new String();
        // 如果存在id  那么有两种情况
        // 第一种 业务域名改了名字，那么需要去check 有没有重复的名字，
        // 第二种 如果没改名字  那么这里就不需要check了
        Boolean updateSign = false;
        Boolean hasId = false;
        if (!ObjectUtils.isEmpty(config.getId())){
            Optional<BatchConfirmConfig> byId = repository.findById(config.getId());
            if (byId.isPresent()) {
                // 判断名字是否变化
                BatchConfirmConfig batchConfirmConfig = byId.get();
                if (batchConfirmConfig.getDomainName().equals(config.getDomainName())) {
                    updateSign = true;
                }
            }
            hasId = true;
        }
        // 如果名字相等说明id 存在 名字也没更新  那么就不需要进行check
        if (updateSign) {
          // 如果是更新那么就不需要进行check了
        } else if (!updateSign && hasId){
            // 如果名字不相等 但是id 存在 需要check
            if (repository.countByDomainName(config.getDomainName().trim())>0) {
                msg += "已存在相同业务业务域的配置，请勿重复添加! ";
            }
        } else if (!hasId) {
          // 如果没有id 那么也同样需要check
            if (repository.countByDomainName(config.getDomainName().trim())>0) {
                msg += "已存在相同业务业务域的配置，请勿重复添加! ";
            }
        }
        if (config.getConfirmUser1().trim().equals(config.getConfirmUser2().trim())){
            msg += "确认人不能相同 ";
        }
        // check 用户名称是否存在
        UserDto user1 = RemoteServiceGetter.getUserService().getUser(config.getConfirmUser1().trim());
        UserDto user2 = RemoteServiceGetter.getUserService().getUser(config.getConfirmUser2().trim());
        if (ObjectUtils.isEmpty(user1)){
            msg += config.getConfirmUser1().trim() +" 确认人不存在";
        }
        if (ObjectUtils.isEmpty(user2)){
            msg += config.getConfirmUser2().trim() +" 确认人不存在";
        }

        if (!ObjectUtils.isEmpty(msg)){
            throw new IllegalArgumentException(msg);
        }
        BatchConfirmConfig save = repository.save(config);
        return save;
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    @Override
    public BatchConfirmConfig findById(Long id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public List<BatchConfirmConfig> findAll() {
        return (List<BatchConfirmConfig>)repository.findAll();
    }

    @Override
    public List<BatchConfirmConfig> findByUser(String username) {
        return repository.findByConfirmUser1OrConfirmUser2(username, username);
    }

    @Override
    public PageResult<BatchConfirmConfig> page(BatchConfirmConfigPageQueryDto dto) {
        int pageNum = dto.getPageNum() != null ? dto.getPageNum() : 1;
        int pageSize = dto.getPageSize() != null ? dto.getPageSize() : 20;
        Pageable pageable = PageRequest.of(pageNum - 1, pageSize);

        Specification<BatchConfirmConfig> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.isNotBlank(dto.getDomainName())) {
                predicates.add(cb.like(root.get("domainName"), "%" + dto.getDomainName() + "%"));
            }
            if (StringUtils.isNotBlank(dto.getConfirmUser1())) {
                predicates.add(cb.equal(root.get("confirmUser1"), dto.getConfirmUser1()));
            }
            if (StringUtils.isNotBlank(dto.getConfirmUser2())) {
                predicates.add(cb.equal(root.get("confirmUser2"), dto.getConfirmUser2()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<BatchConfirmConfig> page = repository.findAll(spec, pageable);

        PageResult<BatchConfirmConfig> result = new PageResult<>();
        result.setCurrentPage(pageNum);
        result.setPageSize(pageSize);
        result.setTotalItems(page.getTotalElements());
        result.setContentDirectly(page.getContent());
        return result;
    }
}