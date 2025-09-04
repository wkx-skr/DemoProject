package com.datablau.domain.management.api;


import com.andorj.common.core.data.CommonPair;
import com.andorj.common.data.EditHistory;
import com.andorj.common.data.PageResult;
import com.andorj.model.common.search.QueryParameterCriteria;
import com.datablau.data.common.data.instantjob.ImportInstantJobResult;
import com.datablau.data.common.data.restApi.RestApiDescriptorSimple;
import com.datablau.domain.management.data.DomainState;
import com.datablau.domain.management.dto.*;
import com.datablau.domain.management.dto.base.CompareCodeDto;
import com.datablau.domain.management.jpa.entity.BatchApply;
import com.datablau.domain.management.jpa.entity.BatchApplyDetail;
import com.google.common.cache.LoadingCache;

import java.io.File;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;


/**
 * 数据标准，标准代码，命名词典的服务API
 */
public interface DomainService {
    Long DOMAIN_CATEGORY_ID = 1L;
    String DOMAIN_CATEGORY_ID_STR = "1";
    Long INDEX_CATEGORY_ID = 2L;
    String INDEX_CATEGORY_ID_STR = "2";
    Long REALM_CATEGORY_ID = 4L;
    String INDEX_REALM_ID_STR = "4";

    /**
     * Load all domains of given state and in the given category
     */
    List<DomainDto> loadDomains(DomainState state, Long domainCategoryId, String currentUser);

    /**
     * 读取指定用户能访问的所有已经发布的数据标准
     */
    List<DomainDto> loadUserAccessibleDomains(String currentUser);

    /**
     * 读取指定用户能访问的所有已经发布的数据标准(在某个时间戳之后，增量获取)
     */
    List<LocalDomainDto> loadUserAccessibleDomainsAfterTimestamp(String currentUser, Long timestamp, Integer apiVersion);

    /**
     * DDM获取数据标准
     */
    LoadDomainDto loadUserAccessibleDomainsForDdm(LoadDomianQueryDto loadDomianQueryDto);

    /**
     * Get updated domains after specific time
     */
    List<DomainDto> loadDomainsModifiedAfterTimestamp(Long timestamp, DomainState state,
                                                      Long domainCategoryId);

    /**
     * Create domain
     */
    DomainDto addDomain(String currentUser, DomainDto domain, Boolean published);

    /**
     * This api will return a map of folder -> folder full path
     * Eg.    10 -> ["标准","财务", "会计师"], and "会计师" id is 10
     *
     * @param folderIds
     * @return
     */
    Map<Long, List<String>> buildDomainFullPath(Collection<Long> folderIds);

    /**
     * 获取所有标准分类
     *
     * @return
     */
    List<DomainFolderDto> getAllDomainCategories();

    /**
     * 获取一个用户能访问的所有标准分类
     *
     * @param username
     * @return
     */
    List<DomainFolderDto> getAllDomainCategoriesOfUser(String username);

    /**
     * Get DDC index name for different typeId
     *
     * @param typeId
     * @return
     */
    String getDDCIndexName(Long typeId);

    /**
     * Get udps of specified category
     */
    List<DomainUdpDto> getDomainUdps(Long domainCategoryId);

    /**
     * Batch create udps of specified category
     */
    List<DomainUdpDto> batchCreateDomainUdps(List<DomainUdpDto> udps, Long domainCategoryId,
                                             boolean forceClear);

    /**
     * Get the count of domain of given category.
     * If domainCategoryId = null, then will return the sum of all categories' count
     *
     * @param domainCategoryId
     * @return
     */
    Long totalDomains(Long domainCategoryId);

    /**
     * Get last changes of domains
     *
     * @param domainIds
     * @return domainId -> EditHistory map
     */
    Map<String, EditHistory> getDomainsLatestEditHistories(Collection<String> domainIds);

    /**
     * Get the count of standard code
     *
     * @return
     */
    Long totalCode(Long categoryId);

    /**
     * Update domain
     */
    boolean updateDomain(DomainDto domain, String currentUser);

