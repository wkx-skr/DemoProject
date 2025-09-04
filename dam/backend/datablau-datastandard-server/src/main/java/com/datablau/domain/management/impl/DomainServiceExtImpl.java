package com.datablau.domain.management.impl;


import com.datablau.domain.management.data.DomainState;
import com.datablau.domain.management.dto.DomainCountDto;
import com.datablau.domain.management.dto.StatisticsDtoExt;
import com.datablau.domain.management.jpa.entity.BusinessTerm;
import com.datablau.domain.management.jpa.entity.Domain;
import com.datablau.domain.management.jpa.entity.DomainFolder;
import com.datablau.domain.management.jpa.entity.DomainVersion;
import com.datablau.domain.management.jpa.repository.BusinessTermRepository;
import com.datablau.domain.management.jpa.repository.DomainFolderRepositoryExt;
import com.datablau.domain.management.jpa.repository.DomainRepositoryExt;
import com.datablau.domain.management.jpa.repository.DomainVersionRepositoryExt;
import com.datablau.domain.management.service.DomainServiceExt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service("domainServiceExt")
@Primary
public class DomainServiceExtImpl extends DomainServiceImpl implements DomainServiceExt {

    private static final Logger logger = LoggerFactory.getLogger(DomainServiceExtImpl.class);

    @Autowired
    private DomainFolderRepositoryExt domainFolderRepositoryExt;

    @Autowired
    private DomainRepositoryExt domainRepositoryExt;

    @Autowired
    private DomainVersionRepositoryExt domainVersionRepositoryExt;

    @Autowired
    private BusinessTermRepository businessTermRepository;

    public DomainServiceExtImpl() {
        super();
        
    }

