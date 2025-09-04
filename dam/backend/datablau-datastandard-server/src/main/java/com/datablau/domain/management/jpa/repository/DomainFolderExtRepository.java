//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//

package com.datablau.domain.management.jpa.repository;

import com.datablau.domain.management.jpa.entity.DomainFolder;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import javax.transaction.Transactional;

import com.datablau.domain.management.jpa.entity.DomainFolderExt;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository("domainFolderExtRepo")
public interface DomainFolderExtRepository extends CrudRepository<DomainFolderExt, Long> {
    @Modifying
    void deleteByIdIn(Collection<Long> ids);

    @Query("SELECT df FROM DomainFolderExt df WHERE df.fId = ?1")
    DomainFolderExt findByFId(Long fId);

    @Query("SELECT df FROM DomainFolderExt df WHERE df.bizCode = ?1")
    DomainFolderExt findByBizCodeEquals(String bizCode);

    @Query("SELECT df FROM DomainFolderExt df WHERE df.fId in (?1)")
    List<DomainFolderExt> findByFIdIn(Collection<Long> fIds);

    @Query("SELECT df FROM DomainFolderExt df WHERE df.id IN (?1)")
    List<DomainFolderExt> findByIds(Collection<Long> var1);

    @Modifying
    @Query(
            value = "update db_domain_folder_ext set biz_code = ?1 where f_id = ?2",
            nativeQuery = true
    )
    void updateBizCodeByFId(String bizCode, Long fId);

}