    /**
     * Create a clone domain of the given domain and put in DEV state
     */
    DomainDto createUpdateDomain(String currentUser, String domainId,
                                 boolean allowCreateMultipleClone);

    /**
     * 把指定的数据标准状态更新为指定状态
     *
     * @param domainId    数据标准Id
     * @param newState    新的状态
     * @param currentUser 当前用户
     * @return 更新完的数据标准
     */
    DomainDto updateDomainState(String domainId, DomainState newState, String currentUser);

    /**
     * 更新数据标准状态，给流程用
     *
     * @param domainDto   数据标准
     * @param message     编辑历史信息
     * @param currentUser 用户
     * @return 返回更新后的标准
     */
    DomainDto updateDomainState(DomainDto domainDto, String message, String currentUser);

    /**
     * Delete domains by domain code
     *
     * @param currentUser
     * @param domainCodes
     * @return deleted domain ids
     */
    List<String> removeDomains(String currentUser, Collection<String> domainCodes);

    /**
     * Delete domains by domain ids
     */
    void removeDomainByIds(String currentUser, Collection<String> domainIds);

    /**
     * Get the history version of the speicified domain
     *
     * @param domainId
     * @return
     */
    List<DomainVersionDto> getDomainVersions(String domainId);

    /**
     * Change domain state to DomainState.X
     *
     * @param domainId
     * @param username
     * @return whether abolished or not
     */
    boolean abolishDomain(String domainId, String username);

    /**
     * Publish domain directly to accepted state
     */
    void publishDomainDirectly(String currentUser, Collection<DomainDto> domains, boolean published);

    /**
     * Publish code directly to accepted state
     */
    void publishCodeDirectly(String currentUser, Collection<StandardCodeDto> codes, Long categoryId);

    /**
     * Get domain by domain id
     */
    DomainDto getDomainByDomainId(String domainId);

    /**
     * Get a batch of domains by domain ids
     */
    List<DomainDto> getDomainsByDomainIds(Collection<String> domainIds);

    /**
     * Get page of domains in specified category
     */
    PageResult<DomainDto> getPageDomains(DomainQueryDto queryDto);

    /**
     * Get page of domains in specified category by name or code
     */
    PageResult<DomainDto> getPageDomainsByNameOrCode(DomainQueryDto queryDto);

    /**
     * Get all domains by categoryId and state
     */
    List<DomainDto> getDomainsByFolderId(DomainState state, Long categoryId, Long folderId);

    /**
     * Get list of domains in specified category
     */
    List<DomainDto> getListDomains(DomainQueryDto queryDto);

    /**
     * Discard standard code
     */
    void discardCode(String currentUser, String codeNumber, Long categoryId);

    /**
     * Undiscard standard code
     */
    void undiscardCode(String currentUser, String codeNumber, Long categoryId);

    /**
     * Save the entire user defined domains
     *
     * @param root
     */
    void savePrivateDomains(DomainFolderDto root, String currentUser);

    /**
     * Save all private codes of the user.
     * This will be a full replacement
     *
     * @param codes
     * @param owner
     */
    void savePrivateCodes(Collection<StandardCodeDto> codes, String owner);

    /**
     * Get all private codes of the user
     *
     * @param username
     * @return
     */
    List<StandardCodeDto> getPrivateCodesOfUser(String username);

    /**
     * Returns the user defined privatd domain last update timestamp
     *
     * @param currentUser 当前的用户
     * @return 最后更新时间
     */
    Long getPrivateDomainLastUpdateTime(String currentUser);

    /**
     * Saves user defined namingstandards, all old namingstandards will be replaced
     *
     * @param namingStandards
     */
    void saveUserPrivateNamingStandards(Collection<NamingStandardDto> namingStandards);

    /**
     * Saves user defined namingstandards, all old namingstandards will be replaced
     *
     * @param namingStandards
     */
    void saveUserPrivateNamingStandards(Collection<NamingStandardDto> namingStandards, String username);