    @Override
    public Map<String, Long> getBusinessTermCount() {
        //所有一级目录
        List<DomainFolder> domainFolders1 = domainFolderRepositoryExt.findfirstLevelFolders();
        Map<String, DomainFolder> domainFolderNameMap = domainFolders1.stream().collect(Collectors.toMap(DomainFolder::getName, Function.identity()));
        Map<String, Long> result = new LinkedHashMap<>();
        for (String name : domainFolderNameMap.keySet()) {
            //每个一级目录下的值
            List<DomainFolder> domainFolders = domainFolderRepositoryExt.findIdsByPathStartingWith(domainFolderNameMap.get(name).getPath());
            List<Long> ids = domainFolders.stream().map(DomainFolder::getId).toList();
            List<BusinessTerm> businessTerms = businessTermRepository.findByFolderIdInAndState(ids, DomainState.A);
            result.put(name, (long) businessTerms.size());
        }
        // 按照 value 的大小排序
        Map<String, Long> sortedResult = result.entrySet()
                .stream()
                .sorted(Map.Entry.comparingByValue(Comparator.reverseOrder())) // 按 value 降序排序
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (oldValue, newValue) -> oldValue,
                        LinkedHashMap::new
                ));

        return sortedResult;
    }

    @Override
    public StatisticsDtoExt getBusinessTermPublishCount() {
        List<Object[]>  value = businessTermRepository.findAllByStateGroup();
        Long published = 0L;
        Long unpublished = 0L;

        StatisticsDtoExt statisticsDtoExt = new StatisticsDtoExt();

        for (Object[] row : value) {
            Object group = row[0];
            Object count = row[1];

            if (group == null) {
                continue;
            }

            if (group.equals("A")) {
                published = ((Number) count).longValue();
            } else if (group.equals("C")) {
                unpublished = ((Number) count).longValue();
            }
        }
        statisticsDtoExt.setPublishedBusinessTerm(published);
        statisticsDtoExt.setDevelopingBusinessTerm(unpublished);

        return statisticsDtoExt;
    }


    @Override
    public Map<String, Long> getBusinessCount() {

        //所有一级目录
        List<DomainFolder> domainFolders1 = domainFolderRepositoryExt.findfirstLevelFolders();
        Map<String, DomainFolder> domainFolderNameMap = domainFolders1.stream().collect(Collectors.toMap(DomainFolder::getName, Function.identity()));
        Map<String, Long> result = new LinkedHashMap<>();
        for (String name : domainFolderNameMap.keySet()) {
            //每个一级目录下的值
            List<DomainFolder> domainFolders = domainFolderRepositoryExt.findIdsByPathStartingWith(domainFolderNameMap.get(name).getPath());
            List<Long> ids = domainFolders.stream().map(DomainFolder::getId).toList();
            List<Domain> domains = domainRepositoryExt.findByFolderIdInAndState(ids, DomainState.A);

            result.put(name, (long) domains.size());
        }
        Map<String, Long> sortedResult = result.entrySet()
                .stream()
                .sorted(Map.Entry.comparingByValue(Comparator.reverseOrder())) // 按 value 降序排序
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (oldValue, newValue) -> oldValue,
                        LinkedHashMap::new
                ));
        return sortedResult;
    }

    @Override
    public DomainCountDto getDomainCount() {
        long publicDomain = domainRepositoryExt.countByState(DomainState.A);
        long abolishDomain = domainRepositoryExt.countByState(DomainState.X);
        DomainCountDto domainCountDto = new DomainCountDto();
        domainCountDto.setAbolishDomain(abolishDomain);
        domainCountDto.setAllDomain(publicDomain+abolishDomain);
        return domainCountDto;
    }

    @Override
    public List<DomainCountDto> getDomainCountByMonth() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        YearMonth lastMonth = YearMonth.now().minusMonths(1);
        LocalDate startDate = lastMonth.minusMonths(11).atDay(1);  // 起始月份第一天
        LocalDate endDate = lastMonth.atEndOfMonth();
        Date startUtilDate = convertLocalDateToDate(startDate);
        Date endUtilDate = convertLocalDateToDate(endDate);
        List<Domain> firstPublishBetween = domainRepositoryExt.findByFirstPublishBetween(startUtilDate, endUtilDate);
        // 按月份分组统计
        Map<String, Long> firstPublishCountMap = firstPublishBetween.stream()
                .collect(Collectors.groupingBy(
                        domain -> {
                            LocalDate publishDate = domain.getFirstPublish().toInstant()
                                    .atZone(ZoneId.systemDefault())
                                    .toLocalDate();
                            return YearMonth.from(publishDate).format(formatter);
                        },
                        Collectors.counting()
                ));

        List<Domain> abolishDomains = domainRepositoryExt.findByStateAndLastReviewBetween(DomainState.X, startUtilDate, endUtilDate);

        Map<String, Long> abolishCountMap = abolishDomains.stream()
                .collect(Collectors.groupingBy(
                        domain -> {
                            LocalDate publishDate = domain.getLastReview().toInstant()
                                    .atZone(ZoneId.systemDefault())
                                    .toLocalDate();
                            return YearMonth.from(publishDate).format(formatter);
                        },
                        Collectors.counting()
                ));


        List<DomainVersion> newVersionByMonths = domainVersionRepositoryExt.findNewVersionByMonth(startUtilDate, endUtilDate);
        Map<String, Long> newVersionMap = newVersionByMonths.stream()
                .collect(Collectors.groupingBy(
                        domain -> {
                            LocalDate publishDate = domain.getLastReview().toInstant()
                                    .atZone(ZoneId.systemDefault())
                                    .toLocalDate();
                            return YearMonth.from(publishDate).format(formatter);
                        },
                        Collectors.counting()
                ));

        // 2. 计算起始月份（往前推11个月）
        YearMonth startYearMonth = lastMonth.minusMonths(11);

        //月份集合
        List<String> monthlyRanges = new ArrayList<>();
        YearMonth month = startYearMonth;
        for (int i = 0; i < 12; i++) {
            LocalDate firstDay = month.atDay(1);
            monthlyRanges.add(firstDay.format(formatter));
            month = month.plusMonths(1);
        }

        List<DomainCountDto> results = new ArrayList<>();
        for (String monthlyRange : monthlyRanges) {
            DomainCountDto domainCountDto = new DomainCountDto();
            domainCountDto.setMonth(monthlyRange);
            if (firstPublishCountMap.containsKey(monthlyRange)){
                domainCountDto.setMonthAddCount(firstPublishCountMap.get(monthlyRange));
            }else {
                domainCountDto.setMonthAddCount(0);
            }
            if (abolishCountMap.containsKey(monthlyRange)){
                domainCountDto.setMonthAbolishCount(abolishCountMap.get(monthlyRange));
            }else {
                domainCountDto.setMonthAbolishCount(0);
            }
            if (newVersionMap.containsKey(monthlyRange)){
                domainCountDto.setMonthUpdateCount(newVersionMap.get(monthlyRange));
            }else {
                domainCountDto.setMonthUpdateCount(0);
            }
            results.add(domainCountDto);
        }

        return results;
    }

    public static Date convertLocalDateToDate(LocalDate localDate) {
        // 将LocalDate转换为LocalDateTime
        LocalDateTime localDateTime = localDate.atStartOfDay();
        // 将LocalDateTime转换为ZonedDateTime
        ZonedDateTime zonedDateTime = localDateTime.atZone(ZoneId.systemDefault());
        // 将ZonedDateTime转换为Instant
        Date date = Date.from(zonedDateTime.toInstant());
        return date;
    }
}
