package com.datablau.domain.management.jpa.repository;


import com.datablau.domain.management.data.DomainState;
import com.datablau.domain.management.jpa.entity.Domain;
import com.datablau.domain.management.jpa.entity.SkipReason;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Date;
import java.util.List;

@Repository("skipReasonRepository")
public interface SkipReasonRepository  extends JpaRepository<SkipReason, Long> {


}
