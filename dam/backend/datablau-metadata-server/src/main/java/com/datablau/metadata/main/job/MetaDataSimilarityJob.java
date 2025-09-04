package com.datablau.metadata.main.job;

import com.andorj.model.common.utility.BeanHelper;
import com.datablau.job.scheduler.adapter.DatablauJobAdapter;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.job.scheduler.data.DatablauJobExecutionException;
import com.datablau.job.scheduler.data.JobParameter;
import com.datablau.metadata.main.dao.DataObjectFullRepository;
import com.datablau.metadata.main.dao.SimilarityJobResultRepository;
import com.datablau.metadata.main.dao.model.ModelRepository;
import com.datablau.metadata.main.entity.SimilarityJobResult;
import com.datablau.metadata.main.entity.metadata.DataObject;
import com.datablau.metadata.main.entity.model.Model;
import com.datablau.metadata.main.job.descriptor.MetaDataSimilarityJobDescriptor;
import com.datablau.metadata.main.dto.MetaDataSimilarityResultDto;
import com.google.common.collect.Lists;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-07-16 13:56
 * @description
 */
public class MetaDataSimilarityJob extends DatablauJobAdapter {

    private final Logger logger = LoggerFactory.getLogger(MetaDataSimilarityJob.class);

    private MetaDataSimilarityJobDescriptor jobDescriptor;

 //   private DataObjectService dataObjectService;

    private DataObjectFullRepository dataObjectFullRepository;

    private SimilarityJobResultRepository similarityJobResultRepository;

    private ModelRepository dataModelRepo;

    public MetaDataSimilarityJob() {
    }

    public MetaDataSimilarityJob(DatablauJobDescriptor jobDescriptor) {
        this.jobDescriptor = new MetaDataSimilarityJobDescriptor(jobDescriptor);
    }

    @Override
    protected void prepare() throws Exception {
        this.similarityJobResultRepository = BeanHelper.getBean(SimilarityJobResultRepository.class);
        if (this.similarityJobResultRepository == null) {
            throw new RuntimeException("cannot find similarityJobResultRepository");
        }

        this.dataObjectFullRepository = BeanHelper.getBean(DataObjectFullRepository.class);
        if (this.dataObjectFullRepository == null) {
            throw new RuntimeException("cannot find dataObjectFullRepository");
        }

        this.dataModelRepo = BeanHelper.getBean(ModelRepository.class);


        if (this.dataModelRepo == null) {
            throw new DatablauJobExecutionException("Cannot find dataModelRepo");
        }


//        super.prepare();
    }