    /**
     * Search the user's private namingstandards according to the criteria
     *
     * @param criteria
     * @param username
     * @return
     */
    PageResult<NamingStandardDto> searchPrivateNamingStandards(
            NamingStandardSearchCriteriaDto criteria, String username);

    /**
     * Search the public namingstandards accoriding to the criteria
     *
     * @param criteria
     * @return
     */
    PageResult<NamingStandardDto> searchPublicNamingStandards(
            NamingStandardSearchCriteriaDto criteria);

    /**
     * Returns the user defined private code last update timestamp
     *
     * @param currentUser 当前用户
     * @return 私有码值最后更新时间
     */
    Long getPrivateCodeLastUpdateTime(String currentUser);

    /**
     * Gets the user defined private namingstandards
     *
     * @param username
     * @return
     */
    List<NamingStandardDto> getUserPrivateNamingStandards(String username);

    /**
     * Returns the user defined namingstandard last update timestamp
     *
     * @param currentUser
     * @return
     */
    Long getPrivateNamingStandardLastUpdateTime(String currentUser);

    /**
     * One call to addPublicDomains and addPublicCodes
     *
     * @param newDomains
     * @param codes
     * @param currentUser
     */
    void addPublicDomainAndPublicCodes(List<DomainDto> newDomains, List<StandardCodeDto> codes,
                                       String currentUser);

    /**
     * Get all private domains of all users
     * if currentUser is not empty, then will only get the user's private domains
     *
     * @return
     */
    LoadPrivateDomainDto getAllPrivateDomains(String currentUser);

    /**
     * Get domain by domain code, only when the domain is in A state can be found
     *
     * @param domainCode
     * @return
     */
    DomainDto getDomainByDomainCode(String domainCode);

    /**
     * Get all domains by the given domain code, all domains will be returned
     *
     * @param domainCode
     * @return
     */
    List<DomainDto> getDomainsByDomainCode(String domainCode);

    /**
     * Get public domains by the given standard code
     *
     * @param stdCode
     * @return
     */
    List<DomainDto> getDomainsByReferenceCode(String stdCode);

    /**
     * Get the user list of private domains
     *
     * @return
     */
    List<String> getPrivateDomainUserList();

    /**
     * Get the user's private domains in tree format
     *
     * @param username
     * @return
     */
    DomainFolderDto getUserPrivateDomains(String username);

    /**
     * Get the user's private domains in tree format (After a certain timestamp, get incrementally)
     *
     * @param username
     * @return
     */
    CategoryNodeDto getUserPrivateDomainsAfterTimestamp(String username, Long timestamp, Integer apiVersion);

    /**
     * Get private domains by domainIds, do not considering the owner
     *
     * @param domainIds
     * @return
     */
    List<DomainDto> getPrivateDomains(Collection<String> domainIds);

    /**
     * Submit a domain review request
     *
     * @param currentUser
     * @param assignee
     * @param domainId
     */
    void submitDomainReviewRequest(String currentUser, String assignee, String domainId);

    /**
     * Submit a batch of domain review requests
     *
     * @param currentUser
     * @param assignee
     * @param domainIds
     * @return updated domains
     */
    List<DomainDto> submitDomainReviewRequest(String currentUser, String assignee,
                                              Collection<String> domainIds);

    /**
     * Reject a batch of domain review requests with a review comment
     *
     * @param currentUser
     * @param domainIds
     * @param comment
     * @param force       force reject without permission check
     */
    void rejectDomainReviewRequests(String currentUser, Collection<String> domainIds,
                                    String comment, boolean force);

    /**
     * Approve a batch of domain review requests with a review comment
     *
     * @param currentUser
     * @param domainIds
     * @param reviewer
     * @param comment
     * @param force       force approve without permission check
     * @return to be updated domains
     */
    List<DomainDto> approveDomainReviewRequests(String currentUser, Set<String> domainIds, String reviewer,
                                                String comment, boolean force);

    /**
     * Withdraw a batch of domain review requests
     *
     * @param currentUser
     * @param domainIds
     * @param force       force withdraw without permission check
     */
    List<DomainDto> withDrawDomains(String currentUser, Collection<String> domainIds, boolean force);

