package com.datablau.domain.management.service;

import com.datablau.domain.management.dto.DomainCountDto;
import com.datablau.domain.management.dto.StatisticsDtoExt;

import java.util.List;
import java.util.Map;

public interface DomainServiceExt {


     Map<String, Long> getBusinessCount();


     DomainCountDto getDomainCount();

     List<DomainCountDto> getDomainCountByMonth();

     Map<String, Long> getBusinessTermCount();

     StatisticsDtoExt getBusinessTermPublishCount();

}
