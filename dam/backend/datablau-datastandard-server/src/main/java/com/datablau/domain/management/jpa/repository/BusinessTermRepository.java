package com.datablau.domain.management.jpa.repository;

import com.datablau.domain.management.data.DomainState;
import com.datablau.domain.management.jpa.entity.BusinessTerm;
import com.datablau.domain.management.jpa.entity.Domain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;

/**
 * @ClassName：BusinessTermRepository
 * @Author: dingzicheng
 * @Date: 2024/9/2 13:37
 * @Description: 业务术语Repository
 */
@Repository("busTermRepo")
public interface BusinessTermRepository extends JpaRepository<BusinessTerm, Long> {
    Boolean existsAllByChName(String chName);

    BusinessTerm findAllByChName(String chName);
    List<BusinessTerm> findAllByChNameIn(Collection<String> chNames);
    List<BusinessTerm> findAllByDomainCodeIn(Collection<String> domainCodes);

    @Query("SELECT chName FROM BusinessTerm")
    List<String> findAllChineseName();

    BusinessTerm findAllByIdEquals(Long nsId);

    @Modifying
    @Transactional
    @Query("DELETE FROM BusinessTerm b WHERE b.id in (?1)")
    void deleteByIdIn(Collection<Long> ids);

    List<BusinessTerm> findAllByIdIn(Collection<Long> ids);

    BusinessTerm findAllByUpdatingNsId(Long nsId);

    List<BusinessTerm> findByFolderIdInAndState(Collection<Long> folderIds, DomainState state);

    @Query(
            value = "select state, count(*) cnt from db_business_term  group by state ",
            nativeQuery = true
    )
    List<Object[]>  findAllByStateGroup();

    @Query("select b from BusinessTerm b where b.domainCode = ?1")
    BusinessTerm findByDomainCode(String domainCode);

}