    /**
     * Get domains by keyword and other criteria and return in tree format.
     * Will be searched in chinese name and english name
     *
     * @param currentUser
     * @param keyword
     * @param state
     * @param domainCategoryId
     * @return
     */
    DomainTreeNodeDto searchDomains(String currentUser, String keyword, DomainState state, Long domainCategoryId);

    /**
     * Get flat collection of domains by keyword
     *
     * @param domainIds
     * @param keyword
     * @return
     */
    Set<SimpleDomainDto> searchDomains(Collection<String> domainIds, String keyword);

    /**
     * Find simple domains by given domain ids
     *
     * @param domainIds
     * @return
     */
    Set<SimpleDomainDto> findSimpleDomainsByDomainIds(Collection<String> domainIds);

    /**
     * Get all public code, including all properties
     *
     * @return
     */
    List<StandardCodeDto> getPublicCodes(DomainState state, Long categoryId);

    /**
     * 得到指定用户能访问的所有标准代码
     *
     * @return
     */
    List<StandardCodeDto> getUserAccessiblePublicCodes(String username);

    /**
     * Get all public code but only return base properties
     *
     * @return
     */
    List<BaseStandardCodeDto> getBaseCodeList(Long categoryId);

    /**
     * Fetch some codes base info by code numbers
     *
     * @param codeNumbers
     * @return
     */
    List<BaseStandardCodeDto> getBaseCodesByCodeNumbers(List<String> codeNumbers, Long categoryId);

    /**
     * Fetch some codes base info by code numbers and name
     *
     * @param codeNumbers
     * @param name
     * @return
     */
    List<BaseStandardCodeDto> getBaseCodesByNumbersAndName(List<String> codeNumbers, String name, Long categoryId);

    /**
     * Get all discarded public code
     *
     * @return
     */
    List<BaseStandardCodeDto> getDiscardCodeList(Long categoryId);

    /**
     * Fetch a code by its code number
     *
     * @param codeNumber
     * @return
     */
    StandardCodeDto getCodeByCodeNumber(String codeNumber, Long categoryId);

    /**
     * Fetch some codes by code numbers
     *
     * @param codeNumbers
     * @return
     */
    List<StandardCodeDto> getCodesByCodeNumbers(List<String> codeNumbers, Long categoryId);

    /**
     * Create a standardcode, the code number of the standardcode should not already exist
     *
     * @param code
     * @return
     */
    StandardCodeDto addCode(StandardCodeDto code, String currentUser);

    /**
     * Update a standardCode, based on the code number of the standardcode
     *
     * @param code
     * @return
     */
    StandardCodeDto updateCode(StandardCodeDto code, String currentUser);

    /**
     * Delete a collection of standardcode by their code
     *
     * @param codeNumbers
     */
    void deleteCodeByCodeNumbers(Collection<String> codeNumbers, String currentUser, Long categoryId);

    /**
     * Create a collection of standardcode
     *
     * @param codes
     */
    void addPublicCodes(List<StandardCodeDto> codes, String currentUser);

    /**
     * Get a standardcode all old versions
     *
     * @param codeNumber
     * @return
     */
    List<StandardCodeDto> getAllOldCodeVersions(String codeNumber, Long categoryId);

    /**
     * Get a public standard code edit history
     *
     * @param codeNumber
     * @param pageSize
     * @param currentPage
     * @return
     */
    PageResult<EditHistory> getCodeHistory(String codeNumber, Long categoryId, int pageSize, int currentPage);

    /**
     * Get domains in tree format
     *
     * @param state            The domain state
     * @param domainCategoryId The domain categoryId, the 1st lv folderId
     * @param currentUser
     * @return
     */
    DomainTreeNodeDto loadDomainTree(DomainState state, Long domainCategoryId,
                                     String currentUser);

    /**
     * Get domains and folders in tree format
     *
     * @param state
     * @param domainCategoryId
     * @param currentUser
     * @param onlyFolder       if this is tree, then only get the tree folder, otherwise, will get domains and folders
     * @return
     */
    DomainTreeNodeDto loadDomainTree(DomainState state, Long domainCategoryId, String currentUser, boolean onlyFolder);

