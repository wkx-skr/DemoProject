package com.datablau.domain.management.service;

import com.datablau.domain.management.dto.StandardCodePageDto;
import com.datablau.domain.management.dto.StandardCodeQueryNewDto;

public interface StandardServiceNew {

    StandardCodePageDto findCodesPage(StandardCodeQueryNewDto reqDto);
}