    @Override
    protected void execute() throws Exception {
      //  String regex = "^\\d+\\.\\d+$";
        //  模型id.schemaId.tableId
        Long mAL = null;
        Long mAS = null;
        Long mAT = null;
        Long mBL = null;
        Long mBS = null;
        Long mBT = null;
        List<SimilarityJobResult> all = (List<SimilarityJobResult>)similarityJobResultRepository.findAll();
        if (!CollectionUtils.isEmpty(all)){
            Set<Long> collect = all.stream().map(SimilarityJobResult::getId).collect(Collectors.toSet());
            similarityJobResultRepository.deleteAllById(collect);
        }
        //  super.execute();
        DatablauJobDescriptor descriptor = jobDescriptor.getDescriptor();
        if (ObjectUtils.isEmpty(descriptor)){
            logger.info("descriptor " + "is null ");
            addEvent("数据库配置参数为空 任务结束");
            return;
        }else {
            JobParameter modelA = jobDescriptor.getDescriptor().getParameterByName("modelA");
            JobParameter modelB = jobDescriptor.getDescriptor().getParameterByName("modelB");
            if (ObjectUtils.isEmpty(modelA) && "init".equals(modelA.getValue())){
                addEvent("数据库参数配置 A 为空 任务结束");
                return;
            }

            if (ObjectUtils.isEmpty(modelB) && "init".equals(modelB.getValue())){
                addEvent("数据库参数配置 B 为空 任务结束");
                return;
            }
            Boolean sign = false;
            String value = modelA.getValue();
//            if (!value.matches(regex)) {
//                sign = true;
//                addEvent("数据库A参数配置不合法");
//            }

            String[] split = value.split("\\.");
            mAL = Long.valueOf(split[0]);
            mAS = Long.valueOf(split[1]);
            if (split.length> 2){
                mAT = Long.valueOf(split[2]);
            }


            String valueB = modelB.getValue();
//            if (!valueB.matches(regex)) {
//                sign = true;
//                addEvent("数据库B参数配置不合法");
//            }
            if (sign) {
                addEvent("任务结束");
                return;
            }
            String[] splitB = valueB.split("\\.");
            mBL = Long.valueOf(splitB[0]);
            mBS = Long.valueOf(split[1]);
            if (splitB.length> 2){
                mBT = Long.valueOf(splitB[2]);
            }

        }

        addEvent("正在加载所需schema数据");
        Model schA = dataModelRepo.findByModelIdEquals(mAS);
        // 由于存在删除的可能 所以这里做下判断
        Boolean sign = false;
        if (ObjectUtils.isEmpty(schA)){
            sign =true;
            addEvent("未查询到数据库A下所对应的schema，请确认是否已经被删除");
        }
        Model schB = dataModelRepo.findByModelIdEquals(mBS);
        if (ObjectUtils.isEmpty(schB)){
            sign =true;
            addEvent("未查询到数据库B下所对应的schema，请确认是否已经被删除");
        }
        if (sign){
            addEvent("参数配置错误，任务结束");
            return;
        }
        addEvent("查询参数 A"+schA.getModelId()+"_"+schA.getDatabase()+"查询参数 B"+schB.getModelId()+"_"+schB.getDatabase());
        List<DataObject> allColumnsBySchemaA = new ArrayList<>();
        List<DataObject> allColumnsBySchemaB = new ArrayList<>();
        // 如果字段有值那么用字段的id
        if (!ObjectUtils.isEmpty(mAT)){
            List<DataObject> byObjectIdAndTypeIdAndEndVersionNull = dataObjectFullRepository.findByObjectIdAndTypeIdAndEndVersionNull(mAT, 80000004L);
            allColumnsBySchemaA.addAll(byObjectIdAndTypeIdAndEndVersionNull);
            List<DataObject> byParentIdAndTypeIdAndEndVersionNull = dataObjectFullRepository.findByParentIdAndTypeIdAndEndVersionNull(mAT, 80000005L);
            allColumnsBySchemaA.addAll(byParentIdAndTypeIdAndEndVersionNull);

        }else {
            List<DataObject> byModelIdAndSchemaAndEndVersionNull = dataObjectFullRepository.findByModelIdAndSchemaAndEndVersionNull(schA.getModelId(), schA.getDatabase());
            allColumnsBySchemaA.addAll(byModelIdAndSchemaAndEndVersionNull);
        }


        if (!ObjectUtils.isEmpty(mBT)){
            List<DataObject> byObjectIdAndTypeIdAndEndVersionNull = dataObjectFullRepository.findByObjectIdAndTypeIdAndEndVersionNull(mBT, 80000004L);
            allColumnsBySchemaB.addAll(byObjectIdAndTypeIdAndEndVersionNull);
            List<DataObject> byParentIdAndTypeIdAndEndVersionNull = dataObjectFullRepository.findByParentIdAndTypeIdAndEndVersionNull(mBT, 80000005L);
            allColumnsBySchemaB.addAll(byParentIdAndTypeIdAndEndVersionNull);

        }else {
            List<DataObject> byModelIdAndSchemaAndEndVersionNull = dataObjectFullRepository.findByModelIdAndSchemaAndEndVersionNull(schB.getModelId(), schB.getDatabase());
            allColumnsBySchemaB.addAll(byModelIdAndSchemaAndEndVersionNull);
        }

        // 如果此时数据库有
        if (CollectionUtils.isEmpty(allColumnsBySchemaA) || CollectionUtils.isEmpty(allColumnsBySchemaB)){
            addEvent("配置数据库有任一数据为空 任务结束");
            return;
        }


        addEvent("数据加载完成");


        
        // 使用stream分组，建立表与字段的映射关系
        Map<Long, DataObject> tableMapA = allColumnsBySchemaA.stream()
                .filter(obj -> obj.getTypeId() != null && obj.getTypeId().equals(80000004L))
                .collect(Collectors.toMap(DataObject::getObjectId, obj -> obj));
        
        Map<Long, List<DataObject>> tableColumnsMapA = allColumnsBySchemaA.stream()
                .filter(obj -> obj.getTypeId() != null && obj.getTypeId().equals(80000005L))
                .collect(Collectors.groupingBy(DataObject::getParentId));
        
        Map<Long, DataObject> tableMapB = allColumnsBySchemaB.stream()
                .filter(obj -> obj.getTypeId() != null && obj.getTypeId().equals(80000004L))
                .collect(Collectors.toMap(DataObject::getObjectId, obj -> obj));
        
        Map<Long, List<DataObject>> tableColumnsMapB = allColumnsBySchemaB.stream()
                .filter(obj -> obj.getTypeId() != null && obj.getTypeId().equals(80000005L))
                .collect(Collectors.groupingBy(DataObject::getParentId));

        addEvent("开始对比A的表数据量为"+ tableMapA.size() +" B 的数据量为" + tableMapB.size());
        
        // 计算相似度逻辑
        List<MetaDataSimilarityResultDto> similarityResults = new ArrayList<>();
        // 笛卡尔积比较所有表
        for (Map.Entry<Long, DataObject> entryA : tableMapA.entrySet()) {
            DataObject tableA = entryA.getValue();
            Long tableAId = entryA.getKey();
            List<DataObject> columnsA = tableColumnsMapA.getOrDefault(tableAId, new ArrayList<>());
            
            for (Map.Entry<Long, DataObject> entryB : tableMapB.entrySet()) {
                DataObject tableB = entryB.getValue();
                Long tableBId = entryB.getKey();
                List<DataObject> columnsB = tableColumnsMapB.getOrDefault(tableBId, new ArrayList<>());
                
                // 计算表英文名相似度
                BigDecimal tableSimilarity = calculateTableSimilarity(tableA, tableB);
                
                // 计算字段英文名相似度
                BigDecimal fieldSimilarity = calculateFieldSimilarity(columnsA, columnsB);
                
                // 创建结果对象
                MetaDataSimilarityResultDto result = new MetaDataSimilarityResultDto();
                result.setTableAEnglishName(tableA.getPhysicalName());
                result.setTableAChineseName(tableA.getLogicalName());
                result.setTableBEnglishName(tableB.getPhysicalName());
                result.setTableBChineseName(tableB.getLogicalName());
                result.setTableEnglishNameSimilarity(tableSimilarity);
                result.setFieldEnglishNameSimilarity(fieldSimilarity);
                
                similarityResults.add(result);
                
             //   logger.info("相似度计算结果: {} vs {} - 表相似度: {}, 字段相似度: {}",
             //              tableA.getPhysicalName(), tableB.getPhysicalName(),
             //              tableSimilarity, fieldSimilarity);
            }
        }
        
        // 如果数组不为空，直接分区处理
        if (!similarityResults.isEmpty()) {
            addEvent("开始处理结果，数据量为"+similarityResults.size());
            partitionAndSave(similarityResults);
        }
        addEvent("方法运行完成");


    }
    