    /**
     * Get domains and folders in tree format
     *
     * @param state
     * @param domainCategoryId
     * @param currentUser
     * @param onlyFolder       if this is tree, then only get the tree folder, otherwise, will get domains and folders
     * @param forceLoadRoot    if this is true, then force load root of domain tree
     * @return
     */
    DomainTreeNodeDto loadDomainTree(DomainState state, Long domainCategoryId,
                                     String currentUser, boolean onlyFolder, boolean forceLoadRoot);

    /**
     * Get a domain edit history
     *
     * @param domainId
     * @param pageSize
     * @param currentPage
     * @return
     */
    PageResult<EditHistory> getDomainHistory(String domainId, int pageSize, int currentPage);

    /**
     * Create a folder with given name
     *
     * @return
     */
    DomainFolderDto createFolder(DomainFolderDto folderDto);

    /**
     * Update a folder name
     *
     * @return
     */
    DomainFolderDto updateFolder(DomainFolderDto folderDto);

    /**
     * 获取所有目录类别列表
     *
     * @return
     */
    Set<String> getDistinctDomainFolderCatalogs();

    /**
     * Check the domain folder of the specified category, make sure all folders in the path are created, return the most deepest folderId
     *
     * @param path
     * @param categoryId
     * @return
     */
    Long makeSureDomainPathExists(List<String> path, Long categoryId);

    /**
     * Delete a folder. All data stores in this folder and subfolders will be deleted
     *
     * @param folderId
     * @return
     */
    void deleteFolder(DomainFolderResDto folderId);

    /**
     * Create a namingstandard
     *
     * @param namingStandard
     * @return
     */
    NamingStandardDto addNamingStandard(NamingStandardDto namingStandard, String currentUser);

    /**
     * Update a namingstandard
     *
     * @param namingStandard
     * @return
     */
    NamingStandardDto updateNamingStandard(NamingStandardDto namingStandard, String currentUser);

    /**
     * Delete namingstandard based on given ids
     *
     * @param ids
     */
    void deleteNamingStandards(List<Long> ids, String currentUser);

    /**
     * Get a page of namingstandard
     */
    PageResult<NamingStandardDto> getPageOfNamingStandard(NamingStandardQueryDto queryDto);

    /**
     * Get all public namingstandards
     *
     * @return
     */
    List<NamingStandardDto> getAllNamingStandards();


    /**
     * Get all public namingstandards contains keywords
     *
     * @param name     do not equals to
     * @param likeName contains
     * @return
     */
    List<NamingStandardDto> getSimilarNamingStandards(String name, String likeName);

    /**
     * Get all updated/created namingstandard after specified timestamp
     *
     * @param lastFetchTimestamp
     * @return
     */
    List<NamingStandardDto> getRecentUpdatedNamingStandards(Long lastFetchTimestamp);

    /**
     * Get all namingstandard categories
     *
     * @return
     */
    List<String> getAllNamingStandardCategories();

    /**
     * Import a batch of namingstandards
     *
     * @param file
     * @param submitter
     * @throws Exception
     */
    ImportInstantJobResult importNamingStandards(File file, String submitter) throws Exception;

    /**
     * Import a batch of namingstandards
     *
     * @param namingStandards
     * @param submitter
     */
    void importNamingStandards(List<NamingStandardDto> namingStandards, String submitter);

    /**
     * Get edit history of a namingstandard
     *
     * @param nsId
     * @param pageSize
     * @param currentPage
     * @return
     */
    PageResult<EditHistory> getNamingStandardHistory(Long nsId, int pageSize, int currentPage);

    /**
     * Resync data to ddc, currently only support LDMTypes.oDataStandard and LDMTypes.oDataStandardCode
     *
     * @param typeId
     */
    void resyncDDCBaseData(Long typeId);

    /**
     * 获取所有的标准代码的主题
     *
     * @return 返回主题列表
     */
    List<String> getAllStandardDatasetName(Long categoryId);

