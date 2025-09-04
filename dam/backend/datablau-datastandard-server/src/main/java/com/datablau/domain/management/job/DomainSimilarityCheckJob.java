package com.datablau.domain.management.job;

import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.enhance.recommender.api.ColumnClusterService;
import com.andorj.enhance.recommender.api.ColumnDescriptor;
import com.andorj.enhance.recommender.api.ColumnSimilarity;
import com.andorj.enhance.recommender.api.ColumnVectorModel;
import com.andorj.model.common.utility.BeanHelper;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.domain.management.api.DomainSimilarityCheckService;
import com.datablau.domain.management.constants.DomainCheckState;
import com.datablau.domain.management.data.DomainState;
import com.datablau.domain.management.dto.DomainSimilarityCheckResultDetailDto;
import com.datablau.domain.management.impl.DomainExtServiceImpl;
import com.datablau.domain.management.jpa.entity.Domain;
import com.datablau.domain.management.jpa.entity.DomainExt;
import com.datablau.domain.management.jpa.entity.DomainSimilarityCheckResult;
import com.datablau.domain.management.jpa.entity.DomainSimilarityCheckResultDetail;
import com.datablau.domain.management.jpa.repository.DomainExtRepository;
import com.datablau.domain.management.jpa.repository.DomainSimilarityCheckResultDetailRepository;
import com.datablau.domain.management.jpa.repository.DomainSimilarityCheckResultRepository;
import com.datablau.domain.management.utils.JsonUtils;
import com.datablau.job.scheduler.adapter.DatablauJobAdapter;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import org.glassfish.jersey.internal.guava.Sets;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.util.*;
import java.util.stream.Collectors;

public class DomainSimilarityCheckJob extends DatablauJobAdapter {

    private static final Logger logger = LoggerFactory.getLogger(DomainSimilarityCheckJob.class);
    private float threshold;
    private int groupCount;
    private ColumnClusterService columnCluster;
    private DomainSimilarityCheckService  domainSimilarityCheckService;

    public DomainSimilarityCheckJob(DatablauJobDescriptor descriptor) {
        if (descriptor.getParameterByName("threshold") != null) {
            this.threshold = Float.parseFloat(descriptor.getParameterByName("threshold").getValue());
        }

        if (descriptor.getParameterByName("groupCount") != null) {
            this.groupCount = Integer.parseInt(descriptor.getParameterByName("groupCount").getValue());
        }

    }

    public void exec() throws Exception {
        this.prepare();
        this.execute();
    }
    protected void prepare() throws Exception {
        this.checkStopSign();
        super.prepare();
        this.columnCluster = BeanHelper.getBean(ColumnClusterService.class);
        if (this.columnCluster == null) {
            throw new UnexpectedStateException(GeneralUtility.getMessageService().getMessage("failedFindColumnCluster"));
        } else {
            this.domainSimilarityCheckService = BeanHelper.getBean(DomainSimilarityCheckService.class);
            if (this.domainSimilarityCheckService == null) {
                throw new UnexpectedStateException(GeneralUtility.getMessageService().getMessage("failedFindColumnCluster"));
            }
        }
    }

    protected void execute() throws Exception {
        this.checkStopSign();
        super.execute();
        logger.info(GeneralUtility.getMessageService().getMessage("startExecution2"), 5);
        if (this.threshold < 0.5F) {
            logger.info(GeneralUtility.getMessageService().getMessage("thresholdForcedTo0D6"));
            this.threshold = 0.5F;
        }

        if (this.groupCount < 20) {
            this.groupCount = 20;
        }

        if (this.groupCount > 100) {
            this.groupCount = 100;
        }

        this.domainSimilarityCheckService.deleteAll();
        logger.info(GeneralUtility.getMessageService().getMessage("emptyLastResults"), 10);
        this.addEvent(GeneralUtility.getMessageService().getMessage("emptyLastResults"), 10);
        List<Domain> domains = this.getFilterColumns();
        this.checkStopSign();
        Map<Long, ColumnDescriptor> map = new HashMap();
        for (int i = 0; i < domains.size(); i++) {
            Domain domain = domains.get(i);
            ColumnDescriptor cd = this.convertToColumnDescriptor(domain, i);
            map.put(cd.getObjectId(), cd);
        }

        logger.info(GeneralUtility.getMessageService().getMessage("getAllFieldsToGroup"), 20);
        this.addEvent(GeneralUtility.getMessageService().getMessage("getAllFieldsToGroup"), 20);
        this.checkStopSign();
        Set<Set<ColumnDescriptor>> groups = this.columnCluster.clusterColumns(map, this.groupCount);
        logger.info(GeneralUtility.getMessageService().getMessage("dataDividedIntoGroups", new Object[]{groups.size()}), 25);
        this.addEvent(GeneralUtility.getMessageService().getMessage("dataDividedIntoGroups", new Object[]{groups.size()}), 25);
        this.checkStopSign();
        ColumnVectorModel<Long> model = this.columnCluster.buildModel(map);
        logger.info(GeneralUtility.getMessageService().getMessage("dataModelCreated"), 30);
        this.checkStopSign();
        int groupSize = groups.size();
        if (groupSize == 0) {
            logger.info(GeneralUtility.getMessageService().getMessage("noDataCanProcesse"), 100);
        } else {
            int step = 70 / groupSize;
            int i = 1;
            Iterator var8 = groups.iterator();

            // 结果集合
            Set<String> domainIds = Sets.newHashSet();
            while(var8.hasNext()) {
                Set<ColumnDescriptor> group = (Set)var8.next();
                Set<Long> keySet = model.getLeftKeySet();
                group = this.removeNonExistColumnFromGroup(group, keySet);
                logger.info(GeneralUtility.getMessageService().getMessage("processedGroupsCount", new Object[]{i}), 30 + i * step);
                this.addEvent(GeneralUtility.getMessageService().getMessage("processedGroupsCount", new Object[]{i}), 30 + i * step);
                ++i;
                if (!group.isEmpty()) {
                    this.checkStopSign();
                    ColumnDescriptor target = this.getMostDuplicateTarget(group);
                    List<ColumnSimilarity> result = this.columnCluster.getSimilarColumns(target, model, this.threshold, map);
                    if(CollectionUtils.isEmpty(result)) {
                        continue;
                    }
                    if(result.size() == 1) {
                        logger.info("数据标准相似度检查，忽略只有一条的结果：{}", result.get(0).getLogicalName());
                        continue;
                    }
                    this.saveResult(result, domains, domainIds);
                }
            }

            this.domainSimilarityCheckService.refreshCheckState(domainIds, domains);
            logger.info(GeneralUtility.getMessageService().getMessage("taskComplete"), 100);
            this.addEvent(GeneralUtility.getMessageService().getMessage("taskComplete"), 100);
        }
    }