    /**
     * 分区保存相似度结果
     */
    private void partitionAndSave(List<MetaDataSimilarityResultDto> results) {
        List<SimilarityJobResult> similarityJobResults = new ArrayList<>();
        try {
            // 使用Guava的Lists.partition进行分区，每50万条记录为一组
            List<List<MetaDataSimilarityResultDto>> partitions = Lists.partition(results, 500000);
            for (List<MetaDataSimilarityResultDto> partition : partitions) {
                SimilarityJobResult similarityJobResult = new SimilarityJobResult();
                similarityJobResult.setColumns(partition);
                similarityJobResults.add(similarityJobResult);
            }
            similarityJobResultRepository.saveAll(similarityJobResults);

        } catch (Exception e) {
            logger.error("分区保存相似度结果时发生错误", e);
        }
    }
    
    /**
     * 计算表英文名相似度
     */
    private BigDecimal calculateTableSimilarity(DataObject tableA, DataObject tableB) {
        try {
            String nameA = tableA.getPhysicalName();
            String nameB = tableB.getPhysicalName();
            
            if (nameA == null || nameB == null) {
                return BigDecimal.ZERO.setScale(2, BigDecimal.ROUND_HALF_UP);
            }
            
            // 忽略大小写比较
            if (nameA.equalsIgnoreCase(nameB)) {
                return BigDecimal.ONE.setScale(2, BigDecimal.ROUND_HALF_UP);
            }
            
            return BigDecimal.ZERO.setScale(2, BigDecimal.ROUND_HALF_UP);
        } catch (Exception e) {
            logger.error("计算表相似度时发生错误", e);
            return BigDecimal.ZERO.setScale(2, BigDecimal.ROUND_HALF_UP);
        }
    }
    
    /**
     * 计算字段英文名相似度
     * 相似度 = 表B中英文名与表A英文名相同的字段数 / 表A的字段数 * 100%
     */
    private BigDecimal calculateFieldSimilarity(List<DataObject> tableAColumns, List<DataObject> tableBColumns) {
        try {
            if (tableAColumns == null || tableAColumns.isEmpty()) {
                return BigDecimal.ZERO.setScale(2, BigDecimal.ROUND_HALF_UP);
            }
            
            // 获取表A字段的英文名集合（忽略大小写）
            Set<String> aColumnNames = new HashSet<>();
            for (DataObject col : tableAColumns) {
                String name = col.getPhysicalName();
                if (name != null && !name.trim().isEmpty()) {
                    aColumnNames.add(name.toLowerCase());
                }
            }
            
            // 获取表B字段的英文名集合（忽略大小写）
            Set<String> bColumnNames = new HashSet<>();
            for (DataObject col : tableBColumns) {
                String name = col.getPhysicalName();
                if (name != null && !name.trim().isEmpty()) {
                    bColumnNames.add(name.toLowerCase());
                }
            }
            
            // 计算相同的字段数
            int sameColumnCount = 0;
            for (String aName : aColumnNames) {
                if (bColumnNames.contains(aName)) {
                    sameColumnCount++;
                }
            }
            
            // 计算相似度
            BigDecimal similarity = BigDecimal.valueOf(sameColumnCount)
                    .divide(BigDecimal.valueOf(tableAColumns.size()), 4, BigDecimal.ROUND_HALF_UP);
            
            return similarity.setScale(2, BigDecimal.ROUND_HALF_UP);
            
        } catch (Exception e) {
            logger.error("计算字段相似度时发生错误", e);
            return BigDecimal.ZERO.setScale(2, BigDecimal.ROUND_HALF_UP);
        }
    }
}