    /**
     * 更新标准代码状态
     *
     * @param standardCodeDto 标准代码
     * @param message         编辑历史信息
     * @param currentUser     用户
     * @return 返回更新后的标准代码
     */
    StandardCodeDto updateStandardState(StandardCodeDto standardCodeDto, String message, String currentUser);

    /**
     * 更新数据标准的updatingId，当已发布的标准 A 被申请走流程的时候，会复制一个审核中的标准 B （除了domainId，其他属性与A相同），
     * 并且把辅助出来的标准 B 的domainId 复制到标准 A 的updatingId中
     *
     * @param domainDto   数据标准
     * @param currentUser 当前用户
     */
    void updateDomainUpdatingId(DomainDto domainDto, String currentUser);

    /**
     * 更新标准代码的updatingId，当已发布的标准代码 A 被申请走流程的时候，会复制一个审核中的标准代码 B （除了code，其他属性与A相同），
     * 并且把辅助出来的标准代码 B 的code 复制到标准代码 A 的updatingCode中
     *
     * @param standardCodeDto 标准代码
     * @param currentUser     当前用户
     */
    void updateStandardUpdatingCode(StandardCodeDto standardCodeDto, String currentUser);

    /**
     * 发布数据标准
     *
     * @param domainId    标准id
     * @param currentUser 用户
     */
    void publicDomain(String domainId, String currentUser);

    /**
     * 发布数据标准
     *
     * @param domainId    标准id
     * @param currentUser 用户
     * @param stateOriginal 原始状态
     */
    void publicDomain(String domainId, String currentUser, String stateOriginal);

    /**
     * 发布标准代码
     *
     * @param code        标准代码code
     * @param currentUser 用户
     */
    void publicStandard(String code, String currentUser);

    /**
     * 发布标准代码
     *
     * @param code        标准代码code
     * @param currentUser 用户
     * @param stateOriginal 原始状态
     */
    void publicStandard(String code, String currentUser, String stateOriginal);

    /**
     * 复制已发布标准，生成一个审核中的标准
     *
     * @param domainId   数据标准id
     * @param toBeUpdate 要复制的标准
     * @param newDto
     */
    void generateCopyDomain(String domainId, DomainDto toBeUpdate, StandardCodeDto newDto);

    /**
     * 删除复制出来的标准
     *
     * @param domainId    数据标准id
     * @param replace     是否替换旧的标准
     * @param currentUser 用户
     */
    void deleteCopyDomain(String domainId, boolean replace, String currentUser);

    /**
     * 复制已发布标准代码，生成一个审核中的标准代码
     *
     * @param code       标准代码
     * @param toBeUpdate 要复制的标准
     */
    void generateCopyStandard(String code, StandardCodeDto toBeUpdate);

    /**
     * 删除复制出来的标准
     *
     * @param code        标准代码
     * @param replace     是否替换旧的标准代码
     * @param currentUser 用户
     */
    void deleteCopyStandard(String code, boolean replace, String currentUser);

    /**
     * 比较数据标准的历史版本
     *
     * @param domainId   数据标准id
     * @param srcVersion 版本1
     * @param tagVersion 版本2
     */
    CommonPair<DomainDto, DomainDto> compareHistoryBetweenVersion(String domainId, Integer srcVersion, Integer tagVersion);

    /**
     * 比较标准代码的历史版本
     *
     * @param code       标准代码的code
     * @param srcVersion 版本1
     * @param tagVersion 版本2
     */
    StandardCompareResultDto compareCodeHistoryBetweenVersion(String code, Long categoryId, Integer srcVersion, Integer tagVersion);


    /**
     * 添加导入的数据标准
     *
     * @param uploadFile 导入文件
     * @param published  是否直接已发布
     * @throws Exception
     */
    ImportInstantJobResult addImportDomains(File uploadFile, boolean published, Long categoryId, String username, boolean autoGenCode, boolean ignoreError) throws Exception;

    /**
     * 根据数据标准编码查询数据标准，不查询正在更新的已发布标准的副本标准
     *
     * @param codes 标准编码集合
     * @return
     */
    List<DomainDto> findDomainByDomainCodes(List<String> codes);

