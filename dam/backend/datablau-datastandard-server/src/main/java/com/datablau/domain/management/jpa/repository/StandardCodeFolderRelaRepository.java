//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//

package com.datablau.domain.management.jpa.repository;

import com.datablau.domain.management.data.DomainState;
import com.datablau.domain.management.jpa.entity.StandardCodeFolderRela;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Set;

@Repository("standardCodeFolderRelaRepo")
public interface StandardCodeFolderRelaRepository extends CrudRepository<StandardCodeFolderRela, Long> {
    @Modifying
    void deleteByCodeIn(Collection<String> codes);

    @Query("SELECT df FROM StandardCodeFolderRela df WHERE df.fId = ?1")
    List<StandardCodeFolderRela> findByFId(Long fId);

    @Query("SELECT df FROM StandardCodeFolderRela df WHERE df.code = ?1")
    StandardCodeFolderRela findByCodeEquals(String code);

    @Query("SELECT df FROM StandardCodeFolderRela df WHERE df.code in (?1)")
    List<StandardCodeFolderRela> findByCodeIn(Collection<String> codes);

    @Query("SELECT c.code FROM StandardCode c WHERE c.categoryId IN (?1)")
    List<String> findCodesByCategoryIdIn(Set<Long> categoryIds);



}
