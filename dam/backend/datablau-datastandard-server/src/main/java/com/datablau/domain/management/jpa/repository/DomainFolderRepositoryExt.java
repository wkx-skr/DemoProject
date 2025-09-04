//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//

package com.datablau.domain.management.jpa.repository;

import com.datablau.domain.management.jpa.entity.DomainFolder;
import com.datablau.domain.management.jpa.entity.DomainFolderExt;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository("DomainFolderRepositoryExt")
@Primary
public interface DomainFolderRepositoryExt extends DomainFolderRepository {


    @Query("SELECT df  FROM DomainFolder df WHERE df.path LIKE CONCAT(:prefix, '%')")
    List<DomainFolder> findIdsByPathStartingWith(@Param("prefix") String prefix);

    @Query("SELECT df FROM DomainFolder df WHERE df.path LIKE '/1/%/%/%' AND df.path NOT LIKE '/1/%/%/%/%'")
    List<DomainFolder> findfirstLevelFolders();
}