    /**
     * 同步标准代码到图数据库
     */
    void syncGraphStandardCode();

    /**
     * 同步数据标准到图数据库
     */
    void syncGraphDomain();

    /**
     * 获取所有命名词典分类
     *
     * @return
     */
    List<String> getAllCategories();

    /**
     * @param standards
     */
    void publishNamingStandardsDirectly(List<NamingStandardDto> standards);

    /**
     * 获取命名词典个数
     *
     * @return
     */
    Long totalNamingStandard();

    /**
     * 获取所有数据标准的ID集合
     *
     * @return
     */
    List<String> getAllDomainIds();

    /**
     * 根据类型回去不同标准ID集合
     * @param categoryIds
     * @return
     */
    List<String> getAllDomainIdsByCategoryIds(Collection<Long> categoryIds);

    /**
     * 根据分类和id集合查询
     *
     * @param categoryId
     * @param domainIds
     * @return
     */
    List<DomainDto> getAllByCategoryIdEqualsAndDomainIdIn(Long categoryId, List<String> domainIds);

    /**
     * 导出数据标准
     *
     * @throws Exception
     */
    File exportDomain(DomainQueryDto queryDto) throws Exception;

    /**
     * 导出数据标准模板
     */
    File exportDomainTemplate(Long domainCategoryId, Map<Integer, String> udpMap);

    /**
     * 导出标准代码
     *
     * @throws Exception
     */
    File exportStandardCode(Long categoryId) throws Exception;

    /**
     * 导入标准代码
     *
     * @param uploadFile 导入文件
     * @throws Exception
     */
    @Deprecated
    void importStandardCode(File uploadFile, Long categoryId, boolean autoGenCode) throws Exception;

    /**
     * 导入标准代码
     *
     * @throws Exception
     * @return
     */
    ImportInstantJobResult importStandardCode(File uploadFile, Long categoryId, boolean publish, boolean autoGenCode, boolean ignoreError, String user) throws Exception;

    /**
     * 导出命名词典
     *
     * @throws Exception
     */
    NsExportResult exportNamingStandards() throws Exception;

    /**
     * 校验数据标准是否可以变更
     */
    void checkDomainUpdate(DomainDto domainDto);

    /**
     * 通过目录id获取目录分类
     */
    DomainFolderDto getCategoryByFolderId(Long folderId);

    /**
     * 通过需求id获取指标
     */
    List<DomainDto> getMetricsByRequirementId(Long requirementId);

    /**
     * 更新缓存
     */
    void updateCache();

    /**
     * 更新主题域
     */
    void updateDomainTopic(String oldDatasetName, String newDatasetName);

    /**
     * 获取标准的继承结构
     *
     * @param categoryId
     * @return
     */
    DomainInheritNodeDto getInheritDomains(Long categoryId);

    /**
     * 获取所有api
     */
    List<RestApiDescriptorSimple> getAllApi();


    /**
     * 获取domain
     *
     * @param name
     * @return
     */
    List<String> getDomains(String name);

    /**
     * 获取domain
     *
     * @param ids
     * @return
     */
    List<DomainDto> getDomainsByIds(Collection<String> ids);

    /**
     * 标准
     *
     * @param domainDtos
     * @return
     */
    List<DomainDto> convertDomainSomePropertiesIdToName(List<DomainDto> domainDtos);

    /**
     * 获取所有数据标准的所有历史版本
     */
    Map<String, List<DomainVersionDto>> getAllDomainsVersions();

    /**
     * 获取所有数据标准的所有历史版本(在某个时间戳之后，增量获取)
     */
    Map<String, List<LocalDomainDto>> getAllDomainsVersionsAfterTimestamp(Long timestamp, Integer apiVersion);

    /**
     * 获取标准代码数量
     *
     * @param state
     * @return
     */
    Long getCodeCount(DomainState state);

    /**
     * 获取标准代码数量
     *
     * @param state
     * @return
     */
    Long getCodeCountByDate(DomainState state, Date endTime);

