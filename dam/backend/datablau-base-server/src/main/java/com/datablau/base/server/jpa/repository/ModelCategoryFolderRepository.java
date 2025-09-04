package com.datablau.base.server.jpa.repository;

import com.datablau.base.server.jpa.entity.ModelCategoryFolder;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * @author zxy
 * @create 2025/4/9 上午11:21
 */
@Repository
public interface ModelCategoryFolderRepository extends PagingAndSortingRepository<ModelCategoryFolder, Long> {

    List<ModelCategoryFolder> findAll();

    ModelCategoryFolder findByNameEquals(String name);

    ModelCategoryFolder findByFolderIdEquals(Long folderId);

    List<ModelCategoryFolder> findAllByParentIdEquals(Long folderId);

    @Transactional
    void deleteByFolderIdIn(List<Long> folderIds);

    ModelCategoryFolder findByCategoryId(Long categoryId);


    boolean existsByParentId(Long parentId);
}
