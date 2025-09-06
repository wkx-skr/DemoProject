//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//

package com.datablau.domain.management.jpa.repository;

import com.datablau.domain.management.constants.DomainCheckState;
import com.datablau.domain.management.data.DomainState;
import com.datablau.domain.management.jpa.entity.Domain;
import com.datablau.domain.management.jpa.entity.DomainExt;
import com.datablau.domain.management.jpa.entity.DomainFolderExt;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;

@Repository("domainExtRepo")
public interface DomainExtRepository extends CrudRepository<DomainExt, Long> {
    @Modifying
    @Query("DELETE FROM DomainExt df WHERE df.dId = ?1")
    @Transactional
    void deleteDomainExtByDIdEquals(String dId);

    @Modifying
    @Query("DELETE FROM DomainExt df WHERE df.dId in (?1)")
    @Transactional
    void deleteDomainExtByDIdIn(Collection<String> dIds);

    @Query("SELECT df FROM DomainExt df WHERE df.dId = ?1")
    DomainExt findByDIdEquals(String dId);

    @Query("SELECT df FROM DomainExt df WHERE df.dId in (?1)")
    List<DomainExt> findByDIdIn(Collection<String> dIds);

    @Query("SELECT df FROM Domain df WHERE df.referenceCode = ?1")
    List<Domain> findDomainByReferenceCode(String referenceCode);

    @Query("SELECT df FROM Domain df WHERE df.referenceCode in (?1)")
    List<Domain> findDomainByReferenceCodeIn(Collection<String> referenceCodes);

    @Query("SELECT df FROM Domain df WHERE df.chineseName in (?1) and df.state = ?2")
    List<Domain> findDomainByChineseNameInAndStateEquals(Collection<String> chineseNames, DomainState state);

    @Modifying
    @Query("update DomainExt set checkState = ?2 WHERE dId in (?1) and checkState != 'PASS'")
    @Transactional
    int updateCheckState(List<String> domainIds, DomainCheckState domainCheckState);

    @Query("SELECT df.dId FROM DomainExt df WHERE CONCAT(',', df.referenceTerm, ',') LIKE CONCAT('%', ?1, ',%')")
    List<String> findDomainIdsByReferenceTerm(String ReferenceTerm);
}
