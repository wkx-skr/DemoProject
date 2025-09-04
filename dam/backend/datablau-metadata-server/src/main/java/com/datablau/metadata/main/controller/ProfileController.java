package com.datablau.metadata.main.controller;

import com.andorj.common.core.annotation.Description;
import com.andorj.common.core.model.LDMTypes;
import com.datablau.base.api.TagService;
import com.datablau.base.data.TagDto;
import com.datablau.data.common.api.instantjob.InstantJob;
import com.datablau.data.common.api.instantjob.InstantJobProgressMonitor;
import com.datablau.data.common.api.instantjob.InstantJobService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.data.instantjob.InstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobStage;
import com.datablau.data.common.data.instantjob.ProfilingInstantJobResult;
import com.datablau.data.common.type.InstantJobType;
import com.datablau.metadata.main.profiling.ProfilingService;
import com.datablau.metadata.main.profiling.dao.entity.Profiling;
import com.datablau.metadata.main.profiling.dao.entity.ProfilingJobResult;
import com.datablau.metadata.main.profiling.dto.ProfilingDto;
import com.datablau.metadata.main.service.metadata.utils.DataSampleUtils;
import com.datablau.metadata.main.util.ServerConstants;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

/**
 * @author Nicky - 数语科技有限公司
 * date 2019/2/27 18:56
 */
@RequestMapping("/profile")
@RestController
@Description("数据探查相关REST API")
@Tag(name = "数据探查相关REST API")
public class ProfileController extends BaseController {

    @Autowired
    private ProfilingService profilingService;

    @Autowired
    private InstantJobService instantJobService;

    @Autowired
    private TagService tagService;

    public ProfileController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @GetMapping("/{objectId}")
    @Description("获取对象的Profile")
    @Operation(summary = "获取对象的Profile")
    public List<ProfilingDto> getObjectProfile(@Parameter(name = "objectId", description = "表的对象ID")
                                               @Description("表的对象ID") @PathVariable("objectId") Long objectId) throws InterruptedException {
        List<Profiling> entities = profilingService.loadProfilingFromDatabase(objectId);
//        DataAuthAccessCheckService checkService = RemoteServiceGetter.getDataAuthAccessCheckService();
        List<ProfilingDto> dtos = new CopyOnWriteArrayList<>();
        CountDownLatch latch = new CountDownLatch(entities.size());
        ExecutorService executor = Executors.newFixedThreadPool(10);
        String username = AuthTools.currentUsername();

        //查询字段绑定的标签
        List<String> itemIds = entities.stream().map(d -> d.getObjectId().toString()).collect(Collectors.toList());
        Map<String, Set<TagDto>> colTagsMap = tagService.getTagsRelationMapOfItemsAndType(itemIds, true, LDMTypes.oAttribute);

        for (Profiling profiling : entities) {
            executor.execute(() -> {
                ProfilingDto dto = new ProfilingDto();
                BeanUtils.copyProperties(profiling, dto);

                boolean isSensitive = DataSampleUtils.checkSensitiveColumn(colTagsMap.get(profiling.getObjectId().toString()));
                dto.setAccess(!isSensitive);
                if (isSensitive) {
                    dto.setProfilingResult(null);
                }
                dtos.add(dto);
                latch.countDown();
            });
        }
        latch.await();
        executor.shutdown();
        return dtos;
    }

    @PostMapping("/{objectId}")
    @Description("提交对指定对象进行Profiling的请求, 只有超级用户和生产模型管理员可以调用此方法")
    //@PreAuthorize(UserRights.HAS_DATA_CATALOG_ADMIN)
    public String submitProfilingJob(@Description("表的对象ID") @PathVariable("objectId") Long objectId) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return instantJobService.submitJob(new InstantJob<InstantJobResult>() {
            @Override
            public void setProgressMonitor(InstantJobProgressMonitor monitor) {

            }

            @Override
            public InstantJobResult call() {
                try {
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    profilingService.submitProfiling(objectId);
                    ProfilingInstantJobResult result = new ProfilingInstantJobResult();
                    result.setJobStatus(InstantJobStage.FINISHED);
                    result.setObjectId(objectId);
                    return result;
                } finally {
                    SecurityContextHolder.createEmptyContext();
                }
            }
        }, InstantJobType.PROFILING.getName() + sdf.format(new Date()), AuthTools.currentUsernameFailFast(), InstantJobType.PROFILING.toString());
    }

    @PostMapping("/jobResult/{objectId}")
    @Description("获取探查任务结果，是否成功")
    public ProfilingJobResult findJobResultByObjectId(@Description("表的对象ID")
                                                      @PathVariable("objectId") Long objectId) {
        return profilingService.findJobResultByObjectId(objectId);
    }

    @GetMapping("/{objectId}/state")
    @Description("查看指定对象是不是正在被Profiling")
    public Boolean checkIfObjectBeingProfiling(@Description("表的对象ID") @PathVariable("objectId") Long objectId) {
        return profilingService.isProfiling(objectId);
    }

    @GetMapping("/{objectId}/canprofile")
    @Description("检查当前用户能否提交指定对象的数据探查任务")
    public Boolean checkIfUserHasRightsToSubmitProfileJob(@Description("表的对象ID") @PathVariable("objectId") Long objectId) {
        return profilingService.canProfiling(objectId);
    }
}
