package com.datablau.base.server.controller;

import com.andorj.common.core.annotation.EndpointDoc;
import com.andorj.common.data.PageResult;
import com.andorj.model.common.search.MultipleCriteria;
import com.datablau.base.data.FavoriteDto;
import com.datablau.base.server.dto.FavoriteQueryDtQo;
import com.datablau.base.server.jpa.entity.Favorite;
import com.datablau.base.server.service.LocalFavoriteService;
import com.datablau.base.server.utility.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import com.google.common.base.Strings;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @Author Senyan - 北京数语科技有限公司
 * @Date 2019/6/3
 */
@RestController
@RequestMapping("/favor")
@Tag(name = "收藏API")
public class FavoriteController extends BaseController {

    @Autowired
    private LocalFavoriteService favService;

    public FavoriteController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    /**
     * 收藏
     * @param fav
     */
    @Operation(summary = "收藏")
    @PostMapping(value = "/addToFavorite")
    public void addToFavorite(@RequestBody Favorite fav) {
        favService.addToFavorite(fav);
    }

    /**
     * 分页查询
     * @param favoriteDto
     * @return
     */
    @Operation(summary = "分页查询")
    @PostMapping("/page")
    public PageResult<Favorite> getPageResult(@RequestBody FavoriteQueryDtQo favoriteDto) {
        return favService.getPageResult(favoriteDto);
    }

    /**
     * 删除收藏
     * @param favId
     */
    @Operation(summary = "删除收藏")
    @Parameters({@Parameter(name = "favId", description = "收藏id", in = ParameterIn.PATH)})
    @PostMapping(value = "/delete")
    public void deleteFav(@RequestParam("favId") Long favId) {
        favService.deleteFromFavorite(favId);
    }

    /**
     * 获取收藏
     * @return Favorite
     */
    @Operation(summary = "获取收藏")
    @PostMapping(value = "/loadAllFav")
    public List<Favorite> loadAllFav() {
        return favService.getAllFavOfCurrentUser();
    }

    /**
     * 查询某个资产的收藏次数
     */
    @Operation(summary = "查询某个资产的收藏次数")
    @EndpointDoc(bodyExample =
            "{\n"
            + "    \"objId\" : \"3\",\n"
            + "    \"typeId\" : \"82800002\"\n"
            + "}",
            responseExample = "1")
    @PostMapping(value = "/count")
    public Long countFavoriteNumber(@RequestBody Favorite favorite) {
        return favService.countFavoriteNumberByItemId(favorite.getObjId(), favorite.getTypeId());
    }

    /**
     *  通过指定条件查询收藏
     **/
    @PostMapping(value = "/getByCondition")
    public List<FavoriteDto> getFavoriteDtoList(@RequestBody FavoriteDto favoriteDto) {

        MultipleCriteria multipleCriteria = new MultipleCriteria();
        if (!Strings.isNullOrEmpty(favoriteDto.getObjId())) {
            multipleCriteria.addFieldEqualsCriteria("objId", favoriteDto.getObjId(), false);

        }
        if (favoriteDto.getTypeId() != null) {
            multipleCriteria.addFieldEqualsCriteria("typeId", favoriteDto.getTypeId(), false);

        }
        multipleCriteria.addFieldEqualsCriteria("owner", AuthTools.currentUsernameFailFast(), false);
        return favService.getFavorites(multipleCriteria);
    }
}