    private ColumnDescriptor getMostDuplicateTarget(Set<ColumnDescriptor> columns) {
        Map<String, NameCounter> count = new HashMap();
        Map<String, ColumnDescriptor> columnMap = new HashMap();
        Iterator var4 = columns.iterator();

        while(var4.hasNext()) {
            ColumnDescriptor column = (ColumnDescriptor)var4.next();
            String key = column.getLogicalName().toLowerCase();
            if (!count.containsKey(key)) {
                count.put(key, new NameCounter(key));
            }

            ((NameCounter)count.get(key)).incr();
            if (!columnMap.containsKey(key)) {
                columnMap.put(key, column);
            }
        }

        List<NameCounter> counters = new ArrayList(count.values());
        counters.sort((nc1, nc2) -> {
            return nc2.getCount() - nc1.getCount();
        });
        return columnMap.get((counters.get(0)).getName());
    }

    private void saveResult(List<ColumnSimilarity> columns, List<Domain> domainDtos, Set<String> domainIds) {
        List<DomainSimilarityCheckResultDetailDto> colClusters = new LinkedList();
        for (ColumnSimilarity column : columns) {
            Domain domainDto = domainDtos.get(column.getObjectId().intValue());
            DomainSimilarityCheckResultDetailDto columnCluster = this.convertToResultDetail(column, domainDto);
            colClusters.add(columnCluster);
            domainIds.add(domainDto.getDomainId());
        }

        List<DomainSimilarityCheckResultDetailDto> top5 = colClusters.stream().sorted(Comparator.comparing(DomainSimilarityCheckResultDetailDto::getScore).reversed()).limit(5L).collect(Collectors.toList());
        DomainSimilarityCheckResult result = new DomainSimilarityCheckResult();
        result.setColumns(top5);
        result.setTotalCounts(colClusters.size() == 0 ? 0L : Long.parseLong("" + colClusters.size()));

        this.domainSimilarityCheckService.save(result, colClusters);
    }

    private Set<ColumnDescriptor> removeNonExistColumnFromGroup(Set<ColumnDescriptor> set, Set<Long> keySet) {
        Iterator<ColumnDescriptor> iter = set.iterator();

        while(iter.hasNext()) {
            ColumnDescriptor cd = iter.next();
            if (!keySet.contains(cd.getObjectId())) {
                iter.remove();
            }
        }
        return set;
    }

    private DomainSimilarityCheckResultDetailDto convertToResultDetail(ColumnSimilarity similarity, Domain domainDto) {
        DomainSimilarityCheckResultDetailDto cc = new DomainSimilarityCheckResultDetailDto();
        Long objectId = similarity.getObjectId();

//        cc.setId(objectId);
//        cc.setClusterId();
        cc.setChineseName(domainDto.getChineseName());
        cc.setDomainCode(domainDto.getDomainCode());
        cc.setDataType(domainDto.getDataType());
        cc.setDataPrecision(domainDto.getDataPrecision());
        cc.setDescriptionDepartment(domainDto.getDescriptionDepartment());
        cc.setDomainId(domainDto.getDomainId());
        cc.setDataScale(domainDto.getDataScale());
        cc.setEnglishName(domainDto.getEnglishName());
        cc.setFolderId(domainDto.getFolderId());
        cc.setScore(similarity.getScore());
        cc.setState(domainDto.getState());
        cc.setSubmitter(domainDto.getSubmitter());
        return cc;
    }

    private ColumnDescriptor convertToColumnDescriptor(Domain column, long i) {
        ColumnDescriptor result = new ColumnDescriptor();
        result.setPhysicalName(column.getEnglishName());
        result.setLogicalName(column.getChineseName());
        result.setObjectId(i);
        return result;
    }

    private List<Domain> getFilterColumns() {
        HashSet<DomainState> domainStates = Sets.newHashSet();
        domainStates.add(DomainState.D);
        domainStates.add(DomainState.C);
        domainStates.add(DomainState.A);
        List<Domain> columns = this.domainSimilarityCheckService.getDomainsByStates(domainStates);
//        List<Long> objectIds = this.columnClusterDelRepository.findObjects();
//        columns.removeIf((column) -> {
//            return objectIds.contains(column.getId());
//        });
        return columns;
    }

    private class NameCounter {
        String name;
        int count;

        NameCounter(String name) {
            this.name = name;
            this.count = 0;
        }

        void incr() {
            ++this.count;
        }

        int getCount() {
            return this.count;
        }

        String getName() {
            return this.name;
        }
    }
}