    /**
     * 获取标准或指标数量
     *
     * @param state
     * @param categoryId
     * @return
     */
    Long getDomainOrIndexCount(DomainState state, Long categoryId);

    /**
     * 获取标准或指标数量
     *
     * @param state
     * @param categoryId
     * @return
     */
    Long getDomainOrIndexCountByDate(DomainState state, Long categoryId, Date endTime);


    /**
     * 统计被数据标准引用的机构数量
     */
    Long countDomainOrgReference(String orgBm);

    /**
     * 同步es接口
     */
    void syncAllDomains();

    /**
     * Get copy domain by original domain id
     */
    DomainDto getCopyDomainByOriginalDomainId(String domainId);

    /**
     * 根据数据标准code查询数据标准
     */
    List<DomainDto> getDomainByDomainCodes(Collection<String> domainCodes);

    /**
     * 数据标准通用查询接口
     */
    List<DomainDto> domainGeneralQuery(QueryParameterCriteria criteria);

    /**
     *  metric原子、衍生指标目录同步创建
     */
    DomainFolderDto createDomainFolderFromMetric(DomainFolderDto dto);

    /**
     *  metric原子、衍生指标目录同步更新
     */
    DomainFolderDto updateDomainFolderFromMetric(DomainFolderDto dto);

    /**
     *  metric原子、衍生指标目录同步删除
     */
    void deleteDomainFolderFromMetric(DomainFolderResDto dto);

    /**
     * Create a standardcode from db, the code number of the standardcode should not already exist
     *
     * @param code
     * @return
     */
    StandardCodeSourceDto addCodeFromDB(StandardCodeSourceDto code, String currentUser);


    /**
     * 通过任务id查询标准代码
     * @param jobId
     * @return
     */
    StandardCodeDto getCodeByJobIdWithSource(Long jobId);

    /**
     * update a codesource
     *
     * @param code
     * @return
     */
    void updateCodeSource(StandardCodeSourceDto code, String user, Boolean updateCodeSource);

    /**
     * Compare the differences between the two through different encodings
     * @return
     */
    StandardCompareResultDto compareByCode(CompareCodeDto dto);

    /**
     * get code source from code
     *
     * @param code
     * @return
     */
    StandardCodeSourceDto getCodeSource(String code);

    /**
     * delete code source from code
     *
     * @param code
     * @return
     */
    void deleteCodeSource(String code, Long jobId);

    /**
     * 复制已发布标准代码，生成一个审核中的标准代码，并创建来源同步任务
     *
     * @param code       标准代码
     * @param user       操作人
     */
    void generateCopyStandardWithSource(String code, String user, StandardCodeDto toBeUpdate);


    /**
     * 发布来源
     *
     * @param code
     * @return
     */
    void releaseCodeSource(StandardCodeSourceDto code, String user);

    /**
     * 批量查询数据规则
     * @param domainIds
     * @return
     */
    List<DataRuleDto> getDataRuleByDomainIds(Collection<String> domainIds);

    /**
     * 批量查询数据规则
     * @param ruleIds
     * @return
     */
    List<DataRuleDto> getDataRuleByIds(Collection<Long> ruleIds);

    /**
     * 查询标准代码被数据标准引用的统计
     */
    Map<String, Integer> getStandardUsedCount(Collection<String> stdCodes);

    /**
     * 查询标准和指标，给全局搜索用
     * @return
     */
    List<DomainDto> getDomainForGlobalSearch();

    /**
     * 查询标准代码的数据规则的描述
     * @return
     */
    String getStandardDataRuleDescription();


    List<Long> getDataRuleIdsByTechRuleType(String techRuleType);

    LoadingCache<Long, Map<String, String>> getDomainChineseNames();


    /**
     * 批次批量通过或者驳回
     *
     * @param toBeUpdate
     * @param message
     * @param currentUser
     * @param details
     * @return
     */

    void updateDomainStateBatch(List<DomainDto> toBeUpdate, String message, String currentUser, String type, Integer state, List<BatchApplyDetail> details,BatchApply o);
}
