package com.datablau.domain.management.impl;

import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.domain.management.jpa.entity.DomainCodeGenerate;
import com.datablau.domain.management.jpa.type.DatablauDomainType;
import org.apache.commons.lang3.StringUtils;
import org.redisson.api.RLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;

@Service("domainCodeGenerateServiceExt")
public class DomainCodeGenerateServiceExt extends DomainCodeGenerateServiceImpl {
    private static final Logger logger = LoggerFactory.getLogger(DomainCodeGenerateServiceExt.class);

    @PostConstruct
    public void init() {
        RLock lock = this.redissonClient.getLock("init-domain-code-lk");

        try {
            boolean locked = lock.isLocked();
            if (locked) {
                return;
            }

            lock.lock();
            List<DomainCodeGenerate> generates = this.generateRepository.findAll();
            if (generates == null || generates.isEmpty()) {
                DomainCodeGenerate basicDomain = new DomainCodeGenerate();
                basicDomain.setDomainType(DatablauDomainType.BASIC_CODE);
                basicDomain.setPrefix("DS-");
                basicDomain.setStartVal(0L);
                basicDomain.setNextVal(0L);
                basicDomain.setIncStepSize(1L);
                basicDomain.setDigitPart(6L);
                basicDomain.setAutoIncState(false);
                DomainCodeGenerate codeDomain = new DomainCodeGenerate();
                codeDomain.setDomainType(DatablauDomainType.STANDARD_CODE);
                codeDomain.setPrefix("CD-");
                codeDomain.setStartVal(0L);
                codeDomain.setNextVal(0L);
                codeDomain.setIncStepSize(1L);
                codeDomain.setDigitPart(6L);
                codeDomain.setAutoIncState(false);
                DomainCodeGenerate domain = new DomainCodeGenerate();
                domain.setDomainType(DatablauDomainType.DOMAIN_STANDARD);
                domain.setPrefix("DST-");
                domain.setStartVal(0L);
                domain.setNextVal(0L);
                domain.setIncStepSize(1L);
                domain.setDigitPart(8L);
                domain.setAutoIncState(false);
                DomainCodeGenerate normSys = new DomainCodeGenerate();
                normSys.setDomainType(DatablauDomainType.NORM_SYS);
                normSys.setPrefix("DN-");
                normSys.setStartVal(0L);
                normSys.setNextVal(0L);
                normSys.setIncStepSize(1L);
                normSys.setDigitPart(8L);
                normSys.setAutoIncState(false);
                List<DomainCodeGenerate> toSave = new ArrayList();
                toSave.add(basicDomain);
                toSave.add(codeDomain);
                toSave.add(domain);
                toSave.add(normSys);
                this.generateRepository.saveAll(toSave);
            } else if (generates.size() < 5) {
                DomainCodeGenerate businessTerm = new DomainCodeGenerate();
                businessTerm.setDomainType(DatablauDomainType.BUSINESS_TERM);
                businessTerm.setPrefix("SY-");
                businessTerm.setStartVal(0L);
                businessTerm.setNextVal(0L);
                businessTerm.setIncStepSize(1L);
                businessTerm.setDigitPart(6L);
                businessTerm.setAutoIncState(false);
                this.generateRepository.save(businessTerm);
            } else {
                // 随机数如果不是6位，则改为6位
                generates.stream().filter(v -> v.getDomainType() == DatablauDomainType.BUSINESS_TERM && v.getDigitPart() != 6L).findFirst().ifPresent(v -> {
                    v.setDigitPart(6L);
                    this.generateRepository.save(v);
                });
            }
        } catch (Exception var12) {
            logger.warn("init domain code generate failed cause by:" + var12.getMessage(), var12);
        } finally {
            lock.forceUnlock();
        }

    }

    @Transactional(
            propagation = Propagation.REQUIRES_NEW
    )
    public String getSingleDomainCode(DatablauDomainType domainType, String bizCode) {
        RLock lock = this.redissonClient.getLock("generate-doamin-code-lk");

        String var5;
        try {
            lock.lock();
            DomainCodeGenerate codeGenerate = this.generateRepository.findByDomainType(domainType);
            List<String> domainCodes = this.getDomainCodes(codeGenerate, bizCode, 1);
            this.generateRepository.save(codeGenerate);
            var5 = domainCodes.get(0);
        } finally {
            lock.unlock();
        }

        return var5;
    }
    public List<String> getDomainCodes(DomainCodeGenerate codeGenerate, String bizCode, int size) {
        List<String> domainCodes = new ArrayList();
        int recursionCount = 0;
        int acquiredCode = 0;

        for(int needGetCode = size; recursionCount < 20; ++recursionCount) {
            List<String> list = this.generateDomainCodes(codeGenerate, bizCode, needGetCode);
            domainCodes.addAll(list);
            acquiredCode += list.size();
            if (size == acquiredCode) {
                break;
            }

            needGetCode = size - acquiredCode;
        }

        if (recursionCount >= 20) {
            throw new RuntimeException(GeneralUtility.getMessageService().getMessage("genCodeExistRisk", new Object[]{recursionCount}));
        } else {
            return domainCodes;
        }
    }
    @Override
    public List<String> generateDomainCodes(DomainCodeGenerate generate, int size) {
        return generateDomainCodes(generate, null, size);
    }
    public List<String> generateDomainCodes(DomainCodeGenerate generate, String bizCode, int size) {
        List<String> domainCodes = new ArrayList();
        Long computeVal = generate.getNextVal();
        Long digits = generate.getDigitPart();
        Long maxVal = this.getMaxVal(digits);
        List<String> mixedDomainCode = this.findMixedDomainCode(generate, size);

        for(int i = 0; i < size; ++i) {
            if (i != 0) {
                computeVal = computeVal + generate.getIncStepSize();
            }

            if (computeVal > maxVal) {
                throw new RuntimeException(GeneralUtility.getMessageService().getMessage("genDomainCodeOverstep"));
            }

            String domainCode = String.format(
                    (generate.getPrefix() == null ? "" : generate.getPrefix())
                            + (StringUtils.isBlank(bizCode) ? "" : bizCode + "-")
                            + "%0" + digits + "d"
                            + (generate.getSuffix() == null ? "" : generate.getSuffix()),
                    computeVal
            );
            if (mixedDomainCode == null || mixedDomainCode.isEmpty() || !domainCode.contains(domainCode)) {
                domainCodes.add(domainCode);
            }
        }

        computeVal = computeVal + generate.getIncStepSize();
        generate.setNextVal(computeVal);
        return domainCodes;
    }

    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public List<String> getBatchDomainCodes(DatablauDomainType domainType, String bizCode, int size) {
        RLock lock = this.redissonClient.getLock("generate-doamin-code-lk");

        List var6;
        try {
            lock.lock();
            DomainCodeGenerate codeGenerate = this.generateRepository.findByDomainType(domainType);
            List<String> domainCodes = this.getDomainCodes(codeGenerate, bizCode, size);
            this.generateRepository.save(codeGenerate);
            var6 = domainCodes;
        } finally {
            lock.unlock();
        }

        return var6;
    }

    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public List<String> getBatchDomainCodes(DatablauDomainType domainType, int size) {
        return this.getBatchDomainCodes(domainType, null, size);
    }
}
