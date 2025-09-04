import $ from 'jquery'
import _ from 'lodash'
if (!window.mxGraph) {
  // $(document.body).append(`<script src="${location.pathname !== '/' ? location.pathname : '/'}static/libs/mxgraph/mxClient.min.js"></script>`)
//  $(document.body).append('<script src="./static/libs/mxgraph/mxClient.js"></script>');
}
const MxPoint = mxPoint
const MxGraph = mxGraph
const MxHierarchicalLayout = mxHierarchicalLayout
const MxRectangle = mxRectangle
const MxFastOrganicLayout = mxFastOrganicLayout
const MxRubberband = mxRubberband
const MxOutline = mxOutline
const shapeMap = {
  'Datablau.ERD.ShapeEclipse': 'ellipse',
  'Datablau.ERD.ShapeTriangle': 'triangle;direction=north',
  'Datablau.ERD.ShapeDiamond': 'rhombus',
  'Datablau.ERD.ShapeRectangle': 'rectangle',
  'Datablau.ERD.ShapePentagon': 'hexagon',
  'Datablau.ERD.ShapeHexagon': 'hexagon'
}
function bfsToSplitGroups (cellGroups) {
  var result = []
  var checkedNode = {}
  for (var i = 0; i < cellGroups.length; i++) {
    var group = cellGroups[i]

    var newGroup = bfsSearch(group, cellGroups, checkedNode)
    if (newGroup) {
      var flattenGroup = []
      for (let k in newGroup) {
        if (k) { flattenGroup.push(k) }
      }

      result.push(flattenGroup)

      for (let k = 0; k < flattenGroup.length; k++) {
        cellIdToGroup[flattenGroup[k]] = flattenGroup
      }
    }
  }

  return result
}

function bfsSearch (currentGroup, cellGroups, checkedNode) {
  var result = {}

  if (checkedNode[currentGroup.id]) {
    return null
  }

  checkedNode[currentGroup.id] = true
  result[currentGroup.id] = true

  for (var i = 0; i < currentGroup.group.length; i++) {
    var toSearchGroup = findGroupById(currentGroup.group[i], cellGroups)

    if (toSearchGroup) {
      var temp = bfsSearch(toSearchGroup, cellGroups, checkedNode)
      if (temp != null) {
        for (var k in temp) {
          result[k] = true
        }
      }
    }
  }

  return result
}

function findGroupById (id, cellGroups) {
  for (var i = 0; i < cellGroups.length; i++) {
    if (parseInt(id) === parseInt(cellGroups[i].id)) {
      return cellGroups[i]
    }
  }
  return null
}

function doLayout (graph, array, pos) {
  for (let i = 0; i < array.length; i++) {
    var cell = array[i]
    var newPos = pos[cell.id]

    if (newPos) {
      var geo = mxUtils.clone(cell.geometry)
      geo.x = newPos.x
      geo.y = newPos.y

      graph.getModel().setGeometry(cell, geo)
    }
  }
}

function layoutNoConnectionCells (startX, startY, cells, cellsPositions) {
  var maxHeight = 0
  var maxWidth = 0
  // iterate cells and get the max height and width
  for (var i = 0; i < cells.length; i++) {
    var cell = cells[i]
    maxWidth = Math.max(cell.geometry.width, maxWidth)
    maxHeight = Math.max(cell.geometry.height, maxHeight)
  }
  // 假设每个cell都是相同大小，拥有最大的高度和最大的宽度
  // 然后我们尽可能把他们摆成一个方形，那么我们就先算出来
  // 这N个方块的面积，然后取根号，得到单边长，然后算出n，n = 单边长/maxWidth + 1，这样算出来每一行摆多少个，然后
  // 一行一行摆。
  var square = maxHeight * maxWidth * cells.length
  var areaWidth = Math.sqrt(square)
  var horNum = Math.ceil(areaWidth / maxWidth)

  var cx = startX // 当前方块的起始x轴
  var cy = startY // 当前方块的起始y轴
  var hn = 0 // 当前方块是这一行的第几个，当达到horNum需要换行。

  for (let i = 0; i < cells.length; i++) {
    let cell = cells[i]
    if (hn === horNum) {
      cx = startX
      cy = cy + maxHeight
      hn = 0
    }

    var cellHeight = cell.geometry.height
    var cellWidth = cell.geometry.width

    var deltaH = (maxWidth - cellWidth) / 2
    var deltaV = (maxHeight - cellHeight) / 2

    var newX = cx + deltaH
    var newY = cy + deltaV

    cellsPositions[cell.id] = {
      x: newX,
      y: newY
    }

    cx = cx + maxWidth
    hn++
  }
}

// 基本原则是，以从中心往外面发散的方式绘制。
function layoutHasConnectionsCells (graph, cells, cellsPositions) {
  // 画过的cell的id和位置大小信息
  var caledCells = {}
  // 按照bfs来走，避免下一个热度高的节点和当前热度高的节点在两个完全不相干的区域，导致绘制线困难
  // 比如A有123456， B有6789， 当A不在计算过的节点里会以A当前位置作为中心，同样在绘制B的时候会以B为中心画，
  // 这样A和B的相对位置可能很怪导致在B连6节点的时候异常困难。所以我们用BFS的方式来绘制
  bfsLayoutCell(graph, cells[0], cells, caledCells)
  for (var k in caledCells) {
    cellsPositions[k] = caledCells[k]
  }
}

function bfsLayoutCell (graph, currentCellGroup, cellGroups, caledCells) {
  // 如果这个cellgroup所有的节点都已经算过了，就不再计算了，否则会陷入无限循环
  if (checkIfAllCaled(currentCellGroup, caledCells)) {
    return
  }
  // 以当前点作为中心来计算它自己和关联的节点位置
  innerLayoutHasConnectionCell(graph, currentCellGroup, caledCells)
  // 对和它关联的节点按照关联节点热度排序，这样保证和当前节点有关联的热度高的节点先画
  currentCellGroup.group.sort(function (o1, o2) {
    var cellGroup1 = findGroupCellByCellId(cellGroups, o1)
    var cellGroup2 = findGroupCellByCellId(cellGroups, o2)

    return cellGroup1.group.length - cellGroup2.group.length
  })
  // 递归画所有的节点
  for (var i = 0; i < currentCellGroup.group.length; i++) {
    var nextCellGroup = findGroupCellByCellId(cellGroups, currentCellGroup.group[i])
    bfsLayoutCell(graph, nextCellGroup, cellGroups, caledCells)
  }
}

function checkIfAllCaled (currentCellGroup, caledCells) {
  if (!caledCells[currentCellGroup.id]) { return false }

  for (var i = 0; i < currentCellGroup.group.length; i++) {
    if (!caledCells[currentCellGroup.group[i]]) { return false }
  }

  return true
}

function findGroupCellByCellId (cellGroups, cellId) {
  for (var i = 0; i < cellGroups.length; i++) {
    var cellGroup = cellGroups[i]
    if (cellGroup.id === cellId) {
      return cellGroup
    }
  }
}

function innerLayoutHasConnectionCell (graph, centerCell, caledCells) {
  // 中心的节点
  var mainCell = graph.getModel().getCell(centerCell.id)
  // 中心节点的几何参数
  var coreGeo = mainCell.geometry
  // 跟此中心节点有关联的节点
  var cells = []
  for (var i = 0; i < centerCell.group.length; i++) {
    cells.push(graph.getModel().getCell(centerCell.group[i]))
  }
  // 按照大小排序，大的排前面，先画
  // 而且已经画过的节点我们也排在前面
  cells.sort(function (o1, o2) {
    var square1 = o1.geometry.height * o1.geometry.width
    var square2 = o2.geometry.height * o2.geometry.width

    if (caledCells[o1.id]) { square1 += 99999999 } // 当节点已经计算过位置了，那么给面积加上一个巨大的基数值使他能尽可能往前排
    if (caledCells[o2.id]) { square2 += 99999999 }
    return square1 - square2
  })

  var level = 1
  // 在中心的周围画
  for (let i = 0; i < cells.length; i++) {
    var cell = cells[i]
    // 如果已经画了的
    if (caledCells[cell.id]) {
      // 并且核心已经画了，我们就不管了
      if (caledCells[mainCell.id]) {
        continue
      } else {
        // 否则我们根据这个已经画的节点画核心节点
        level = findSuitableLocation(level, caledCells[cell.id], coreGeo, cell.id, caledCells)
      }
    } else {
      if (i === 0 && !caledCells[mainCell.id]) {
        console.debug('set pos of ' + mainCell.id)
        caledCells[mainCell.id] = mxUtils.clone(mainCell.geometry)
      }

      // 如果此节点是没有画过的，那么我们就通过核心节点来找一个合适的位置放它
      level = findSuitableLocation(level, caledCells[mainCell.id], cell.geometry, cell.id, caledCells)
    }
  }
}

// 每往外扩大一圈应该扩大的幅度，此值越大，那么越稀疏
var LEVEL_MARGIN = 100
// 每个实体间应该留多少空
var ENTITY_MARGIN = 60
// 每个区间中间留的空缺大小，此区域不允许画东西用来走线
var AREA_GAP = 50
var ENTITY_PERIMETER = 50

function findSuitableLocation (startLevel, baseCellGeo, toAddCellGeo, toAddCellId, caledCells) {
  // 首先尝试上下左右四个方向能不能直接放下
  var newGeo = tryPlaceInFourDirection(startLevel, baseCellGeo, toAddCellGeo, caledCells)
  if (newGeo) {
    console.debug('set direct pos of ' + toAddCellId)
    caledCells[toAddCellId] = newGeo
    return startLevel
  }

  // 以此cell为中心，一层一层往外面找可以放核心的地方
  // 把一个矩形的4边分成8个扇形部分，西北，北西， 北东， 东北， 东南， 南东， 西南
  // 每个区间中间需要留一个空缺用来走线。

  for (var i = 1, level = startLevel; i <= 8; i++) {
    var area = getPlaceableArea(baseCellGeo, level, i)
    var placeablePos = tryPlaceCell(toAddCellGeo, area, i, caledCells)

    if (placeablePos != null) {
      console.debug('set pos of ' + toAddCellId)
      caledCells[toAddCellId] = {
        x: placeablePos.x,
        y: placeablePos.y,
        height: toAddCellGeo.height,
        width: toAddCellGeo.width
      }
      return level
    }

    if (i === 8) {
      // 如果这一层找不到，往外扩散一层
      i = 1
      level++
    }
  }
}

function tryPlaceInFourDirection (startLevel, baseCellGeo, toAddCellGeo, caledCells) {
  var newGeo = {
    height: toAddCellGeo.height,
    width: toAddCellGeo.width
  }
  newGeo.x = baseCellGeo.x - startLevel * LEVEL_MARGIN - toAddCellGeo.width
  newGeo.y = baseCellGeo.y - (toAddCellGeo.height - baseCellGeo.height) / 2

  if (!hasOverlap(newGeo, caledCells)) { return newGeo }

  newGeo.x = baseCellGeo.x - (toAddCellGeo.width - baseCellGeo.width) / 2
  newGeo.y = baseCellGeo.y - startLevel * LEVEL_MARGIN - toAddCellGeo.height

  if (!hasOverlap(newGeo, caledCells)) { return newGeo }

  newGeo.x = baseCellGeo.x + baseCellGeo.width + startLevel * LEVEL_MARGIN
  newGeo.y = baseCellGeo.y - (toAddCellGeo.height - baseCellGeo.height) / 2

  if (!hasOverlap(newGeo, caledCells)) { return newGeo }

  newGeo.x = baseCellGeo.x - (toAddCellGeo.width - baseCellGeo.width) / 2
  newGeo.y = baseCellGeo.y + baseCellGeo.height + startLevel * LEVEL_MARGIN

  if (!hasOverlap(newGeo, caledCells)) { return newGeo }

  return null
}

function tryPlaceCell (toAddCellGeo, area, direction, caledCells) {
  var geo = toAddCellGeo

  if (direction === 1) {
    for (var i = area.endy; i >= area.starty; i -= ENTITY_MARGIN) {
      var newGeo = {
        x: area.x - geo.width,
        y: i,
        width: geo.width,
        height: geo.height
      }

      if (!hasOverlap(newGeo, caledCells)) {
        return newGeo
      }
    }
  } else if (direction === 2) {
    for (let i = area.endx; i >= area.startx; i -= ENTITY_MARGIN) {
      let newGeo = {
        x: i,
        y: area.y - geo.height,
        width: geo.width,
        height: geo.height
      }

      if (!hasOverlap(newGeo, caledCells)) {
        return newGeo
      }
    }
  } else if (direction === 3) {
    for (let i = area.startx; i <= area.endx - geo.width; i += ENTITY_MARGIN) {
      let newGeo = {
        x: i,
        y: area.y - geo.height,
        width: geo.width,
        height: geo.height
      }

      if (!hasOverlap(newGeo, caledCells)) {
        return newGeo
      }
    }
  } else if (direction === 4) {
    for (let i = area.endy; i >= area.starty; i -= ENTITY_MARGIN) {
      let newGeo = {
        x: area.x,
        y: i,
        width: geo.width,
        height: geo.height
      }

      if (!hasOverlap(newGeo, caledCells)) {
        return newGeo
      }
    }
  } else if (direction === 5) {
    for (let i = area.starty; i <= area.endy - geo.height; i += ENTITY_MARGIN) {
      let newGeo = {
        x: area.x,
        y: i,
        width: geo.width,
        height: geo.height
      }

      if (!hasOverlap(newGeo, caledCells)) {
        return newGeo
      }
    }
  } else if (direction === 6) {
    for (let i = area.startx; i <= area.endx; i += ENTITY_MARGIN) {
      let newGeo = {
        x: i,
        y: area.y,
        width: geo.width,
        height: geo.height
      }

      if (!hasOverlap(newGeo, caledCells)) {
        return newGeo
      }
    }
  } else if (direction === 7) {
    for (let i = area.endx; i >= area.startx; i -= ENTITY_MARGIN) {
      let newGeo = {
        x: i,
        y: area.y,
        width: geo.width,
        height: geo.height
      }

      if (!hasOverlap(newGeo, caledCells)) {
        return newGeo
      }
    }
  } else if (direction === 8) {
    for (let i = area.starty; i <= area.endy; i += ENTITY_MARGIN) {
      let newGeo = {
        x: area.x,
        y: i,
        width: geo.width,
        height: geo.height
      }

      if (!hasOverlap(newGeo, caledCells)) {
        return newGeo
      }
    }
  }

  return null
}

function getPlaceableArea (baseCellGeo, level, direction) {
  // 西北 - 1，北西 - 2， 北东 - 3， 东北 - 4， 东南 - 5， 南东 - 6， 南西 - 7, 西南 - 8
  var result = {}
  var geo = baseCellGeo
  var margin = level * LEVEL_MARGIN
  if (direction === 1) {
    result.x = geo.x - margin
    result.starty = geo.y - margin
    result.endy = geo.y + (geo.height - AREA_GAP) / 2
  } else if (direction === 2) {
    result.startx = geo.x - margin
    result.endx = geo.x + (geo.width - AREA_GAP) / 2
    result.y = geo.y - margin
  } else if (direction === 3) {
    result.startx = geo.x + (geo.width + AREA_GAP) / 2
    result.endx = geo.x + geo.width + margin
    result.y = geo.y - margin
  } else if (direction === 4) {
    result.x = geo.x + geo.width + margin
    result.starty = geo.y - margin
    result.endy = geo.y + (geo.height + AREA_GAP) / 2
  } else if (direction === 5) {
    result.x = geo.x + geo.width + margin
    result.starty = geo.y + (geo.height - AREA_GAP) / 2
    result.endy = geo.y + geo.height + margin
  } else if (direction === 6) {
    result.startx = geo.x + (geo.width + AREA_GAP) / 2
    result.endx = geo.x + geo.width + margin
    result.y = geo.y + geo.height + margin
  } else if (direction === 7) {
    result.startx = geo.x - margin
    result.endx = geo.x + (geo.width - AREA_GAP) / 2
    result.y = geo.y + geo.height + margin
  } else if (direction === 8) {
    result.x = geo.x - margin
    result.starty = geo.y + (geo.height + AREA_GAP) / 2
    result.endy = geo.y + geo.height + margin
  } else {
    console.debug('should never be here')
  }

  return result
}

function hasOverlap (cellGeo, caledCells) {
  for (var i in caledCells) {
    var cellId = i
    var geo = caledCells[i]
    var testGeo = mxUtils.clone(geo)
    testGeo.x -= ENTITY_PERIMETER
    testGeo.y -= ENTITY_PERIMETER
    testGeo.width += ENTITY_PERIMETER
    testGeo.height += ENTITY_PERIMETER

    if (hasOverlapRects(cellGeo, testGeo)) { return true }
  }

  return false
}

function hasOverlapRects (rect1Geo, rect2Geo) {
  var r1sq = rect1Geo.width * rect1Geo.height
  var r2sq = rect2Geo.width * rect2Geo.height
  var large, small
  if (r1sq >= r2sq) {
    large = rect1Geo
    small = rect2Geo
  } else {
    large = rect2Geo
    small = rect1Geo
  }
  // 如果大的包括了小的
  if (small.x >= large.x && small.x + small.width <= large.x + large.width && small.y >= large.y && small.y + small.height <= large.y + large.height) { return true }

  var leftMost = rect1Geo.x
  var rightMost = rect1Geo.x + rect1Geo.width
  var topMost = rect1Geo.y
  var bottomMost = rect1Geo.y + rect1Geo.height

  var geo = rect2Geo

  return cross(leftMost, rightMost, topMost, geo.y, geo.y + geo.height, geo.x) ||
    cross(leftMost, rightMost, topMost, geo.y, geo.y + geo.height, geo.x + geo.width) ||
    cross(leftMost, rightMost, bottomMost, geo.y, geo.y + geo.height, geo.x) ||
    cross(leftMost, rightMost, bottomMost, geo.y, geo.y + geo.height, geo.x + geo.width) ||
    cross(geo.x, geo.x + geo.width, geo.y, topMost, bottomMost, leftMost) ||
    cross(geo.x, geo.x + geo.width, geo.y, topMost, bottomMost, rightMost) ||
    cross(geo.x, geo.x + geo.width, geo.y + geo.height, topMost, bottomMost, leftMost) ||
    cross(geo.x, geo.x + geo.width, geo.y + geo.height, topMost, bottomMost, rightMost)
}

function cross (left, right, y, top, bottom, x) {
  return (top <= y) && (bottom >= y) && (left <= x) && (right >= x)
}

// hasOverlapLineAndRect
var EDGE_ENTITY_MARGIN = 5
var EDGE_SPACE = 5
var USED_POINT = {} // 一个set，point按照xn-yn来存放

function addUsedPoints (points) {
  for (var i = 0; i < points.length; i++) {
    var point = points[i]
    if (!point) { continue }
    USED_POINT[buildPointKey(point)] = true
  }
}

function checkUsedPoint (point) {
  if (USED_POINT[buildPointKey(point)]) { return true }
  return false
}

function buildPointKey (point) {
  return 'x' + point.x + '-y' + point.y
}

function hasOverlapLineAndRect (lineGeo, rectGeo) {
  var start = lineGeo.start
  var end = lineGeo.end

  var minx = Math.min(start.x, end.x)
  var miny = Math.min(start.y, end.y)
  var maxx = Math.max(start.x, end.x)
  var maxy = Math.max(start.y, end.y)

  return hasOverlapRects({
    x: minx,
    y: miny,
    height: maxy - miny,
    width: maxx - minx
  }, rectGeo)
}

function isEdgeHasOverlapEntities (edgeGeo, entityIds) {
  for (var i = 0; i < entityIds.length; i++) {
    if (hasOverlapLineAndRect(edgeGeo, globalPos[entityIds[i].id])) {
      return true
    }
  }

  return false
}

/* mxEdgeStyle.MyStyle = function(state, source, target, points, result)
{
  if (source != null && target != null)
  {
  if (globalPos == null) {
    mxEdgeStyle.OrthConnector(state, source, target, points, result);
  } else {
      var toBeCheckedIds = mxUtils.clone(cellIdToGroup[source.cell.id]);

    for (var i=0; i<toBeCheckedIds.length; i++) {
      if (toBeCheckedIds[i].id == source.cell.id || toBeCheckedIds[i].id == target.cell.id) {
        toBeCheckedIds.splice(i, 1);
        i--;
      }
    }

    var sgeo = source.cell.geometry;
    var tgeo = target.cell.geometry;

    if (source.cell.value == '12' && target.cell.value=='10') {
      console.debug("got me");
    }

    var direction = getDirection(sgeo, tgeo);
    if (!getPointsByDirection(direction, tgeo, sgeo, result, toBeCheckedIds, source, target)) {
      var notFound = true;
      var seconardyDirection = getSecondaryDirection(direction, sgeo, tgeo);

      if (seconardyDirection) {
        if (getPointsByDirection(seconardyDirection, tgeo, sgeo, result, toBeCheckedIds, source, target)) {
          notFound = false;
        }
      }

      if (notFound) {
        var pt = new MxPoint(target.getCenterX(), source.getCenterY());

        if (mxUtils.contains(source, pt.x, pt.y))
        {
          pt.y = source.y + source.height;
        }

        result.push(pt);
      }
    }

  }
  }
}; */
//     2   3
//  1         4
//  8         5
//     7   6
function getDirection (sgeo, tgeo) {
  var spos = { x: sgeo.x + sgeo.width / 2, y: sgeo.y + sgeo.height / 2 }

  if (tgeo.x < spos.x) {
    var v = tgeo.y - spos.y
    var absV = Math.abs(v)
    if (v > 0) {
      if (spos.x - tgeo.x > absV) {
        return 8
      } else {
        return 7
      }
    } else {
      if (spos.x - tgeo.x > absV) {
        return 1
      } else {
        return 2
      }
    }
  } else {
    let v = tgeo.y - spos.y
    let absV = Math.abs(v)
    if (v > 0) {
      if (tgeo.x - spos.x > absV) {
        return 5
      } else {
        return 6
      }
    } else {
      if (tgeo.x - spos.x > absV) {
        return 4
      } else {
        return 3
      }
    }
  }
}

function getSecondaryDirection (firstDirection, sgeo, tgeo) {
  var scorex = sgeo.x + sgeo.width / 2
  var scorey = sgeo.y + sgeo.height / 2
  var rightBottomX = tgeo.x + tgeo.width
  var rightBottomY = tgeo.y + tgeo.height

  if (firstDirection === 1) {
    if (tgeo.y + tgeo.height < sgeo.y + sgeo.height / 2) {
      return 2
    } else {
      return 8
    }
  } else if (firstDirection === 2) {
    if (tgeo.x + tgeo.width > sgeo.x + sgeo.width / 2) {
      return 3
    } else {
      return 1
    }
  } else if (firstDirection === 3) {
    let rightBottomX = tgeo.x + tgeo.width
    let rightBottomY = tgeo.y + tgeo.height

    if (rightBottomY > scorey) {
      if (rightBottomY - scorey > rightBottomX - scorex) {
        return 6
      } else {
        return 5
      }
    } else {
      return 4
    }
  } else if (firstDirection === 4) {
    if (rightBottomY - scorey > rightBottomX - scorex) {
      return 6
    } else {
      return 5
    }
  } else if (firstDirection === 5) {
    return 6
  } else if (firstDirection === 6) {
    return 5
  } else if (firstDirection === 7) {
    if (rightBottomY - scorey > rightBottomX - scorex) {
      return 6
    } else {
      return 5
    }
  } else if (firstDirection === 8) {
    if (rightBottomX < scorex) {
      return 7
    } else {
      if (rightBottomY - scorey > rightBottomX - scorex) {
        return 6
      } else {
        return 5
      }
    }
  }
}

function getPointsByDirection (direction, tgeo, sgeo, result, toBeCheckedIds, source, target) {
  if (direction === 1) {
    // 目标在源西北角，先检查是否有overlap的y
    if (tgeo.y + tgeo.height - EDGE_ENTITY_MARGIN > sgeo.y + EDGE_ENTITY_MARGIN) {
      var maxY = Math.min(Math.min(tgeo.y + tgeo.height, sgeo.y + sgeo.height), sgeo.y + sgeo.height - EDGE_ENTITY_MARGIN)
      var minY = Math.max(Math.max(tgeo.y, sgeo.y), sgeo.y + EDGE_ENTITY_MARGIN)
      // 如果在Y轴上有交集,先尝试不折
      if (maxY > minY) {
        // 尝试直接连接
        var middley = (minY + maxY) / 2
        for (var ty = 0, isNeg = 1; ty <= (maxY - minY) / 2; ty += isNeg < 0 ? EDGE_SPACE : 0, isNeg *= -1) {
          var edgeGeo = {
            start: {
              x: sgeo.x,
              y: middley + ty
            },
            end: {
              x: tgeo.x + tgeo.width,
              y: middley + ty
            }
          }

          if (checkUsedPoint(edgeGeo.start) || checkUsedPoint(edgeGeo.end)) {
            continue
          }

          if (!isEdgeHasOverlapEntities(edgeGeo, toBeCheckedIds)) {
            result.push(new MxPoint(edgeGeo.start.x, edgeGeo.start.y))
            result.push(new MxPoint(edgeGeo.end.x, edgeGeo.end.y))
            addUsedPoints(result)
            console.debug('find-1-' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }
    // 如果直接连接失败， 需要考虑一折，那么我们尝试从中缝区域走,从左侧上撇
    middley = sgeo.height / 2 + sgeo.y
    for (var sy = 0, isYNeg = 1; sy <= sgeo.height / 2 - EDGE_ENTITY_MARGIN; sy += isYNeg < 0 ? EDGE_SPACE : 0, isYNeg *= -1) {
      var startPoint = { x: sgeo.x, y: middley - sy * isYNeg }
      if (checkUsedPoint(startPoint)) {
        continue
      }
      var middlex = tgeo.x + tgeo.width / 2
      for (var tx = 0, isXNeg = 1; tx <= tgeo.width / 2 - EDGE_ENTITY_MARGIN; tx += isXNeg < 0 ? EDGE_SPACE : 0, isXNeg *= -1) {
        var endPoint = {
          x: middlex + tx * isXNeg,
          y: startPoint.y
        }
        if (checkUsedPoint(endPoint)) {
          continue
        }
        if (!isEdgeHasOverlapEntities({ start: startPoint, end: endPoint }, toBeCheckedIds)) {
          var newEndPoint = {
            x: endPoint.x,
            y: tgeo.y + tgeo.height
          }

          if (!checkUsedPoint(newEndPoint) && !isEdgeHasOverlapEntities({ start: endPoint, end: newEndPoint }, toBeCheckedIds)) {
            result.push(new MxPoint(startPoint.x, startPoint.y))
            result.push(new MxPoint(endPoint.x, endPoint.y))
            result.push(new MxPoint(newEndPoint.x, newEndPoint.y))
            addUsedPoints(result)
            console.debug('find -2-' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }
    // 考虑2折，从两个东西中间创建一条横线
    var lowerMiddley = sgeo.height / 2 + sgeo.y
    for (var sly = 0, isLYNeg = 1; sly <= sgeo.height / 2 - EDGE_ENTITY_MARGIN; sly += isLYNeg < 0 ? EDGE_SPACE : 0, isLYNeg *= -1) {
      let startPoint = {
        x: sgeo.x,
        y: lowerMiddley + sly * isLYNeg
      }

      if (checkUsedPoint(startPoint)) {
        continue
      }

      let middlex = (tgeo.x + tgeo.width + sgeo.x) / 2
      for (let sx = 0, isXNeg = 1; sx <= (sgeo.x - tgeo.x - tgeo.width) / 2 - EDGE_ENTITY_MARGIN; sx += isXNeg < 0 ? EDGE_SPACE : 0, isXNeg *= -1) {
        var middleLower = {
          x: middlex + sx * isXNeg,
          y: startPoint.y
        }

        if (checkUsedPoint(middleLower) || isEdgeHasOverlapEntities({ start: startPoint, end: middleLower }, toBeCheckedIds)) {
          continue
        }

        var upperMiddley = tgeo.height / 2 + tgeo.y
        for (var suy = 0, isUYNeg = 1; suy <= tgeo.height / 2 - EDGE_ENTITY_MARGIN; suy += isUYNeg < 0 ? EDGE_SPACE : 0, isUYNeg *= -1) {
          var middleUpper = {
            x: middleLower.x,
            y: upperMiddley + suy * isUYNeg
          }

          if (checkUsedPoint(middleUpper) || isEdgeHasOverlapEntities({ start: middleLower, end: middleUpper }, toBeCheckedIds)) {
            continue
          }

          let endPoint = {
            x: tgeo.x + tgeo.width,
            y: middleUpper.y
          }

          if (checkUsedPoint(endPoint) || isEdgeHasOverlapEntities({ start: middleUpper, end: endPoint }, toBeCheckedIds)) {
            continue
          }

          result.push(new MxPoint(startPoint.x, startPoint.y))
          result.push(new MxPoint(middleLower.x, middleLower.y))
          result.push(new MxPoint(middleUpper.x, middleUpper.y))
          result.push(new MxPoint(endPoint.x, endPoint.y))
          addUsedPoints(result)
          console.debug('find - 3-' + source.cell.value + '->' + target.cell.value)
          return true
        }
      }
    }
  } else if (direction === 2) {
    // 目标在源北西角，先检查是否有overlap的x
    if (tgeo.x + tgeo.width - EDGE_ENTITY_MARGIN > sgeo.x + EDGE_ENTITY_MARGIN) {
      var maxX = Math.min(Math.min(tgeo.x + tgeo.width, sgeo.x + sgeo.width), sgeo.x + sgeo.width - EDGE_ENTITY_MARGIN)
      var minX = Math.max(Math.max(tgeo.x, sgeo.x), sgeo.x + EDGE_ENTITY_MARGIN)
      // 如果有交集,先尝试不折
      if (maxX > minX) {
        // 尝试直接连接
        let middlex = (minX + maxX) / 2
        for (let tx = 0, isNeg = 1; tx <= (maxX - minX) / 2; tx += isNeg < 0 ? EDGE_SPACE : 0, isNeg *= -1) {
          let edgeGeo = {
            start: {
              x: middlex + tx,
              y: sgeo.y
            },
            end: {
              x: middlex + tx,
              y: tgeo.y + tgeo.height
            }
          }

          if (checkUsedPoint(edgeGeo.start) || checkUsedPoint(edgeGeo.end)) {
            continue
          }

          if (!isEdgeHasOverlapEntities(edgeGeo, toBeCheckedIds)) {
            result.push(new MxPoint(edgeGeo.start.x, edgeGeo.start.y))
            result.push(new MxPoint(edgeGeo.end.x, edgeGeo.end.y))
            addUsedPoints(result)
            console.debug('find - 1-' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }
    // 如果直接连接失败， 需要考虑一折，那么我们尝试从中缝区域走,从左侧上撇
    let middlex = sgeo.width / 2 + sgeo.x
    for (let sx = 0, isXNeg = 1; sx <= sgeo.width / 2 - EDGE_ENTITY_MARGIN; sx += isXNeg < 0 ? EDGE_SPACE : 0, isXNeg *= -1) {
      let startPoint = { x: middlex - sx * isXNeg, y: sgeo.y }
      if (checkUsedPoint(startPoint)) {
        continue
      }
      let middley = tgeo.y + tgeo.height / 2
      for (let ty = 0, isYNeg = 1; ty <= tgeo.height / 2 - EDGE_ENTITY_MARGIN; ty += isYNeg < 0 ? EDGE_SPACE : 0, isYNeg *= -1) {
        let endPoint = {
          x: startPoint.x,
          y: middley + ty * isYNeg
        }
        if (checkUsedPoint(endPoint)) {
          continue
        }
        if (!isEdgeHasOverlapEntities({ start: startPoint, end: endPoint }, toBeCheckedIds)) {
          let newEndPoint = {
            x: tgeo.x + tgeo.width,
            y: endPoint.y
          }

          if (!checkUsedPoint(newEndPoint) && !isEdgeHasOverlapEntities({ start: endPoint, end: newEndPoint }, toBeCheckedIds)) {
            result.push(new MxPoint(startPoint.x, startPoint.y))
            result.push(new MxPoint(endPoint.x, endPoint.y))
            result.push(new MxPoint(newEndPoint.x, newEndPoint.y))
            addUsedPoints(result)
            console.debug('find - 2 -' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }

    // 考虑2折，从两个东西中间创建一条横线
    let lowerMiddlex = sgeo.width / 2 + sgeo.x
    for (let slx = 0, isLXNeg = 1; slx <= sgeo.width / 2 - EDGE_ENTITY_MARGIN; slx += isLXNeg < 0 ? EDGE_SPACE : 0, isLXNeg *= -1) {
      let startPoint = {
        x: lowerMiddlex + slx * isLXNeg,
        y: sgeo.y
      }

      if (checkUsedPoint(startPoint)) {
        continue
      }

      let middley = (sgeo.y + tgeo.height + tgeo.y) / 2
      for (let sy = 0, isYNeg = 1; sy <= (sgeo.y - tgeo.y - tgeo.height) / 2 - EDGE_ENTITY_MARGIN; sy += isYNeg < 0 ? EDGE_SPACE : 0, isYNeg *= -1) {
        let middleLower = {
          x: startPoint.x,
          y: middley + sy * isYNeg
        }

        if (checkUsedPoint(middleLower) || isEdgeHasOverlapEntities({ start: startPoint, end: middleLower }, toBeCheckedIds)) {
          continue
        }

        let upperMiddlex = tgeo.width / 2 + tgeo.x
        for (let sux = 0, isUXNeg = 1; sux <= tgeo.width / 2 - EDGE_ENTITY_MARGIN; sux += isUXNeg < 0 ? EDGE_SPACE : 0, isUXNeg *= -1) {
          let middleUpper = {
            x: upperMiddlex + sux * isUXNeg,
            y: middleLower.y
          }

          if (checkUsedPoint(middleUpper) || isEdgeHasOverlapEntities({ start: middleLower, end: middleUpper }, toBeCheckedIds)) {
            continue
          }

          let endPoint = {
            x: middleUpper.x,
            y: tgeo.y + tgeo.height
          }

          if (checkUsedPoint(endPoint) || isEdgeHasOverlapEntities({ start: middleUpper, end: endPoint }, toBeCheckedIds)) {
            continue
          }

          result.push(new MxPoint(startPoint.x, startPoint.y))
          result.push(new MxPoint(middleLower.x, middleLower.y))
          result.push(new MxPoint(middleUpper.x, middleUpper.y))
          result.push(new MxPoint(endPoint.x, endPoint.y))
          addUsedPoints(result)
          console.debug('find - 3 -' + source.cell.value + '->' + target.cell.value)
          return true
        }
      }
    }
  } else if (direction === 3) {
    // 目标在源北东角，先检查是否有overlap的x
    if (tgeo.x + EDGE_ENTITY_MARGIN <= sgeo.x + sgeo.width - EDGE_ENTITY_MARGIN) {
      let maxX = Math.min(Math.min(tgeo.x + tgeo.width, sgeo.x + sgeo.width), sgeo.x + sgeo.width - EDGE_ENTITY_MARGIN)
      let minX = Math.max(Math.max(tgeo.x, sgeo.x), sgeo.x + EDGE_ENTITY_MARGIN)
      // 如果有交集,先尝试不折
      if (maxX > minX) {
        // 尝试直接连接
        let middlex = (minX + maxX) / 2
        for (let tx = 0, isNeg = 1; tx <= (maxX - minX) / 2; tx += isNeg < 0 ? EDGE_SPACE : 0, isNeg *= -1) {
          let edgeGeo = {
            start: {
              x: middlex + tx,
              y: sgeo.y
            },
            end: {
              x: middlex + tx,
              y: tgeo.y + tgeo.height
            }
          }

          if (checkUsedPoint(edgeGeo.start) || checkUsedPoint(edgeGeo.end)) {
            continue
          }

          if (!isEdgeHasOverlapEntities(edgeGeo, toBeCheckedIds)) {
            result.push(new MxPoint(edgeGeo.start.x, edgeGeo.start.y))
            result.push(new MxPoint(edgeGeo.end.x, edgeGeo.end.y))
            addUsedPoints(result)
            console.debug('find -1 -' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }
    // 如果直接连接失败， 需要考虑一折，那么我们尝试从中缝区域走,从左侧上撇
    let middlex = sgeo.width / 2 + sgeo.x
    for (let sx = 0, isXNeg = 1; sx <= sgeo.width / 2 - EDGE_ENTITY_MARGIN; sx += isXNeg < 0 ? EDGE_SPACE : 0, isXNeg *= -1) {
      let startPoint = { x: middlex - sx * isXNeg, y: sgeo.y }
      if (checkUsedPoint(startPoint)) {
        continue
      }
      let middley = tgeo.y + tgeo.height / 2
      for (let ty = 0, isYNeg = 1; ty <= tgeo.height / 2 - EDGE_ENTITY_MARGIN; ty += isYNeg < 0 ? EDGE_SPACE : 0, isYNeg *= -1) {
        let endPoint = {
          x: startPoint.x,
          y: middley + ty * isYNeg
        }

        if (checkUsedPoint(endPoint)) {
          continue
        }
        if (!isEdgeHasOverlapEntities({ start: startPoint, end: endPoint }, toBeCheckedIds)) {
          let newEndPoint = {
            x: tgeo.x,
            y: endPoint.y
          }

          if (!checkUsedPoint(newEndPoint) && !isEdgeHasOverlapEntities({ start: endPoint, end: newEndPoint }, toBeCheckedIds)) {
            result.push(new MxPoint(startPoint.x, startPoint.y))
            result.push(new MxPoint(endPoint.x, endPoint.y))
            result.push(new MxPoint(newEndPoint.x, newEndPoint.y))
            addUsedPoints(result)
            console.debug('find - 2-' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }

    // 考虑2折，从两个东西中间创建一条横线
    let lowerMiddlex = sgeo.width / 2 + sgeo.x
    for (let slx = 0, isLXNeg = 1; slx <= sgeo.width / 2 - EDGE_ENTITY_MARGIN; slx += isLXNeg < 0 ? EDGE_SPACE : 0, isLXNeg *= -1) {
      let startPoint = {
        x: lowerMiddlex + slx * isLXNeg,
        y: sgeo.y
      }

      if (checkUsedPoint(startPoint)) {
        continue
      }

      let middley = (sgeo.y + tgeo.height + tgeo.y) / 2
      for (let sy = 0, isYNeg = 1; sy <= (sgeo.y - tgeo.y - tgeo.height) / 2 - EDGE_ENTITY_MARGIN; sy += isYNeg < 0 ? EDGE_SPACE : 0, isYNeg *= -1) {
        let middleLower = {
          x: startPoint.x,
          y: middley + sy * isYNeg
        }

        if (checkUsedPoint(middleLower) || isEdgeHasOverlapEntities({ start: startPoint, end: middleLower }, toBeCheckedIds)) {
          continue
        }

        let upperMiddlex = tgeo.width / 2 + tgeo.x
        for (let sux = 0, isUXNeg = 1; sux <= tgeo.width / 2 - EDGE_ENTITY_MARGIN; sux += isUXNeg < 0 ? EDGE_SPACE : 0, isUXNeg *= -1) {
          let middleUpper = {
            x: upperMiddlex + sux * isUXNeg,
            y: middleLower.y
          }

          if (checkUsedPoint(middleUpper) || isEdgeHasOverlapEntities({ start: middleLower, end: middleUpper }, toBeCheckedIds)) {
            continue
          }

          let endPoint = {
            x: middleUpper.x,
            y: tgeo.y + tgeo.height
          }

          if (checkUsedPoint(endPoint) || isEdgeHasOverlapEntities({ start: middleUpper, end: endPoint }, toBeCheckedIds)) {
            continue
          }

          result.push(new MxPoint(startPoint.x, startPoint.y))
          result.push(new MxPoint(middleLower.x, middleLower.y))
          result.push(new MxPoint(middleUpper.x, middleUpper.y))
          result.push(new MxPoint(endPoint.x, endPoint.y))
          addUsedPoints(result)
          console.debug('find - 3 -' + source.cell.value + '->' + target.cell.value)
          return true
        }
      }
    }
  } else if (direction === 4) {
    // 目标在源东北角，先检查是否有overlap的y
    if (tgeo.y + tgeo.height - EDGE_ENTITY_MARGIN > sgeo.y + EDGE_ENTITY_MARGIN) {
      let maxY = Math.min(Math.min(tgeo.y + tgeo.height, sgeo.y + sgeo.height), sgeo.y + sgeo.height - EDGE_ENTITY_MARGIN)
      let minY = Math.max(Math.max(tgeo.y, sgeo.y), sgeo.y + EDGE_ENTITY_MARGIN)
      // 如果在Y轴上有交集,先尝试不折
      if (maxY > minY) {
        // 尝试直接连接
        let middley = (minY + maxY) / 2
        for (let ty = 0, isNeg = 1; ty <= (maxY - minY) / 2; ty += isNeg < 0 ? EDGE_SPACE : 0, isNeg *= -1) {
          let edgeGeo = {
            start: {
              x: sgeo.x + sgeo.width,
              y: middley + ty
            },
            end: {
              x: tgeo.x,
              y: middley + ty
            }
          }

          if (checkUsedPoint(edgeGeo.start) || checkUsedPoint(edgeGeo.end)) {
            continue
          }

          if (!isEdgeHasOverlapEntities(edgeGeo, toBeCheckedIds)) {
            result.push(new MxPoint(edgeGeo.start.x, edgeGeo.start.y))
            result.push(new MxPoint(edgeGeo.end.x, edgeGeo.end.y))
            addUsedPoints(result)
            console.debug('find - 1-' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }
    // 如果直接连接失败， 需要考虑一折，那么我们尝试从中缝区域走,从左侧上撇
    let middley = sgeo.height / 2 + sgeo.y
    for (let sy = 0, isYNeg = 1; sy <= sgeo.height / 2 - EDGE_ENTITY_MARGIN; sy += isYNeg < 0 ? EDGE_SPACE : 0, isYNeg *= -1) {
      let startPoint = { x: sgeo.x + sgeo.width, y: middley - sy * isYNeg }
      if (checkUsedPoint(startPoint)) {
        continue
      }
      let middlex = tgeo.x + tgeo.width / 2
      for (let tx = 0, isXNeg = 1; tx <= tgeo.width / 2 - EDGE_ENTITY_MARGIN; tx += isXNeg < 0 ? EDGE_SPACE : 0, isXNeg *= -1) {
        let endPoint = {
          x: middlex + tx * isXNeg,
          y: startPoint.y
        }

        if (checkUsedPoint(endPoint)) {
          continue
        }

        if (!isEdgeHasOverlapEntities({ start: startPoint, end: endPoint }, toBeCheckedIds)) {
          let newEndPoint = {
            x: endPoint.x,
            y: tgeo.y + tgeo.height
          }

          if (!checkUsedPoint(newEndPoint) && !isEdgeHasOverlapEntities({ start: endPoint, end: newEndPoint }, toBeCheckedIds)) {
            result.push(new MxPoint(startPoint.x, startPoint.y))
            result.push(new MxPoint(endPoint.x, endPoint.y))
            result.push(new MxPoint(newEndPoint.x, newEndPoint.y))
            addUsedPoints(result)
            console.debug('find - 2 -' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }

    // 考虑2折，从两个东西中间创建一条横线
    let lowerMiddley = sgeo.height / 2 + sgeo.y
    for (let sly = 0, isLYNeg = 1; sly <= sgeo.height / 2 - EDGE_ENTITY_MARGIN; sly += isLYNeg < 0 ? EDGE_SPACE : 0, isLYNeg *= -1) {
      let startPoint = {
        x: sgeo.x,
        y: lowerMiddley + sly * isLYNeg
      }

      if (checkUsedPoint(startPoint)) {
        continue
      }

      let middlex = (sgeo.x + sgeo.width + tgeo.x) / 2
      for (let sx = 0, isXNeg = 1; sx <= (tgeo.x - sgeo.x - sgeo.width) / 2 - EDGE_ENTITY_MARGIN; sx += isXNeg < 0 ? EDGE_SPACE : 0, isXNeg *= -1) {
        let middleLower = {
          x: middlex + sx * isXNeg,
          y: startPoint.y
        }

        if (checkUsedPoint(middleLower) || isEdgeHasOverlapEntities({ start: startPoint, end: middleLower }, toBeCheckedIds)) {
          continue
        }

        let upperMiddley = tgeo.height / 2 + tgeo.y
        for (let suy = 0, isUYNeg = 1; suy <= tgeo.height / 2 - EDGE_ENTITY_MARGIN; suy += isUYNeg < 0 ? EDGE_SPACE : 0, isUYNeg *= -1) {
          let middleUpper = {
            x: middleLower.x,
            y: upperMiddley + suy * isUYNeg
          }

          if (checkUsedPoint(middleUpper) || isEdgeHasOverlapEntities({ start: middleLower, end: middleUpper }, toBeCheckedIds)) {
            continue
          }

          let endPoint = {
            x: tgeo.x,
            y: middleUpper.y
          }

          if (checkUsedPoint(endPoint) || isEdgeHasOverlapEntities({ start: middleUpper, end: endPoint }, toBeCheckedIds)) {
            continue
          }

          result.push(new MxPoint(startPoint.x, startPoint.y))
          result.push(new MxPoint(middleLower.x, middleLower.y))
          result.push(new MxPoint(middleUpper.x, middleUpper.y))
          result.push(new MxPoint(endPoint.x, endPoint.y))
          addUsedPoints(result)
          console.debug('find - 3-' + source.cell.value + '->' + target.cell.value)
          return true
        }
      }
    }
  } else if (direction === 5) {
    // 目标在源东南角，先检查是否有overlap的y
    if (tgeo.y + EDGE_ENTITY_MARGIN < sgeo.y + sgeo.height - EDGE_ENTITY_MARGIN) {
      let maxY = Math.min(Math.min(tgeo.y + tgeo.height, sgeo.y + sgeo.height), sgeo.y + sgeo.height - EDGE_ENTITY_MARGIN)
      let minY = Math.max(Math.max(tgeo.y, sgeo.y), sgeo.y + EDGE_ENTITY_MARGIN)
      // 如果在Y轴上有交集,先尝试不折
      if (maxY > minY) {
        // 尝试直接连接
        let middley = (minY + maxY) / 2
        for (let ty = 0, isNeg = 1; ty <= (maxY - minY) / 2; ty += isNeg < 0 ? EDGE_SPACE : 0, isNeg *= -1) {
          let edgeGeo = {
            start: {
              x: sgeo.x + sgeo.width,
              y: middley + ty
            },
            end: {
              x: tgeo.x,
              y: middley + ty
            }
          }

          if (checkUsedPoint(edgeGeo.start) || checkUsedPoint(edgeGeo.end)) {
            continue
          }

          if (!isEdgeHasOverlapEntities(edgeGeo, toBeCheckedIds)) {
            result.push(new MxPoint(edgeGeo.start.x, edgeGeo.start.y))
            result.push(new MxPoint(edgeGeo.end.x, edgeGeo.end.y))
            addUsedPoints(result)
            console.debug('find -1-' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }
    // 如果直接连接失败， 需要考虑一折，那么我们尝试从中缝区域走,从左侧上撇
    let middley = sgeo.height / 2 + sgeo.y
    for (let sy = 0, isYNeg = 1; sy <= sgeo.height / 2 - EDGE_ENTITY_MARGIN; sy += isYNeg < 0 ? EDGE_SPACE : 0, isYNeg *= -1) {
      let startPoint = { x: sgeo.x + sgeo.width, y: middley - sy * isYNeg }
      if (checkUsedPoint(startPoint)) {
        continue
      }
      let middlex = tgeo.x + tgeo.width / 2
      for (let tx = 0, isXNeg = 1; tx <= tgeo.width / 2 - EDGE_ENTITY_MARGIN; tx += isXNeg < 0 ? EDGE_SPACE : 0, isXNeg *= -1) {
        let endPoint = {
          x: middlex + tx * isXNeg,
          y: startPoint.y
        }

        if (checkUsedPoint(endPoint)) {
          continue
        }
        if (!isEdgeHasOverlapEntities({ start: startPoint, end: endPoint }, toBeCheckedIds)) {
          let newEndPoint = {
            x: endPoint.x,
            y: tgeo.y
          }

          if (!checkUsedPoint(newEndPoint) && !isEdgeHasOverlapEntities({ start: endPoint, end: newEndPoint }, toBeCheckedIds)) {
            result.push(new MxPoint(startPoint.x, startPoint.y))
            result.push(new MxPoint(endPoint.x, endPoint.y))
            result.push(new MxPoint(newEndPoint.x, newEndPoint.y))
            addUsedPoints(result)
            console.debug('find - 2 -' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }

    // 考虑2折，从两个东西中间创建一条横线
    let lowerMiddley = sgeo.height / 2 + sgeo.y
    for (let sly = 0, isLYNeg = 1; sly <= sgeo.height / 2 - EDGE_ENTITY_MARGIN; sly += isLYNeg < 0 ? EDGE_SPACE : 0, isLYNeg *= -1) {
      let startPoint = {
        x: sgeo.x,
        y: lowerMiddley + sly * isLYNeg
      }

      if (checkUsedPoint(startPoint)) {
        continue
      }

      let middlex = (sgeo.x + sgeo.width + tgeo.x) / 2
      for (let sx = 0, isXNeg = 1; sx <= (tgeo.x - sgeo.x - sgeo.width) / 2 - EDGE_ENTITY_MARGIN; sx += isXNeg < 0 ? EDGE_SPACE : 0, isXNeg *= -1) {
        let middleLower = {
          x: middlex + sx * isXNeg,
          y: startPoint.y
        }

        if (checkUsedPoint(middleLower) || isEdgeHasOverlapEntities({ start: startPoint, end: middleLower }, toBeCheckedIds)) {
          continue
        }

        let upperMiddley = tgeo.height / 2 + tgeo.y
        for (let suy = 0, isUYNeg = 1; suy <= tgeo.height / 2 - EDGE_ENTITY_MARGIN; suy += isUYNeg < 0 ? EDGE_SPACE : 0, isUYNeg *= -1) {
          let middleUpper = {
            x: middleLower.x,
            y: upperMiddley + suy * isUYNeg
          }

          if (checkUsedPoint(middleUpper) || isEdgeHasOverlapEntities({ start: middleLower, end: middleUpper }, toBeCheckedIds)) {
            continue
          }

          let endPoint = {
            x: tgeo.x,
            y: middleUpper.y
          }

          if (checkUsedPoint(endPoint) || isEdgeHasOverlapEntities({ start: middleUpper, end: endPoint }, toBeCheckedIds)) {
            continue
          }

          result.push(new MxPoint(startPoint.x, startPoint.y))
          result.push(new MxPoint(middleLower.x, middleLower.y))
          result.push(new MxPoint(middleUpper.x, middleUpper.y))
          result.push(new MxPoint(endPoint.x, endPoint.y))
          addUsedPoints(result)
          console.debug('find - 3-' + source.cell.value + '->' + target.cell.value)
          return true
        }
      }
    }
  } else if (direction === 6) {
    // 目标在源北东角，先检查是否有overlap的x
    if (tgeo.x + EDGE_ENTITY_MARGIN <= sgeo.x + sgeo.width - EDGE_ENTITY_MARGIN) {
      let maxX = Math.min(Math.min(tgeo.x + tgeo.width, sgeo.x + sgeo.width), sgeo.x + sgeo.width - EDGE_ENTITY_MARGIN)
      let minX = Math.max(Math.max(tgeo.x, sgeo.x), sgeo.x + EDGE_ENTITY_MARGIN)
      // 如果有交集,先尝试不折
      if (maxX > minX) {
        // 尝试直接连接
        let middlex = (minX + maxX) / 2
        for (let tx = 0, isNeg = 1; tx <= (maxX - minX) / 2; tx += isNeg < 0 ? EDGE_SPACE : 0, isNeg *= -1) {
          let edgeGeo = {
            start: {
              x: middlex + tx,
              y: sgeo.y + sgeo.height
            },
            end: {
              x: middlex + tx,
              y: tgeo.y
            }
          }

          if (checkUsedPoint(edgeGeo.start) || checkUsedPoint(edgeGeo.end)) {
            continue
          }

          if (!isEdgeHasOverlapEntities(edgeGeo, toBeCheckedIds)) {
            result.push(new MxPoint(edgeGeo.start.x, edgeGeo.start.y))
            result.push(new MxPoint(edgeGeo.end.x, edgeGeo.end.y))
            addUsedPoints(result)
            console.debug('find - 1 -' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }
    // 如果直接连接失败， 需要考虑一折，那么我们尝试从中缝区域走,从左侧上撇
    let middlex = sgeo.width / 2 + sgeo.x
    for (let sx = 0, isXNeg = 1; sx <= sgeo.width / 2 - EDGE_ENTITY_MARGIN; sx += isXNeg < 0 ? EDGE_SPACE : 0, isXNeg *= -1) {
      let startPoint = { x: middlex - sx * isXNeg, y: sgeo.y + sgeo.height }
      if (checkUsedPoint(startPoint)) {
        continue
      }
      let middley = tgeo.y + tgeo.height / 2
      for (let ty = 0, isYNeg = 1; ty <= tgeo.height / 2 - EDGE_ENTITY_MARGIN; ty += isYNeg < 0 ? EDGE_SPACE : 0, isYNeg *= -1) {
        let endPoint = {
          x: startPoint.x,
          y: middley + ty * isYNeg
        }

        if (checkUsedPoint(endPoint)) {
          continue
        }

        if (!isEdgeHasOverlapEntities({ start: startPoint, end: endPoint }, toBeCheckedIds)) {
          let newEndPoint = {
            x: tgeo.x,
            y: endPoint.y
          }

          if (!checkUsedPoint(newEndPoint) && !isEdgeHasOverlapEntities({ start: endPoint, end: newEndPoint }, toBeCheckedIds)) {
            result.push(new MxPoint(startPoint.x, startPoint.y))
            result.push(new MxPoint(endPoint.x, endPoint.y))
            result.push(new MxPoint(newEndPoint.x, newEndPoint.y))
            addUsedPoints(result)
            console.debug('find - 2 -' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }

    // 考虑2折，从两个东西中间创建一条横线
    let lowerMiddlex = sgeo.width / 2 + sgeo.x
    for (let slx = 0, isLXNeg = 1; slx <= sgeo.width / 2 - EDGE_ENTITY_MARGIN; slx += isLXNeg < 0 ? EDGE_SPACE : 0, isLXNeg *= -1) {
      let startPoint = {
        x: lowerMiddlex + slx * isLXNeg,
        y: sgeo.y + sgeo.height
      }

      if (checkUsedPoint(startPoint)) {
        continue
      }

      let middley = (sgeo.y + sgeo.height + tgeo.y) / 2
      for (let sy = 0, isYNeg = 1; sy <= (tgeo.y - sgeo.y - sgeo.height) / 2 - EDGE_ENTITY_MARGIN; sy += isYNeg < 0 ? EDGE_SPACE : 0, isYNeg *= -1) {
        let middleLower = {
          x: startPoint.x,
          y: middley + sy * isYNeg
        }

        if (checkUsedPoint(middleLower) || isEdgeHasOverlapEntities({ start: startPoint, end: middleLower }, toBeCheckedIds)) {
          continue
        }

        let upperMiddlex = tgeo.width / 2 + tgeo.x
        for (let sux = 0, isUXNeg = 1; sux <= tgeo.width / 2 - EDGE_ENTITY_MARGIN; sux += isUXNeg < 0 ? EDGE_SPACE : 0, isUXNeg *= -1) {
          let middleUpper = {
            x: upperMiddlex + sux * isUXNeg,
            y: middleLower.y
          }

          if (checkUsedPoint(middleUpper) || isEdgeHasOverlapEntities({ start: middleLower, end: middleUpper }, toBeCheckedIds)) {
            continue
          }

          let endPoint = {
            x: middleUpper.x,
            y: tgeo.y
          }

          if (checkUsedPoint(endPoint) || isEdgeHasOverlapEntities({ start: middleUpper, end: endPoint }, toBeCheckedIds)) {
            continue
          }

          result.push(new MxPoint(startPoint.x, startPoint.y))
          result.push(new MxPoint(middleLower.x, middleLower.y))
          result.push(new MxPoint(middleUpper.x, middleUpper.y))
          result.push(new MxPoint(endPoint.x, endPoint.y))
          addUsedPoints(result)
          console.debug('find - 3 -' + source.cell.value + '->' + target.cell.value)
          return true
        }
      }
    }
  } else if (direction === 7) {
    // 目标在源南东角，先检查是否有overlap的x
    if (tgeo.x + tgeo.width - EDGE_ENTITY_MARGIN > sgeo.x + EDGE_ENTITY_MARGIN) {
      let maxX = Math.min(Math.min(tgeo.x + tgeo.width, sgeo.x + sgeo.width), sgeo.x + sgeo.width - EDGE_ENTITY_MARGIN)
      let minX = Math.max(Math.max(tgeo.x, sgeo.x), sgeo.x + EDGE_ENTITY_MARGIN)
      // 如果有交集,先尝试不折
      if (maxX > minX) {
        // 尝试直接连接
        let middlex = (minX + maxX) / 2
        for (let tx = 0, isNeg = 1; tx <= (maxX - minX) / 2; tx += isNeg < 0 ? EDGE_SPACE : 0, isNeg *= -1) {
          let edgeGeo = {
            start: {
              x: middlex + tx,
              y: sgeo.y
            },
            end: {
              x: middlex + tx,
              y: tgeo.y
            }
          }

          if (checkUsedPoint(edgeGeo.start) || checkUsedPoint(edgeGeo.end)) {
            continue
          }

          if (!isEdgeHasOverlapEntities(edgeGeo, toBeCheckedIds)) {
            result.push(new MxPoint(edgeGeo.start.x, edgeGeo.start.y))
            result.push(new MxPoint(edgeGeo.end.x, edgeGeo.end.y))
            addUsedPoints(result)
            console.debug('find - 1 -' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }
    // 如果直接连接失败， 需要考虑一折，那么我们尝试从中缝区域走,从左侧上撇
    let middlex = sgeo.width / 2 + sgeo.x
    for (let sx = 0, isXNeg = 1; sx <= sgeo.width / 2 - EDGE_ENTITY_MARGIN; sx += isXNeg < 0 ? EDGE_SPACE : 0, isXNeg *= -1) {
      let startPoint = { x: middlex - sx * isXNeg, y: sgeo.y + sgeo.height }
      if (checkUsedPoint(startPoint)) {
        continue
      }
      let middley = tgeo.y + tgeo.height / 2
      for (let ty = 0, isYNeg = 1; ty <= tgeo.height / 2 - EDGE_ENTITY_MARGIN; ty += isYNeg < 0 ? EDGE_SPACE : 0, isYNeg *= -1) {
        let endPoint = {
          x: startPoint.x,
          y: middley + ty * isYNeg
        }

        if (checkUsedPoint(endPoint)) {
          continue
        }
        if (!isEdgeHasOverlapEntities({ start: startPoint, end: endPoint }, toBeCheckedIds)) {
          let newEndPoint = {
            x: tgeo.x + tgeo.width,
            y: endPoint.y
          }

          if (!checkUsedPoint(newEndPoint) && !isEdgeHasOverlapEntities({ start: endPoint, end: newEndPoint }, toBeCheckedIds)) {
            result.push(new MxPoint(startPoint.x, startPoint.y))
            result.push(new MxPoint(endPoint.x, endPoint.y))
            result.push(new MxPoint(newEndPoint.x, newEndPoint.y))
            addUsedPoints(result)
            console.debug('find - 2 - ' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }

    // 考虑2折，从两个东西中间创建一条横线
    let lowerMiddlex = sgeo.width / 2 + sgeo.x
    for (let slx = 0, isLXNeg = 1; slx <= sgeo.width / 2 - EDGE_ENTITY_MARGIN; slx += isLXNeg < 0 ? EDGE_SPACE : 0, isLXNeg *= -1) {
      let startPoint = {
        x: lowerMiddlex + slx * isLXNeg,
        y: sgeo.y + sgeo.height
      }

      if (checkUsedPoint(startPoint)) {
        continue
      }

      let middley = (sgeo.y + sgeo.height + tgeo.y) / 2
      for (let sy = 0, isYNeg = 1; sy <= (tgeo.y - sgeo.y - sgeo.height) / 2 - EDGE_ENTITY_MARGIN; sy += isYNeg < 0 ? EDGE_SPACE : 0, isYNeg *= -1) {
        let middleLower = {
          x: startPoint.x,
          y: middley + sy * isYNeg
        }

        if (checkUsedPoint(middleLower) || isEdgeHasOverlapEntities({ start: startPoint, end: middleLower }, toBeCheckedIds)) {
          continue
        }

        let upperMiddlex = tgeo.width / 2 + tgeo.x
        for (let sux = 0, isUXNeg = 1; sux <= tgeo.width / 2 - EDGE_ENTITY_MARGIN; sux += isUXNeg < 0 ? EDGE_SPACE : 0, isUXNeg *= -1) {
          let middleUpper = {
            x: upperMiddlex + sux * isUXNeg,
            y: middleLower.y
          }

          if (checkUsedPoint(middleUpper) || isEdgeHasOverlapEntities({ start: middleLower, end: middleUpper }, toBeCheckedIds)) {
            continue
          }

          let endPoint = {
            x: middleUpper.x,
            y: tgeo.y
          }

          if (checkUsedPoint(endPoint) || isEdgeHasOverlapEntities({ start: middleUpper, end: endPoint }, toBeCheckedIds)) {
            continue
          }

          result.push(new MxPoint(startPoint.x, startPoint.y))
          result.push(new MxPoint(middleLower.x, middleLower.y))
          result.push(new MxPoint(middleUpper.x, middleUpper.y))
          result.push(new MxPoint(endPoint.x, endPoint.y))
          addUsedPoints(result)
          console.debug('find - 3 -' + source.cell.value + '->' + target.cell.value)
          return true
        }
      }
    }
  } else if (direction === 8) {
    // 目标在源西南角，先检查是否有overlap的y
    if (tgeo.y + EDGE_ENTITY_MARGIN > sgeo.y + sgeo.height - EDGE_ENTITY_MARGIN) {
      let maxY = Math.min(Math.min(tgeo.y + tgeo.height, sgeo.y + sgeo.height), sgeo.y + sgeo.height - EDGE_ENTITY_MARGIN)
      let minY = Math.max(Math.max(tgeo.y, sgeo.y), sgeo.y + EDGE_ENTITY_MARGIN)
      // 如果在Y轴上有交集,先尝试不折
      if (maxY > minY) {
        // 尝试直接连接
        let middley = (minY + maxY) / 2
        for (let ty = 0, isNeg = 1; ty <= (maxY - minY) / 2; ty += isNeg < 0 ? EDGE_SPACE : 0, isNeg *= -1) {
          let edgeGeo = {
            start: {
              x: sgeo.x,
              y: middley + ty
            },
            end: {
              x: tgeo.x + tgeo.width,
              y: middley + ty
            }
          }

          if (checkUsedPoint(edgeGeo.start) || checkUsedPoint(edgeGeo.end)) {
            continue
          }

          if (!isEdgeHasOverlapEntities(edgeGeo, toBeCheckedIds)) {
            result.push(new MxPoint(edgeGeo.start.x, edgeGeo.start.y))
            result.push(new MxPoint(edgeGeo.end.x, edgeGeo.end.y))
            addUsedPoints(result)
            console.debug('find - 1 -' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }
    // 如果直接连接失败， 需要考虑一折，那么我们尝试从中缝区域走,从左侧上撇
    let middley = sgeo.height / 2 + sgeo.y
    for (let sy = 0, isYNeg = 1; sy <= sgeo.height / 2 - EDGE_ENTITY_MARGIN; sy += isYNeg < 0 ? EDGE_SPACE : 0, isYNeg *= -1) {
      let startPoint = { x: sgeo.x, y: middley - sy * isYNeg }
      if (checkUsedPoint(startPoint)) {
        continue
      }
      let middlex = tgeo.x + tgeo.width / 2
      for (let tx = 0, isXNeg = 1; tx <= tgeo.width / 2 - EDGE_ENTITY_MARGIN; tx += isXNeg < 0 ? EDGE_SPACE : 0, isXNeg *= -1) {
        let endPoint = {
          x: middlex + tx * isXNeg,
          y: startPoint.y
        }

        if (checkUsedPoint(endPoint)) {
          continue
        }

        if (!isEdgeHasOverlapEntities({ start: startPoint, end: endPoint }, toBeCheckedIds)) {
          let newEndPoint = {
            x: endPoint.x,
            y: tgeo.y
          }

          if (!checkUsedPoint(newEndPoint) && !isEdgeHasOverlapEntities({ start: endPoint, end: newEndPoint }, toBeCheckedIds)) {
            result.push(new MxPoint(startPoint.x, startPoint.y))
            result.push(new MxPoint(endPoint.x, endPoint.y))
            result.push(new MxPoint(newEndPoint.x, newEndPoint.y))
            addUsedPoints(result)
            console.debug('find - 2 -' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }

    // 考虑2折，从两个东西中间创建一条横线
    let lowerMiddley = sgeo.height / 2 + sgeo.y
    for (let sly = 0, isLYNeg = 1; sly <= sgeo.height / 2 - EDGE_ENTITY_MARGIN; sly += isLYNeg < 0 ? EDGE_SPACE : 0, isLYNeg *= -1) {
      let startPoint = {
        x: sgeo.x,
        y: lowerMiddley + sly * isLYNeg
      }

      if (checkUsedPoint(startPoint)) {
        continue
      }

      let middlex = (tgeo.x + tgeo.width + sgeo.x) / 2
      for (let sx = 0, isXNeg = 1; sx <= (sgeo.x - tgeo.x - tgeo.width) / 2 - EDGE_ENTITY_MARGIN; sx += isXNeg < 0 ? EDGE_SPACE : 0, isXNeg *= -1) {
        let middleLower = {
          x: middlex + sx * isXNeg,
          y: startPoint.y
        }

        if (checkUsedPoint(middleLower) || isEdgeHasOverlapEntities({ start: startPoint, end: middleLower }, toBeCheckedIds)) {
          continue
        }

        let upperMiddley = tgeo.height / 2 + tgeo.y
        for (let suy = 0, isUYNeg = 1; suy <= tgeo.height / 2 - EDGE_ENTITY_MARGIN; suy += isUYNeg < 0 ? EDGE_SPACE : 0, isUYNeg *= -1) {
          let middleUpper = {
            x: middleLower.x,
            y: upperMiddley + suy * isUYNeg
          }

          if (checkUsedPoint(middleUpper) || isEdgeHasOverlapEntities({ start: middleLower, end: middleUpper }, toBeCheckedIds)) {
            continue
          }

          let endPoint = {
            x: tgeo.x + tgeo.width,
            y: middleUpper.y
          }

          if (checkUsedPoint(endPoint) || isEdgeHasOverlapEntities({ start: middleUpper, end: endPoint }, toBeCheckedIds)) {
            continue
          }

          result.push(new MxPoint(startPoint.x, startPoint.y))
          result.push(new MxPoint(middleLower.x, middleLower.y))
          result.push(new MxPoint(middleUpper.x, middleUpper.y))
          result.push(new MxPoint(endPoint.x, endPoint.y))
          addUsedPoints(result)
          console.debug('find - 3-' + source.cell.value + '->' + target.cell.value)
          return true
        }
      }
    }
  }
}
let ENTITY_MIN_SPACE = 30
function calcCellFinalPost (areas, pos) {
  // 用来记录所有area中最小的高和宽，然后两值中间大值作为我们尝试移动的最小单位
  // 我们尽量把整个区域摆成一个正方形，正方形做法就是把所有区域面积加起来，然后求根算出边长
  // 然后把区域面积从大到小，从左到右从上到下往图形里面放
  let minHeight = 999999
  let minWidth = 999999
  let maxWidth = 0

  let areaId = 0
  let totalSquare = 0
  for (let i = 0; i < areas.length; i++) {
    let area = areas[i]

    let topMost = 9999999
    let bottomMost = -9999999
    let leftMost = 9999999
    let rightMost = -9999999

    for (let j = 0; j < area.cells.length; j++) {
      let cell = area.cells[j]
      let geo = pos[cell.id]

      topMost = Math.min(topMost, geo.y)
      bottomMost = Math.max(bottomMost, geo.y + geo.height)
      leftMost = Math.min(leftMost, geo.x)
      rightMost = Math.max(rightMost, geo.x + geo.width)
    }
    // 计算出这个区域的面积
    area.height = bottomMost - topMost
    area.width = rightMost - leftMost
    area.square = area.height * area.width
    totalSquare += area.square
    area.id = areaId++

    minHeight = Math.min(minHeight, area.height)
    minWidth = Math.min(minWidth, area.width)
    maxWidth = Math.max(maxWidth, area.width)

    // 把这个区域内的右上角设到0,0
    for (let j = 0; j < area.cells.length; j++) {
      let cell = area.cells[j]
      let geo = pos[cell.id]

      geo.x -= leftMost
      geo.y -= topMost
    }
  }

  let step = Math.max(minHeight, minWidth)

  areas.sort(function (a1, a2) {
    return a2.square - a1.square
  })

  let boundx = Math.max(Math.ceil(Math.sqrt(totalSquare) / step) * step, Math.ceil(maxWidth / step) * step)

  let startx = 0
  let starty = 0
  let calcedAreas = {}

  for (let i = 0; i < areas.length; i++) {
    let nextPos = locateArea(startx, starty, areas[i], calcedAreas, step, boundx)
    startx = nextPos.x
    starty = nextPos.y
  }

  for (let i = 0; i < areas.length; i++) {
    let area = areas[i]

    for (let j = 0; j < area.cells.length; j++) {
      let cell = area.cells[j]
      let geo = pos[cell.id]

      geo.x += area.x
      geo.y += area.y
    }
  }
}

function locateArea (startx, starty, area, calcedAreas, step, boundx) {
  let x = startx
  let y = starty
  while (true) {
    if (x >= boundx) {
      x = 0
      y += step + ENTITY_MIN_SPACE
    }

    let geo = {
      x: x,
      y: y,
      height: area.height,
      width: area.width
    }

    if (!hasOverlap(geo, calcedAreas)) {
      area.x = geo.x
      area.y = geo.y

      calcedAreas[area.id] = geo

      let next = {
        x: Math.ceil((geo.x + geo.width) / step) * step,
        y: geo.y
      }

      return next
    }

    x += step + ENTITY_MIN_SPACE
  }
}
let cellIdToGroup = {}
let globalPos = null
/* Above is from wx's layout code */

const STYLE = {
  W: 'fillColor=#EEE;strokeColor=#DDD',
  G: 'fillColor=#CCC;strokeColor=#DDD',
  WW: 'fillColor=#FFF;strokeColor=#DDD',
  NONE: 'fillColor=#FFF;strokeColor=#FFF;',
  BLACK: 'fillColor=#FFF;strokeColor=#000',
  TITLE: 'fillColor=#F0F0F0;strokeColor=#000',
  TABLE: 'fillColor=transparent;strokeWidth=1;strokeColor=#CCC;dashed=2;',
  VIEW: 'shape=swimlane;fillColor=#FFF;dashed=1',
  OUTLINE: 'strokeColor=#79EE79;fillColor=#B9EEB9;strokeWidth=1',
  TRANSPARENT: 'fillColor=transparent;strokeColor=transparent',
  COMMENT: 'fillColor=transparent;strokeColor=transparent;'
}

function MyGraph (container) {
  mxGraph.call(this, container)
}
MyGraph.prototype = new MxGraph()
MyGraph.prototype.constructor = MyGraph
MyGraph.prototype.expandedImage = ''

class DrawGraph {
  constructor (container, data, param, outlineContainer, isDesignModel) {
    this.container = container
    this.outlineContainer = outlineContainer
    this.param = param
    this.dataByType = data
    this.vertex = {}
    this.graph = {}
    this.redundantMargin = {
      paperHeight: 0,
      paperWidth: 0,
      update: function ({ ShapeSize, Location }) {
        let height = ShapeSize.height + Location.y
        let width = ShapeSize.width + Location.x
        if (height > this.paperHeight) {
          this.paperHeight = height
        }
        if (width > this.paperWidth) {
          this.paperWidth = width
        }
      },
      create: function () {
        this.executeCreate({ height: this.paperHeight, width: this.paperWidth })
      },
      executeCreate: ({ height, width }) => {
        let parent = this.graph.getDefaultParent()
        this.graph.insertVertex(
          parent,
          null,
          null,
          width + 60,
          height + 180,
          1,
          1, STYLE.TRANSPARENT)
      }
    }

    if (isDesignModel) { // design model
      this.modelType = 'design'
    } else if (this.dataByType.model['TypeUniqueId'] === '8ea840a5-37f4-48f8-82d9-1429e42a0fc6') { // mongoDB
      this.modelType = 'mongo'
    } else {
      this.modelType = 'database'
    }
    this.displaySetting = {
      name: this.modelType !== 'design' ? 'full' : 'logical',
      type: this.modelType !== 'design',
      column: 'all'
    }
  }
  destroy () {
    if (this.outline) {
      this.outline.destroy()
    }

    if (this.graph) {
      this.graph.destroy()
    }
  }
  start () {
    this.draw()
    this.initEventListener()
    this.param.$This.loading = false
    setTimeout(() => {
      this.param.$This.$bus.$once('focusCurrentTable', tableId => {
        for (let index in this.vertex) {
          let v = this.vertex[index]
          if (v.id === Number.parseInt(tableId)) {
            let cell = v
            $(`.svg-table[data-id=${index.slice(5)}]`).addClass('is-current')
            setTimeout(() => {
              this.graph.scrollCellToVisible(cell, true)
            }, 10)

            this.param.$This.$bus.$emit('focusCurrentTableOver')
          }
        }
      })
      this.param.$This.$bus.$emit('relationLoaded')
    })
  }

  drawShape () {
    window.connectionPoints = []
    if (!this.dataByType.diagram[this.param.diagramId]) {
      return
    }
    let diagram = this.dataByType.diagram[this.param.diagramId].children
    let diagramThemeId = this.dataByType.diagram[this.param.diagramId].properties.StyleThemeRef
    if (!diagram) {
      this.dataByType.diagram[this.param.diagramId].children = []
    }
    let parent = this.graph.getDefaultParent()

    let diagramMap = {}
    diagram.forEach(item => {
      diagramMap[item.properties.Id] = item
    })

    let figureArr = []
    diagram.forEach(d => {
      if (d.properties.TypeId === 80000008) {
        let themeStyle = {}
        if (this.dataByType.theme) {
          if (diagramThemeId && this.dataByType.theme[diagramThemeId]) {
            themeStyle = _.cloneDeep(this.dataByType.theme[diagramThemeId].properties)
          }
          if (d.properties.StyleThemeRef && this.dataByType.theme[d.properties.StyleThemeRef]) {
            themeStyle = _.cloneDeep(this.dataByType.theme[d.properties.StyleThemeRef].properties)
          }
        }

        let t = this.dataByType.table[d.properties.OwneeRef]
        let v = this.dataByType.view[d.properties.OwneeRef]
        if (!d.properties.Location) {
          d.properties.Location = {
            x: 0, y: 0
          }
        }
        if (t) {
          this.drawTableShape(d, t, themeStyle, figureArr)
        } else if (v) {
          const calculateHeight = (keyOnly) => {
            let totalHeight = 30
            let columnCnt = 0
            const keyRefAttributeSet = new Set()
            let hasPk = false
            t.children && t.children.forEach(item => {
              if (item.properties.TypeId === 80000005) {
                columnCnt++
              } else if (item.properties.TypeId === 80000093) {
                if (item.properties.KeyGroupType === 'PrimaryKey') {
                  hasPk = true
                }
                Array.isArray(item.children) && item.children.forEach(item => {
                  keyRefAttributeSet.add(item.properties['AttributeRef'])
                })
              }
            })
            if (keyOnly) {
              columnCnt = keyRefAttributeSet.size
            }
            if (hasPk) {
              totalHeight += 16 + 16 + 18 * columnCnt
            } else {
              totalHeight += 16 + 18 * columnCnt
            }
            return totalHeight
          }
          this.addThemeStyleToTable(d, themeStyle)
          let t = v
          t.style = this.formatIdToStyle(d.children)
          t.posit = d.properties
          const outerWidth = t.posit['ShapeSize'].width
          const outerHeight = t.posit['ShapeSize'].height
          const innerWidth = outerWidth - 2
          const designModel = this.modelType === 'design'
          let html = ``
          let label = ''
          if (t.properties['LogicalName']) {
            if (designModel) {
              label += `${t.properties['LogicalName']}`
            } else {
              label += `${t.properties.Name}(${t.properties['LogicalName']})`
            }
          } else {
            label += `${t.properties.Name}`
          }
          html += `<div class="svg-view" data-id="${d.properties.Id}" calc-height="${calculateHeight()}" calc-key-height="${calculateHeight(true)}" title="${label}" view-id="${t.properties.Id}" data-name="${t.properties.Name}"`

          html += ` style="height:${outerHeight}px;width:${outerWidth}px;border: 1px dashed #000;`
          if (d.properties['EntityRoundingSize']) {
            html += `border-radius: ${d.properties['EntityRoundingSize']}px;`
          }
          if (d.properties['EntityShadowColor'] && d.properties['EntityShadowSize']) {
            let c = d.properties['EntityShadowColor'].split(':')
            html += `box-shadow: ${d.properties['EntityShadowSize'].width}px ${d.properties['EntityShadowSize'].height}px 0 ${DrawGraph.colorFormatter(d.properties['EntityShadowColor'])};`
          } else {
            html += `box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.245);`
          }
          if (d.properties['EntityBorderColor'] && d.properties['EntityBorderWidth']) {
            html += `border: ${d.properties['EntityBorderWidth']}px dashed ${DrawGraph.colorFormatter(d.properties['EntityBorderColor'])};`
          }

          if (t.properties['LogicalName']) {
            html += ` data-logicalName="${t.properties['LogicalName']}">`
          } else {
            html += `">`
          }
          { // Title of view
            let label = ''
            if (t.properties['LogicalName']) {
              if (designModel) {
                label += `${t.properties['LogicalName']}`
              } else {
                label += `${t.properties.Name}(${t.properties['LogicalName']})`
              }
            } else {
              label += `${t.properties.Name}`
            }
            html += `<div class="svg-tName" data-id="${t.properties.Id}" title="${label}" data-name="${t.properties.Name}"`
            if (t.properties['LogicalName']) {
              html += ` data-logicalName="${t.properties['LogicalName']}"`
            }
            if (d.properties['EntityHeaderSelectedColor']) {
              html += ` header-selected-color="${DrawGraph.colorFormatter(d.properties['EntityHeaderSelectedColor'])}"`
            }
            let headerUnselectedColor = ''
            if (d.properties['EntityHeaderBackgroundColor']) {
              headerUnselectedColor = DrawGraph.colorFormatter(d.properties['EntityHeaderBackgroundColor'])
            }
            if (d.properties['StyleBackColor2']) {
              headerUnselectedColor = DrawGraph.colorFormatter(d.properties['StyleBackColor2'])
            }
            if (headerUnselectedColor !== '') {
              html += ` header-unselected-color="${headerUnselectedColor}"`
            }

            html += `style="background-color: #f7f7f7;border-bottom: 1px dashed #000;`
            if (d.properties['EntityHeaderTextAlignment']) {
              let position = d.properties['EntityHeaderTextAlignment']
              if (position.indexOf('Center') !== -1) {
                html += `text-align: center;`
              } else if (position.indexOf('Left') !== -1) {
                html += `text-align: left;`
              } else if (position.indexOf('Right') !== -1) {
                html += `text-align: right;`
              }
            }
            if (d.properties['EntityHeaderBackgroundColor']) { // table header 样式
              html += `background-color:${DrawGraph.colorFormatter(d.properties['EntityHeaderBackgroundColor'])};`
            }
            if (d.properties['EntityHeaderTextColor']) {
              html += `color:${DrawGraph.colorFormatter(d.properties['EntityHeaderTextColor'])};`
            }
            if (d.properties['EntityHeaderTextFont']) {
              html += `${DrawGraph.styleFontFormatter(d.properties['EntityHeaderTextFont'])}`
            }
            if (d.properties['StyleBackColor2']) {
              html += `background-color:${DrawGraph.colorFormatter(d.properties['StyleBackColor2'])};`
            }
            if (d.properties['EntityBorderColor'] && d.properties['EntityBorderWidth']) {
              html += `border-bottom: ${d.properties['EntityBorderWidth']}px dashed ${DrawGraph.colorFormatter(d.properties['EntityBorderColor'])};`
            }
            html += `"`
            html += `><span style="`
            if (d.properties['EntityHeaderTextAlignment']) {
              let position = d.properties['EntityHeaderTextAlignment']
              html += `line-height:1;`
              if (position.indexOf('Top') !== -1) {
                html += `vertical-align: top;`
              } else if (position.indexOf('Middle') !== -1) {
                html += `vertical-align: middle;`
              } else if (position.indexOf('Bottom') !== -1) {
                html += `vertical-align: bottom;`
              }
            }
            html += `">`

            html += label
            html += `</span><div class="collapse-btn"></div></div>`
          }
          html += `<div class="table-body" style="height:${outerHeight - 32}px;background-color: #fff;`
          if (d.properties['EntityBodyBackgroundColor']) {
            html += `background-color:${DrawGraph.colorFormatter(d.properties['EntityBodyBackgroundColor'])};`
          }
          if (d.properties['StyleBackColor']) {
            html += `background-color:${DrawGraph.colorFormatter(d.properties['StyleBackColor'])};`
          }
          html += `">`
          let properties = this.prepareColumnMsg(t)
          const isMongoDB = this.modelType === 'mongo'
          if (!isMongoDB) {
            html += `<div style="padding:7px 0 8px;min-height:33px;margin-bottom:7px;`
            if (d.properties['EntityBorderColor'] && d.properties['EntityBorderWidth']) {
              html += `border-bottom: ${d.properties['EntityBorderWidth']}px ${d.properties['IsEntityBorderDashed'] ? 'dashed' : 'solid'} ${DrawGraph.colorFormatter(d.properties['EntityBorderColor'])};`
            }
            html += `">`
            properties.columnArray.forEach(col => {
              if (col.deleted) {
                return
              }
              if (properties.column[col.Id]) {
                html += '<div class="svg-col'
                if (col.keyType) {
                  html += ' svg-' + col.keyType
                } else if (col.DataStandardRef) {
                  html += ' ds'
                }
                if (col.showParent) {
                  html += ' show parent'
                } else if (col.showChild) {
                  html += ' show child'
                }
                let label = this.formatColumnLabel(col)
                html += '"p-id="' + t.properties.Id + '"'
                const style = t.style[col.Id]
                if (style) {
                  html += `data-id="${col.Id}" style="width:100%;${this.parseStyle(style)}" data-columnName="${col.Name}"  data-type="${col.DataType}" title="${label}"`
                } else {
                  html += `data-id="${col.Id}" style="width:100%" data-columnName="${col.Name}"  data-type="${col.DataType}" title="${label}"`
                }
                if (col.LogicalName) {
                  html += ` data-logicalName="${col.LogicalName}"`
                }
                html += `><span>`
                html += label
                html += '</span></div>'
              }
            })
          } else {
            html += `<div style="padding:7px 0 8px;margin-bottom:7px;">`
            properties.columnArray.forEach(col => {
              html += '<div class="svg-col field'
              if (col.keyType) {
                html += ' svg-' + col.keyType
              } else if (col.DataStandardRef) {
                html += ' ds'
              }
              if (col.subRank) {
                html += ' sub-rank-' + col.subRank
              }
              let label = this.formatColumnLabel(col)
              html += '"p-id="' + t.properties.Id + '"'
              const style = t.style[col.Id]
              if (style) {
                html += `data-id="${col.Id}" style="width:100%;${this.parseStyle(style)}"  data-columnName="${col.Name}" data-type="${col.DataType}" title="${label}"`
              } else {
                html += `data-id="${col.Id}" style="width:100%;"  data-columnName="${col.Name}" data-type="${col.DataType}" title="${label}"`
              }
              if (col.LogicalName) {
                html += ` data-logicalName="${col.LogicalName}"`
              }
              html += `><span>`
              html += label
              html += '</span></div>'
            })
            html += `</div>`
          }
          html += `</div>`
          this.vertex['shape' + d.properties.Id] = this.graph.insertVertex(parent,
            t.properties.Id,
            html,
            t.posit.Location.x,
            t.posit.Location.y,
            t.posit['ShapeSize'].width,
            t.posit['ShapeSize'].height,
            STYLE.TABLE)
          this.vertex['shape' + d.properties.Id].Id = d.properties.Id
          this.vertex['shape' + d.properties.Id].viceValue = this.vertex['shape' + d.properties.Id].value
          this.vertex['shape' + d.properties.Id].viceHeight = calculateHeight()
        } else if (this.dataByType.comment && this.dataByType.comment[d.properties.OwneeRef]) { // handle comment shape
          this.addThemeStyleToComment(d, themeStyle)
          let text = this.dataByType.comment[d.properties.OwneeRef].properties.Text
          if (text) {
            text = text.replace(/\r/g, '')
          }
          if (!text) {
            text = ''
          }
          let width = d.properties['ShapeSize'].width
          let height = d.properties['ShapeSize'].height
          let html = `<div style="position:relative;z-index:1;-webkit-backface-visibility:hidden;-webkit-perspective:1000;height:${height}px;width:${width}px;text-align:left;padding:10px;word-break: break-all;word-wrap: break-word;white-space: pre-line;color: #000;line-height:1;`
          if (d.properties['CommentBackgroundColor']) {
            let color = DrawGraph.colorFormatter(d.properties['CommentBackgroundColor'])
            html += `background: linear-gradient(-135deg, transparent 8px, ${color} 0);`
          }
          if (d.properties['CommentShadowColor'] && d.properties['CommentShadowSize']) {
            let c = d.properties['CommentShadowColor'].split(':')
            html += `box-shadow: ${d.properties['CommentShadowSize'].width}px ${d.properties['CommentShadowSize'].height}px 0 ${DrawGraph.colorFormatter(d.properties['CommentShadowColor'])};`
          }
          if (d.properties['CommentTextColor']) {
            let color = DrawGraph.colorFormatter(d.properties['CommentTextColor'])
            html += `color:${color};`
          }
          if (d.properties['CommentTextFont']) {
            html += `${DrawGraph.styleFontFormatter(d.properties['CommentTextFont'])};`
          }
          if (d.properties['StyleBackColor']) {
            let color = DrawGraph.colorFormatter(d.properties['StyleBackColor'])
            html += `background: linear-gradient(-135deg, transparent 10px, ${color} 0);`
          }
          if (d.properties['StyleTextColor']) {
            let color = DrawGraph.colorFormatter(d.properties['StyleTextColor'])
            html += `color:${color};`
          }
          if (d.properties['StyleFont']) {
            html += `${DrawGraph.styleFontFormatter(d.properties['StyleFont'])}`
          }
          html += `" title="${text}">`
          const commentTopRightCorner = require(d.properties['IsCommentBorderDashed'] ? './images/comment-dashed.png' : './images/comment-solid.png')
          if (!d.properties['CommentBorderWidth']) {
            html += `${text}`
          } else {
            let borderCss = `${d.properties['CommentBorderWidth']}px ${d.properties['IsCommentBorderDashed'] ? 'dashed' : 'solid'} ${DrawGraph.colorFormatter(d.properties['CommentBorderColor'])};`
            html += `<span>${text}</span><b style="position: absolute;left:0px;bottom:0;height:100%;border-left: ${borderCss}"></b><b style="position: absolute;left:0;bottom:0px;width:100%;border-bottom: ${borderCss}"></b><b style="position: absolute;left:0;top:0px;width:${d.properties['ShapeSize'].width - 10}px;border-top: ${borderCss}"></b><b style="position: absolute;bottom:0;right:0px;height:${d.properties['ShapeSize'].height - 10}px;border-right: ${borderCss}"></b><img style="position:absolute;right:-1px;top:-1px;" src="${commentTopRightCorner}" />`
          }
          html += `</div>`
          const shape = this.graph.insertVertex(
            parent,
            null,
            html,
            d.properties.Location.x,
            d.properties.Location.y,
            d.properties['ShapeSize'].width,
            d.properties['ShapeSize'].height,
            STYLE.COMMENT)
          shape.Id = d.properties.Id
          shape.geometry.alternateBounds = new MxRectangle(0, 0, width, height)
          this.vertex['shape' + d.properties.Id] = shape
          // this.graph.cellsOrdered([shape], true)
        } else if (d.properties.SubTypeRef) { // handle subtype
          let height = d.properties.ShapeSize.height
          let width = d.properties.ShapeSize.width
          let subTypeId = d.properties.SubTypeRef
          let parentKeyName = ''
          let subtype = null
          {
            let diagram = this.dataByType.diagram[this.param.diagramId].children
            let parentConnection = null
            diagram.forEach(item => {
              if (item.properties.TypeId === 80000009) {
                if (item.properties.ChildShapeRef === d.properties.Id) {
                  parentConnection = item
                }
              }
            })
            let parentEntityId = null
            diagram.forEach(item => {
              if (item.properties.TypeId === 80000008) {
                if (item.properties.Id === parentConnection.properties.ParentShapeRef) {
                  parentEntityId = item.properties.OwneeRef
                }
              }
            })
            let currentRelation = null
            let parentTable = this.dataByType.table[parentEntityId]
            let columns = {}
            parentTable.children.forEach(item => {
              if (item.properties.TypeId === 80000005) {
                columns[item.properties.Id] = item.properties
              } else if (item.properties.TypeId === 80100042 && item.properties.Id === subTypeId) {
                subtype = item.properties
              }
            })
            if (subtype && subtype.AttributeRef) {
              let { LogicalName, Name } = columns[subtype.AttributeRef]
              parentKeyName = (LogicalName || Name)
            }
          }

          let html = `<div style="height:${height}px;width:${width}px;">`
          html += `<div class="subtype-shape`
          if (subtype && (!subtype['SubtypeType'] || subtype['SubtypeType'] === 'Exclusive')) {
            html += ` exclusive`
          }
          html += `"><div>${parentKeyName}</div></div></div>`
          this.vertex['shape' + d.properties.Id] = this.graph.insertVertex(
            parent, null, html,
            d.properties.Location.x,
            d.properties.Location.y,
            width, height,
            STYLE.TRANSPARENT)
        } else if (!d.properties['OwneeRef']) {
          this.addThemeStyleToFigure(d, themeStyle)
          let width = d.properties['ShapeSize'].width
          let height = d.properties['ShapeSize'].height
          let html = `<div style="height:${height}px;width:${width + 1}px;text-align:center;vertical-align:top;overflow : hidden;border:1px solid #000;background-color:#fff;`
          let style = 'fillColor=#fff;strokeWidth=1;strokeColor=#000;'
          if (d.properties['FigureBackgroundColor']) {
            html += `background-color:${DrawGraph.colorFormatter(d.properties['FigureBackgroundColor'])};`
            style += `fillColor=${DrawGraph.colorFormatter(d.properties['FigureBackgroundColor'])};`
          }
          if (d.properties['FigureBorderColor'] && d.properties['FigureBorderWidth']) {
            html += `border:${d.properties['FigureBorderWidth']}px ${d.properties['IsFigureBorderDashed'] ? 'dashed' : 'solid'} ${DrawGraph.colorFormatter(d.properties['FigureBorderColor'])};`
            style += `strokeWidth=${d.properties['FigureBorderWidth']};${d.properties['IsFigureBorderDashed'] ? 'dashed=1;dashPattern=2 1' : ''};strokeColor=${DrawGraph.colorFormatter(d.properties['FigureBorderColor'])};`
          }
          if (d.properties['FigureRoundingSize']) {
            html += `border-radius: ${d.properties['FigureRoundingSize']}px;`
            style += `rounded=1;perimeter=rectanglePerimeter;arcSize=${d.properties['FigureRoundingSize']};`
          }
          if (d.properties['StyleBackColor']) {
            html += `background-color:${DrawGraph.colorFormatter(d.properties['StyleBackColor'])};`
            style += `fillColor=${DrawGraph.colorFormatter(d.properties['StyleBackColor'])};`
          }
          html += `" ></div>`
          if (d.objectClass === 'Datablau.ERD.ShapePolyline' || d.objectClass === 'Datablau.ERD.ShapePolygon') {
            let points = d.properties.Path.split(';').map(ps => ps.split(',').map(i => +i))
            let shape = this.graph.insertEdge(parent, null, null, null, null, 'endArrow=none;strokeColor=#ddd;')
            let startPoint = new MxPoint(points[0][0], points[0][1])
            shape.geometry.setTerminalPoint(startPoint, true)
            shape.geometry.points = [...points.slice(1, points.length - 1).map(p => new MxPoint(p[0], p[1]))]
            shape.geometry.setTerminalPoint(d.objectClass === 'Datablau.ERD.ShapePolygon' ? startPoint : new MxPoint(points[points.length - 1][0], points[points.length - 1][1]), false)
            shape.geometry.relative = true
            shape.isPolygon = true
            shape.Id = d.properties.Id
            shape.isFigure = true
            shape.Name = d.properties.Name
            shape.OrderNumber = d.properties.OrderNumber || 0
            figureArr.push(shape)
          } else {
            const shape = this.graph.insertVertex(
              parent,
              null,
              null,
              d.properties.Location.x,
              d.properties.Location.y,
              d.properties['ShapeSize'].width,
              d.properties['ShapeSize'].height, `shape=${shapeMap[d.objectClass]};perimeter=rectanglePerimeter;` + style)
            shape.isFigure = true
            shape.Id = d.properties.Id
            shape.OrderNumber = d.properties.OrderNumber || 0
            this.vertex['shape' + d.properties.Id] = shape
            figureArr.push(shape)
          }
        }
      }
    })
    this.graph.orderCells(true, figureArr)
    // 图框有顺序需要重新排序
    figureArr = figureArr.sort((a, b) => {
      return a.OrderNumber - b.OrderNumber || a.Id - b.Id
    })
    this.graph.getDefaultParent().children && this.graph.getDefaultParent().children.splice(0, figureArr.length, ...figureArr)
    // this.redundantMargin.create()
  }
  doLayout () {
    window.move = true
    window.connectionPoints = []
    mxEdgeStyle.MyStyle = function (state, source, target, points, result) {
      if (source != null && target != null) {
        if (globalPos == null) {
          mxEdgeStyle.OrthConnector(state, source, target, points, result)
        } else {
          let toBeCheckedIds = mxUtils.clone(cellIdToGroup[source.cell.id])

          for (let i = 0; i < toBeCheckedIds.length; i++) {
            if (toBeCheckedIds[i].id === source.cell.id || toBeCheckedIds[i].id === target.cell.id) {
              toBeCheckedIds.splice(i, 1)
              i--
            }
          }

          let sgeo = source.cell.geometry
          let tgeo = target.cell.geometry

          if (source.cell.value === '12' && target.cell.value === '10') {
            console.debug('got me')
          }

          let direction = getDirection(sgeo, tgeo)
          if (!getPointsByDirection(direction, tgeo, sgeo, result, toBeCheckedIds, source, target)) {
            let notFound = true
            let seconardyDirection = getSecondaryDirection(direction, sgeo, tgeo)

            if (seconardyDirection) {
              if (getPointsByDirection(seconardyDirection, tgeo, sgeo, result, toBeCheckedIds, source, target)) {
                notFound = false
                notFound = false
              }
            }

            if (notFound) {
              let pt = new MxPoint(target.getCenterX(), source.getCenterY())

              if (mxUtils.contains(source, pt.x, pt.y)) {
                pt.y = source.y + source.height
              }

              result.push(pt)
            }
          }
        }
      }
    }
    let array = Object.values(this.vertex)
    let noRelationCells = []
    let cellGroups = []
    for (let i = 0; i < array.length; i++) {
      let cell = array[i]
      if (!cell.edges || cell.edges.length === 0 || (cell.edges.length === 1 && cell.edges[0].source.id === cell.edges[0].target.id)) {
        noRelationCells.push(cell)
        continue
      }

      let cellGroup = {
        id: cell.id,
        group: []
      }
      for (let j = 0; j < cell.edges.length; j++) {
        let edge = cell.edges[j]
        if (edge.source !== cell) {
          cellGroup.group.push(edge.source.id)
        } else if (edge.target !== cell) {
          cellGroup.group.push(edge.target.id)
        }
      }
      cellGroups.push(cellGroup)
    }
    let r = bfsToSplitGroups(cellGroups)
    let pos = {}
    let startx = 50
    let starty = 50
    let toBeCacledAreas = []
    for (let i = 0; i < r.length; i++) {
      let relation = r[i]
      let cells = []
      // 填充每个id以及关联的id
      for (let k = 0; k < relation.length; k++) {
        relation[k] = findGroupById(relation[k], cellGroups)
        cells.push(this.graph.getModel().getCell(relation[k].id))
      }
      // 逆序排列，关联多的放在前面
      relation.sort(function (o1, o2) {
        let o1len = o1.group.length
        let o2len = o2.group.length

        return o2len - o1len
      })
      // 找出这些cell的新的位置
      layoutHasConnectionsCells(this.graph, relation, pos)

      toBeCacledAreas.push({
        cells: cells
      })
    };
    // layoutNoConnectionCells(startx, 0, noRelationCells, pos);

    for (let i = 0; i < noRelationCells.length; i++) {
      let cell = noRelationCells[i]
      toBeCacledAreas.push({
        cells: [cell]
      })

      pos[cell.id] = mxUtils.clone(cell.geometry)
    }

    calcCellFinalPost(toBeCacledAreas, pos)

    doLayout(this.graph, array, pos)
    globalPos = pos
    if (this.displaySetting.column === 'no') {
      this.collapseAll()
    } else if (this.displaySetting.column === 'key') {
      this.showKeyColumn()
    } else {
      this.expandAll()
    }
    if (this.displaySetting.type) {
      this.showDataType()
    } else {
      this.hideDataType()
    }
    if (this.displaySetting.name) {
      let name = this.displaySetting.name
      if (name === 'physical') {
        this.showPhysicalName()
      } else if (name === 'logical') {
        this.showLogicalName()
      } else if (name === 'full') {
        this.showFullName()
      }
    }
    this.graph.refresh()
  }
  static colorFormatter (color) {
    if (!color) {
      return ''
    }
    if (color.indexOf('NamedColor') === 0) {
      return color.split(':')[1]
    } else if (color.indexOf('ARGBColor') === 0) {
      const c = color.split(':')
      return `rgba(${c[2]}, ${c[3]}, ${c[4]}, ${parseInt(c[1]) / 255})`
    } else {
      return color
    }
  }
  static styleFontFormatter (styleFont) {
    let res = ''
    const fontList = styleFont.split(',')
    if (fontList.length >= 2) {
      res += ';font-family: ' + fontList[0]
      res += ';font-size: ' + fontList[1].replace('pt', 'px')
      for (let i = 2; i < fontList.length; i++) {
        const index = fontList[i].indexOf('style=')
        if (index !== -1) {
          fontList[i] = fontList[i].substr(index + 'style='.length)
        }
        if (fontList[i].indexOf('Bold') !== -1) {
          res += ';font-weight: bold'
        } else if (fontList[i].indexOf('Italic') !== -1) {
          res += ';font-style: italic'
        } else if (fontList[i].indexOf('Underline') !== -1) {
          res += ';text-decoration: underline '
          if (fontList[i + 1] && fontList[i + 1].indexOf('Strikeout') !== -1) {
            res += 'line-through'
            break
          }
        } else if (fontList[i] === 'Strikeout') {
          res += ';text-decoration: line-through'
        }
      }
    }
    return res + ';'
  }
  refreshOutline () {
    setTimeout(() => {
      this.outline.refresh()
    })
  }
  focusTable (shape) {
    let shapeId = shape.split(':')[1]
    let name = shape.split(':')[2]
    let columnId = shape.split(':')[3]
    let type = shape.split(':')[0]
    let cell = this.vertex['shape' + shapeId]
    this.graph.scrollCellToVisible(cell, true)
    $('.highlight').removeClass('highlight')
    let selector
    if (type === 'table_column') {
      selector = $(`.svg-table[data-id=${shapeId}] div[data-id=${columnId}]`)
    } if (type === 'view_column') {
      selector = $(`.svg-view[data-id=${shapeId}] div[data-id=${columnId}]`)
    } else if (type === 'table') {
      selector = $(`.svg-table[data-id=${shapeId}] .svg-tName`)
    } else if (type === 'view') {
      selector = $(`.svg-view[data-id=${shapeId}] .svg-tName`)
    }
    $(selector[0]).addClass('highlight')
  }
  prepareColumnMsg (t) {
    let order = t.properties.ColumnOrderArray
    if (order) {
      let orderMap = new Map()
      order.forEach((item, index) => {
        orderMap.set(item, index)
      })
      t.children.sort((a, b) => {
        if (!isNaN(orderMap.get(a.properties.Id)) && !isNaN(orderMap.get(b.properties.Id))) {
          return (orderMap.get(a.properties.Id) - orderMap.get(b.properties.Id))
        } else if (isNaN(orderMap.get(a.properties.Id))) {
          return 1
        } else if (isNaN(orderMap.get(b.properties.Id))) {
          return -1
        } else {
          return 0
        }
      })
    }
    let others = []
    let topAttributeArray = []
    let topAttribute = {}
    let topAttribute2 = {}
    let topAttribute3 = {}
    let topAttribute4 = {}
    let topAttribute5 = {}
    let childAttribute = {}
    let result = []
    t.children && t.children.forEach(item => {
      if (item.properties['TypeId'] === 80000005) {
        if (!item.properties.OwnerRef) {
          topAttributeArray.push(item)
          topAttribute[item.properties.Id] = item
        } else {
          if (topAttribute[item.properties.OwnerRef]) {
            if (!topAttribute[item.properties.OwnerRef].children) {
              topAttribute[item.properties.OwnerRef].children = []
            }
            if (topAttribute[item.properties.OwnerRef].children.indexOf(item.properties.Id) === -1) {
              topAttribute[item.properties.OwnerRef].children.push(item.properties.Id)
            }
            topAttribute2[item.properties.Id] = item
          }
        }
      } else {
        others.push(item)
      }
    })
    if (Object.keys(topAttribute2).length > 0) {
      t.children.forEach(item => {
        if (item.properties['TypeId'] === 80000005) {
          if (topAttribute2[item.properties.OwnerRef]) {
            if (!topAttribute2[item.properties.OwnerRef].children) {
              topAttribute2[item.properties.OwnerRef].children = []
            }
            if (topAttribute2[item.properties.OwnerRef].children.indexOf(item.properties.Id) === -1) {
              topAttribute2[item.properties.OwnerRef].children.push(item.properties.Id)
            }

            topAttribute3[item.properties.Id] = item
          }
        }
      })
      t.children.forEach(item => {
        if (item.properties['TypeId'] === 80000005) {
          if (topAttribute3[item.properties.OwnerRef]) {
            if (!topAttribute3[item.properties.OwnerRef].children) {
              topAttribute3[item.properties.OwnerRef].children = []
            }
            if (topAttribute3[item.properties.OwnerRef].children.indexOf(item.properties.Id) === -1) {
              topAttribute3[item.properties.OwnerRef].children.push(item.properties.Id)
            }
            topAttribute4[item.properties.Id] = item
          }
        }
      })
      t.children.forEach(item => {
        if (item.properties['TypeId'] === 80000005) {
          if (topAttribute4[item.properties.OwnerRef]) {
            if (!topAttribute4[item.properties.OwnerRef].children) {
              topAttribute4[item.properties.OwnerRef].children = []
            }
            if (topAttribute4[item.properties.OwnerRef].children.indexOf(item.properties.Id) === -1) {
              topAttribute4[item.properties.OwnerRef].children.push(item.properties.Id)
            }
            topAttribute5[item.properties.Id] = item
          }
        }
      })
    }
    if (Object.keys(topAttribute2).length > 0) {
      t.children = others
      topAttributeArray.forEach(item => {
        t.children.push(item)
        if (topAttribute[item.properties.Id].children) {
          topAttribute[item.properties.Id].children.forEach(item2 => {
            topAttribute2[item2].properties.subRank = 2
            t.children.push(topAttribute2[item2])
            if (Object.keys(topAttribute3).length > 0) {
              if (topAttribute2[item2].children) {
                topAttribute2[item2].children.forEach(item3 => {
                  topAttribute3[item3].properties.subRank = 3
                  t.children.push(topAttribute3[item3])
                  if (topAttribute3[item3].children) {
                    topAttribute3[item3].children.forEach(item4 => {
                      topAttribute4[item4].properties.subRank = 4
                      t.children.push(topAttribute4[item4])
                      if (topAttribute4[item4].children) {
                        topAttribute4[item4].children.forEach(item5 => {
                          topAttribute5[item5].properties.subRank = 5
                          t.children.push(topAttribute5[item5])
                        })
                      }
                    })
                  }
                })
              }
            }
          })
        }
      })
    }

    let properties = {
      pk: [],
      pf: [],
      fk: [],
      uk: [],
      nk: [],
      vk: [],
      column: {},
      columnArray: []
    }
    if (t.children && Array.isArray(t.children)) {
      for (let i = 0; i < t.children.length; i++) {
        let item = t.children[i]
        if (item.properties.TypeId === 80000005) { // column
          properties.column[item.properties.Id] = item.properties
          properties.columnArray.push(item.properties)
        }
      }
    }

    if (t.children && Array.isArray(t.children)) {
      for (let i = 0; i < t.children.length; i++) {
        let item = t.children[i]
        item.children && item.children.forEach(item => {
          let id = item.properties['AttributeRef']
          if (properties.column[id]) {
            properties.column[id].keyType = ''
          }
        })
      }
      for (let i = 0; i < t.children.length; i++) {
        let item = t.children[i]
        if (item.properties.TypeId === 80000093 && item.properties['KeyGroupType'] === 'PrimaryKey') {
          if (item.children) {
            item.children.forEach(item => {
              let id = item.properties['AttributeRef']
              if (properties.column[id]) {
                properties.column[id].keyType += 'p'
              }
              properties.pk.push(properties.column[id])
            })
          }
        }
        if (item.properties.TypeId === 80000093 && item.properties['KeyGroupType'] === 'ForeignKey') {
          item.children && item.children.forEach(item => {
            let id = item.properties['AttributeRef']
            properties.fk.push(id)
            if (properties.column[id]) {
              properties.column[id].keyType += 'f'
            }
          })
        } else if (item.properties.TypeId === 80000093 && item.properties['KeyGroupType'] === 'UniqueKey') {
          if (item.children) {
            item.children.forEach(item => {
              let id = item.properties['AttributeRef']
              properties.uk.push(id)
              if (properties.column[id]) {
                // if (!properties.column[id].keyType) {
                properties.column[id].keyType += 'u'
                // }
              }
            })
          }
        } else if (item.properties.TypeId === 80000093 && item.properties['KeyGroupType'] === 'NonUniqueKey') {
          item.children && item.children.forEach(item => {
            let id = item.properties['AttributeRef']
            properties.nk.push(id)
            if (properties.column[id]) {
              // if (!properties.column[id].keyType) {
              properties.column[id].keyType += 'n'
              // }
            }
          })
        } else if (item.properties.TypeId === 80000093 && item.properties['KeyGroupType'] === 'VirtualKey') {
          item.children && item.children.forEach(item => {
            let id = item.properties['AttributeRef']
            properties.vk.push(id)
            if (properties.column[id]) {
              // if (!properties.column[id].keyType) {
              properties.column[id].keyType += 'v'
              // }
            }
          })
        }
      }
      for (let i = 0; i < t.children.length; i++) {
        let item = t.children[i]
        item.children && item.children.forEach(item => {
          let id = item.properties['AttributeRef']
          if (properties.column[id]) {
            if (properties.column[id].keyType.indexOf('p') !== -1) {
              if (properties.column[id].keyType.indexOf('f') !== -1) {
                if (properties.column[id].keyType.indexOf('v') !== -1) {
                  properties.column[id].keyType = 'pfvk'
                } else {
                  properties.column[id].keyType = 'pfk'
                }
              } else {
                properties.column[id].keyType = 'pk'
              }
            } else {
              if (properties.column[id].keyType.indexOf('f') !== -1) {
                if (properties.column[id].keyType.indexOf('v') !== -1) {
                  properties.column[id].keyType = 'fvk'
                } else {
                  properties.column[id].keyType = 'fk'
                }
              } else if (properties.column[id].keyType.indexOf('v') !== -1) {
                properties.column[id].keyType = 'vk'
              }
            }
            if (properties.column[id].keyType.indexOf('k') === -1) {
              properties.column[id].keyType += 'k'
            }
          }
        })
      }
    }
    // for (let i = 0; i < properties.pk.length; i++) {
    //   if (!properties.pk[i]) {
    //     continue
    //   }
    //   let pk = properties.pk[i].Id
    //   for (let j = 0; j < properties.fk.length; j++) {
    //     if (pk === properties.fk[j]) {
    //       properties.column[pk].keyType = 'pf'
    //     }
    //   }
    // }
    return properties
  }
  formatColumnLabel (col) {
    const designModel = this.modelType === 'design'
    let label = ''
    if (col['LogicalName']) {
      if (designModel) {
        label += `${col['LogicalName']} : ${col.DataType}`
      } else {
        label += `${col.Name}(${col['LogicalName']}) : ${col.DataType}`
      }
    } else {
      label += (col.Name + ' : ' + col.DataType)
    }
    return label
  }

  formatIdToStyle (arr) {
    const res = {}
    arr && arr.forEach(style => {
      const data = style.properties
      if (data.TypeId === 80800042) { // ShapeMemberStyle
        res[data['AttributeRef']] = data
      }
    })
    return res
  }

  parseStyle (style) {
    let res = ''
    style['AttributeTextColor'] && (res += 'color:' + DrawGraph.colorFormatter(style['AttributeTextColor']) + ';')
    style['AttributeTextFont'] && (res += DrawGraph.styleFontFormatter(style['AttributeTextFont']) + ';')
    style['StyleTextColor'] && (res += 'color: ' + DrawGraph.colorFormatter(style['StyleTextColor']) + ';')
    style['StyleBackColor'] && (res += 'background-color: ' + DrawGraph.colorFormatter(style['StyleBackColor']) + ';')
    style['StyleFont'] && (res += DrawGraph.styleFontFormatter(style['StyleFont']) + ';')
    return res
  }

  addThemeStyleToFigure (d, themeStyle) {
    let style = {}
    for (let key in themeStyle) {
      if (themeStyle.hasOwnProperty(key)) {
        if (key.indexOf('Figure') !== -1) {
          style[key] = themeStyle[key]
        }
      }
    }
    Object.assign(d.properties, style)
  }

  addThemeStyleToComment (d, themeStyle) {
    let commentThemeStyle = {}
    for (let key in themeStyle) {
      if (themeStyle.hasOwnProperty(key)) {
        if (key.indexOf('Comment') !== -1) {
          commentThemeStyle[key] = themeStyle[key]
        }
      }
    }
    Object.assign(d.properties, commentThemeStyle)
  }

  addThemeStyleToTable (d, themeStyle) {
    let entityThemeStyle = {}
    let attributeThemeStyle = {}
    for (let key in themeStyle) {
      if (themeStyle.hasOwnProperty(key)) {
        if (key.indexOf('Entity') !== -1 || key.indexOf('Figure') !== -1) {
          entityThemeStyle[key] = themeStyle[key]
        } else if (key.indexOf('Attribute') !== -1) {
          attributeThemeStyle[key] = themeStyle[key]
        }
      }
    }
    Object.assign(d.properties, entityThemeStyle)
    d.children && d.children.forEach(item => {
      Object.assign(item.properties, attributeThemeStyle)
    })
  }

  addThemeStyleToEdge (themeStyle) {
    let res = ''

    if (themeStyle.RelationshipLineWidth) {
      res += 'strokeWidth=' + themeStyle.RelationshipLineWidth + ';'
    }
    if (themeStyle.RelationshipLineColor) {
      res += 'strokeColor=' + DrawGraph.colorFormatter(themeStyle.RelationshipLineColor) + ';'
    }

    if (themeStyle.RelationshipTextColor) {
      res += 'fontColor=' + DrawGraph.colorFormatter(themeStyle.RelationshipTextColor) + ';'
    }
    if (themeStyle.RelationshipTextFont) {
      const fontList = themeStyle.RelationshipTextFont.split(',')
      if (fontList.length >= 2) {
        res += 'fontFamily=' + fontList[0] + ';'
        res += 'fontSize=' + fontList[1].substr(0, fontList[1].length - 2) + ';'
        let fontStyleNumber = 0
        if (themeStyle.RelationshipTextFont.indexOf('Bold') !== -1) {
          fontStyleNumber += 1
        }
        if (themeStyle.RelationshipTextFont.indexOf('Italic') !== -1) {
          fontStyleNumber += 2
        }
        if (themeStyle.RelationshipTextFont.indexOf('Underline') !== -1) {
          fontStyleNumber += 4
        }
        if (themeStyle.RelationshipTextFont.indexOf('Strikeout') !== -1) {
          fontStyleNumber += 8
        }
        res += `fontStyle=${fontStyleNumber};`
      }
    }
    return res + ';'
  }

  drawTableShape (d, t, themeStyle, figureArr) {
    const designModel = this.modelType === 'design'
    const isMongoDB = this.modelType === 'mongo'
    const columnOrderArray = t.properties['ColumnOrderArray']
    t.posit = d.properties
    if (themeStyle) {
      this.addThemeStyleToTable(d, themeStyle)
    }
    t.style = this.formatIdToStyle(d.children)
    const outerWidth = d.properties['ShapeSize'].width
    const innerWidth = outerWidth
    const calculateHeight = (keyOnly) => {
      let totalHeight = 30
      let columnCnt = 0
      const keyRefAttributeSet = new Set()
      let hasPk = false
      t.children && t.children.forEach(item => {
        if (item.properties.TypeId === 80000005) {
          columnCnt++
        } else if (item.properties.TypeId === 80000093) {
          if (item.properties.KeyGroupType === 'PrimaryKey') {
            hasPk = true
          }
          Array.isArray(item.children) && item.children.forEach(item => {
            keyRefAttributeSet.add(item.properties['AttributeRef'])
          })
        }
      })
      if (keyOnly) {
        columnCnt = keyRefAttributeSet.size
      }
      if (hasPk) {
        totalHeight += 16 + 16 + 18 * columnCnt
      } else {
        totalHeight += 34 + 16 + 18 * columnCnt
      }
      return totalHeight
    }
    let outerHeight = Math.max(d.properties['ShapeSize'].height/*, calculateHeight() */)
    let isCollapsed = d.properties['IsCollapsed']

    let tableHtml = `<div class="svg-table`
    if (isCollapsed) {
      tableHtml += ` collapsed`
    }
    tableHtml += `${t.properties.TypeId === 80100073 ? ' svg-business' : ''}`
    tableHtml += `" data-height="${outerHeight}" calc-height="${calculateHeight()}" calc-key-height="${calculateHeight(true)}" data-id="${d.properties.Id}" style="height:${outerHeight}px;width:${outerWidth}px;overflow:hidden;`
    if (t.properties.TypeId === 80100073) {
      if (d.properties['FigureBackgroundColor']) {
        tableHtml += `background-color:${DrawGraph.colorFormatter(d.properties['FigureBackgroundColor'])};`
      }
      if (d.properties['FigureBorderColor'] && d.properties['FigureBorderWidth']) {
        tableHtml += `border:${d.properties['FigureBorderWidth']}px ${d.properties['IsFigureBorderDashed'] ? 'dashed' : 'solid'} ${DrawGraph.colorFormatter(d.properties['FigureBorderColor'])};`
      }
      if (d.properties['FigureRoundingSize']) {
        tableHtml += `border-radius: ${d.properties['FigureRoundingSize']}px;`
      }
      if (d.properties['StyleBackColor']) {
        tableHtml += `background-color:${DrawGraph.colorFormatter(d.properties['StyleBackColor'])};`
      }
    } else {
      if (d.properties['EntityRoundingSize']) {
        tableHtml += `border-radius: ${d.properties['EntityRoundingSize']}px;`
      }
      if (d.properties['EntityBodyBackgroundColor']) {
        tableHtml += ` background-color:${DrawGraph.colorFormatter(d.properties['EntityBodyBackgroundColor'])};`
      }
      if (d.properties['StyleBackColor']) {
        tableHtml += ` background-color:${DrawGraph.colorFormatter(d.properties['StyleBackColor'])};`
      }
      if (t.properties.TypeId !== 80100073) {
        if (d.properties['EntityShadowColor'] && d.properties['EntityShadowSize']) {
          let c = d.properties['EntityShadowColor'].split(':')
          tableHtml += `box-shadow: ${d.properties['EntityShadowSize'].width}px ${d.properties['EntityShadowSize'].height}px 0 ${DrawGraph.colorFormatter(d.properties['EntityShadowColor'])};`
        } else {
          tableHtml += `box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.245);`
        }
      }
      if (d.properties['EntityBorderColor'] && d.properties['EntityBorderWidth']) {
        tableHtml += `border: ${d.properties['EntityBorderWidth']}px ${d.properties['IsEntityBorderDashed'] ? 'dashed' : 'solid'} ${DrawGraph.colorFormatter(d.properties['EntityBorderColor'])};`
      }
    }
    tableHtml += `">`

    if (t.properties.TypeId === 80100073) { // 业务实体
      let label = ''
      if (t.properties['LogicalName']) {
        if (designModel) {
          label += `${t.properties['LogicalName']}`
        } else {
          label += `${t.properties.Name}(${t.properties['LogicalName']})`
        }
      } else {
        label += `${t.properties.Name}`
      }
      tableHtml += `<div class="svg-tName pd-15" data-name="${t.properties.Name}"`
      if (t.properties['LogicalName']) {
        tableHtml += ` data-logicalName="${t.properties['LogicalName']}"`
      }
      tableHtml += ` style="background: unset;border-bottom: unset;`
      if (d.properties['EntityHeaderTextAlignment']) {
        let position = d.properties['EntityHeaderTextAlignment']
        if (position.indexOf('Center') !== -1) {
          tableHtml += `text-align: center;`
        } else if (position.indexOf('Left') !== -1) {
          tableHtml += `text-align: left;`
        } else if (position.indexOf('Right') !== -1) {
          tableHtml += `text-align: right;`
        }
      }
      tableHtml += `"><span style="`
      if (d.properties['EntityHeaderTextFont']) {
        tableHtml += `${DrawGraph.styleFontFormatter(d.properties['EntityHeaderTextFont'])}`
      }
      if (d.properties['EntityHeaderTextColor']) {
        tableHtml += `color:${DrawGraph.colorFormatter(d.properties['EntityHeaderTextColor'])};`
      }
      if (d.properties['EntityHeaderTextAlignment']) {
        let position = d.properties['EntityHeaderTextAlignment']
        tableHtml += `line-height:1.1;`
        if (position.indexOf('Top') !== -1) {
          tableHtml += `vertical-align: top;`
        } else if (position.indexOf('Middle') !== -1) {
          tableHtml += `vertical-align: middle;`
        } else if (position.indexOf('Bottom') !== -1) {
          tableHtml += `vertical-align: bottom;`
        }
      }
      tableHtml += `">${label}</span></div>`
    } else {
      { // Title of table
        let label = ''
        if (t.properties['LogicalName']) {
          if (designModel) {
            label += `${t.properties['LogicalName']}`
          } else {
            label += `${t.properties.Name}(${t.properties['LogicalName']})`
          }
        } else {
          label += `${t.properties.Name}`
        }
        tableHtml += `<div class="svg-tName" data-id="${t.properties.Id}" title="${label}" data-name="${t.properties.Name}"`
        if (t.properties['LogicalName']) {
          tableHtml += ` data-logicalName="${t.properties['LogicalName']}"`
        }
        if (d.properties['EntityHeaderSelectedColor']) {
          tableHtml += ` header-selected-color="${DrawGraph.colorFormatter(d.properties['EntityHeaderSelectedColor'])}"`
        }
        let headerUnselectedColor = ''
        if (d.properties['EntityHeaderBackgroundColor']) {
          headerUnselectedColor = DrawGraph.colorFormatter(d.properties['EntityHeaderBackgroundColor'])
        }
        if (d.properties['StyleBackColor2']) {
          headerUnselectedColor = DrawGraph.colorFormatter(d.properties['StyleBackColor2'])
        }
        if (headerUnselectedColor !== '') {
          tableHtml += ` header-unselected-color="${headerUnselectedColor}"`
        }

        tableHtml += `style="`
        if (d.properties['EntityHeaderTextAlignment']) {
          let position = d.properties['EntityHeaderTextAlignment']
          if (position.indexOf('Center') !== -1) {
            tableHtml += `text-align: center;`
          } else if (position.indexOf('Left') !== -1) {
            tableHtml += `text-align: left;`
          } else if (position.indexOf('Right') !== -1) {
            tableHtml += `text-align: right;`
          }
        }
        if (d.properties['EntityHeaderBackgroundColor']) { // table header 样式
          tableHtml += `background-color:${DrawGraph.colorFormatter(d.properties['EntityHeaderBackgroundColor'])};`
        }
        if (d.properties['EntityHeaderTextColor']) {
          tableHtml += `color:${DrawGraph.colorFormatter(d.properties['EntityHeaderTextColor'])};`
        }
        if (d.properties['EntityHeaderTextFont']) {
          tableHtml += `${DrawGraph.styleFontFormatter(d.properties['EntityHeaderTextFont'])}`
        }
        if (d.properties['StyleBackColor2']) {
          tableHtml += `background-color:${DrawGraph.colorFormatter(d.properties['StyleBackColor2'])};`
        }
        if (d.properties['EntityBorderColor'] && d.properties['EntityBorderWidth']) {
          tableHtml += `border-bottom: ${d.properties['EntityBorderWidth']}px ${d.properties['IsEntityBorderDashed'] ? 'dashed' : 'solid'} ${DrawGraph.colorFormatter(d.properties['EntityBorderColor'])};`
        }
        tableHtml += `"`
        tableHtml += `><span style="`
        if (d.properties['EntityHeaderTextAlignment']) {
          let position = d.properties['EntityHeaderTextAlignment']
          tableHtml += `line-height:1;`
          if (position.indexOf('Top') !== -1) {
            tableHtml += `vertical-align: top;`
          } else if (position.indexOf('Middle') !== -1) {
            tableHtml += `vertical-align: middle;`
          } else if (position.indexOf('Bottom') !== -1) {
            tableHtml += `vertical-align: bottom;`
          }
        }
        tableHtml += `">`

        tableHtml += label
        tableHtml += `</span><div class="collapse-btn"></div></div>`
      }
      if (isCollapsed) {
        outerHeight = 30
      }
      if (window) { // Body of table
        tableHtml += `<div class="table-body" style="height:${outerHeight - 32}px;`
        if (d.properties['EntityBodyBackgroundColor']) {
          tableHtml += `background-color:${DrawGraph.colorFormatter(d.properties['EntityBodyBackgroundColor'])};`
        }
        if (d.properties['StyleBackColor']) {
          tableHtml += `background-color:${DrawGraph.colorFormatter(d.properties['StyleBackColor'])};`
        }
        tableHtml += `">`
        let properties = this.prepareColumnMsg(t)
        if (!isMongoDB) {
          tableHtml += `<div style="padding:7px 0 8px;min-height:33px;margin-bottom:7px;border-bottom: 1px solid #000;`
          if (d.properties['EntityBorderColor'] && d.properties['EntityBorderWidth']) {
            tableHtml += `border-bottom: ${d.properties['EntityBorderWidth']}px ${d.properties['IsEntityBorderDashed'] ? 'dashed' : 'solid'} ${DrawGraph.colorFormatter(d.properties['EntityBorderColor'])};`
          }
          tableHtml += `">`
          properties.columnArray.forEach(col => {
            if (col.keyType && (col.keyType.indexOf('p') !== -1)) {
              tableHtml += '<div class="svg-col'
              if (col.keyType) {
                tableHtml += ' svg-' + col.keyType
              }
              let label = this.formatColumnLabel(col)
              tableHtml += '"p-id="' + t.properties.Id + '"'
              const style = t.style[col.Id]
              if (style) {
                tableHtml += `data-id="${col.Id}" data-columnName="${col.Name}" data-type="${col.DataType}" title="${label}" style="color: ${this.parseStyle(style)};"`
              } else {
                tableHtml += `data-id="${col.Id}" data-columnName="${col.Name}" data-type="${col.DataType}" title="${label}"`
              }

              if (col.LogicalName) {
                tableHtml += ` data-logicalName="${col.LogicalName}"`
              }
              tableHtml += `><span>`

              tableHtml += label
              tableHtml += /* ' : ' + col.DataType + */ '</span></div>'
              delete properties.column[col.Id]
            }
          })
          tableHtml += `</div>`
          properties.columnArray.forEach(col => {
            if (properties.column[col.Id]) {
              tableHtml += '<div class="svg-col'
              if (col.keyType) {
                tableHtml += ' svg-' + col.keyType
              } else if (col.DataStandardRef) {
                tableHtml += ' ds'
              }
              let label = this.formatColumnLabel(col)
              tableHtml += '"p-id="' + t.properties.Id + '"'
              const style = t.style[col.Id]
              if (style) {
                tableHtml += `data-id="${col.Id}" style="width:${innerWidth}px;${this.parseStyle(style)}" data-columnName="${col.Name}"  data-type="${col.DataType}" title="${label}"`
              } else {
                tableHtml += `data-id="${col.Id}" style="width:${innerWidth}px;" data-columnName="${col.Name}"  data-type="${col.DataType}" title="${label}"`
              }
              if (col.LogicalName) {
                tableHtml += ` data-logicalName="${col.LogicalName}"`
              }
              tableHtml += `><span>`
              tableHtml += label
              tableHtml += '</span></div>'
            }
          })
        } else {
          tableHtml += `<div style="padding:7px 0 8px;margin-bottom:7px;">`
          properties.columnArray.forEach(col => {
            tableHtml += '<div class="svg-col field'
            if (col.keyType) {
              tableHtml += ' svg-' + col.keyType
            } else if (col.DataStandardRef) {
              tableHtml += ' ds'
            }
            if (col.subRank) {
              tableHtml += ' sub-rank-' + col.subRank
            }
            let label = this.formatColumnLabel(col)
            tableHtml += '"p-id="' + t.properties.Id + '"'
            const style = t.style[col.Id]
            if (style) {
              tableHtml += `data-id="${col.Id}" style="width:${innerWidth}px;${this.parseStyle(style)}"  data-columnName="${col.Name}" data-type="${col.DataType}" title="${label}"`
            } else {
              tableHtml += `data-id="${col.Id}" style="width:${innerWidth}px;"  data-columnName="${col.Name}" data-type="${col.DataType}" title="${label}"`
            }
            if (col.LogicalName) {
              tableHtml += ` data-logicalName="${col.LogicalName}"`
            }
            tableHtml += `><span>`
            tableHtml += label
            tableHtml += '</span></div>'
          })
          tableHtml += `</div>`
        }
      }
    }
    tableHtml += `</div>`// End of table.

    let parent = this.graph.getDefaultParent()
    let roundSize = t.properties.TypeId === 80100073 ? d.properties['FigureRoundingSize'] * 2 : d.properties['EntityRoundingSize']
    this.vertex['shape' + d.properties.Id] = this.graph.insertVertex(
      parent,
      t.properties.Id,
      tableHtml,
      t.posit.Location.x,
      t.posit.Location.y,
      outerWidth,
      outerHeight,
      STYLE.TABLE + (roundSize ? `rounded=1;perimeter=rectanglePerimeter;arcSize=${roundSize}` : 'rounded=0')
    )
    this.vertex['shape' + d.properties.Id].Id = d.properties.Id
    this.vertex['shape' + d.properties.Id].viceValue = this.vertex['shape' + d.properties.Id].value
    this.vertex['shape' + d.properties.Id].viceHeight = calculateHeight()
    if (t.properties.TypeId === 80100073) {
      let shape = this.vertex['shape' + d.properties.Id]
      shape.OrderNumber = d.properties.OrderNumber || 0
      figureArr.push(shape)
    }
    this.redundantMargin.update(t.posit)
  }
  initEdgeStyle () {
    let style = mxUtils.clone(this.graph.getStylesheet().getDefaultEdgeStyle())
    style = mxUtils.clone(style)
    style.edgeStyle = 'topToBottomEdgeStyle'
    style.strokeColor = '#333'
    style.fillColor = '#EEE'
    style.startArrow = 'connector_basic'
    style.endArrow = 'connector_circle'
    style[mxConstants.ARROW_SPACING] = 80
    style[mxConstants.ARROW_SIZE] = 20
    style[mxConstants.STYLE_STARTSIZE] = 8
    style[mxConstants.STYLE_STARTFILL] = 0
    style[mxConstants.STYLE_ENDSIZE] = 8
    style[mxConstants.STYLE_ENDFILL] = 0
    style[mxConstants.STYLE_STROKEWIDTH] = 1
    const self = this
    mxEdgeStyle.myStyle = function (state, source, target, points, result) {
      let relation = state.cell
      if (relation.BendPoints) {
        let bendPoints = relation.BendPoints.split(/[,;]/)
        points = []
        points.push(new MxPoint(
          Number.parseInt(bendPoints[1]),
          Number.parseInt(bendPoints[2])
        ))
        if (bendPoints.length >= 6) {
          points.push(new MxPoint(Number.parseInt(bendPoints[6]), Number.parseInt(bendPoints[7])))
        }
      }
      mxEdgeStyle.TopToBottom(state, source, target, points, result)
    }
    mxStyleRegistry.putValue('tmpEdgeStyle', mxEdgeStyle.myStyle)
    style[mxConstants.STYLE_DASHED] = 0 // DASHED
    // style.edgeStyle = 'tmpEdgeStyle'
    this.graph.getStylesheet().putCellStyle('ZeroOrOne', style)
    style = mxUtils.clone(style)
    style[mxConstants.STYLE_DASHED] = 1 // DASHED
    this.graph.getStylesheet().putCellStyle('ZeroOrOneDashed', style)
    this.graph.getStylesheet().putCellStyle('ZeroOrOneVirtual', style)

    style = mxUtils.clone(style)
    style.startArrow = 'connector_basic'
    style.endArrow = 'connector_has_foot'
    style[mxConstants.STYLE_DASHED] = 0
    this.graph.getStylesheet().putCellStyle('ZeroOneOrMore', style)
    style = mxUtils.clone(style)
    style.startArrow = 'connector_circle'
    style.endArrow = 'connector_has_foot'
    style[mxConstants.STYLE_DASHED] = 1 // DASHED
    this.graph.getStylesheet().putCellStyle('ZeroOneOrMoreDashed', style)

    style = mxUtils.clone(style)
    style.startArrow = 'connector_basic'
    style.endArrow = 'connector_has_foot_no_circle'
    style[mxConstants.STYLE_DASHED] = 0
    this.graph.getStylesheet().putCellStyle('OneOrMore', style)
    style = mxUtils.clone(style)
    style[mxConstants.STYLE_DASHED] = 1
    style.startArrow = 'connector_circle'
    this.graph.getStylesheet().putCellStyle('OneOrMoreDashed', style)
    this.graph.getStylesheet().putCellStyle('OneOrMoreVirtual', style)

    style = mxUtils.clone(style)
    style[mxConstants.STYLE_DASHED] = 1
    style.startArrow = 'none'
    style.endArrow = 'none'
    this.graph.getStylesheet().putCellStyle('Dashed', style)

    style = mxUtils.clone(style)
    style.startArrow = 'connector_basic'
    style[mxConstants.STYLE_DASHED] = 0
    style.endArrow = 'connector_basic'
    this.graph.getStylesheet().putCellStyle('OneOnly', style)
    this.graph.getStylesheet().putCellStyle('OneOnlyVirtual', style)
    style = mxUtils.clone(style)
    style.startArrow = 'connector_basic'
    style.endArrow = 'connector_basic'
    style[mxConstants.STYLE_DASHED] = 1
    this.graph.getStylesheet().putCellStyle('OneOnlyDashed', style)

    style = mxUtils.clone(style)
    style.startArrow = 'connector_has_foot'
    style[mxConstants.STYLE_DASHED] = 1
    style.endArrow = 'connector_has_foot'
    this.graph.getStylesheet().putCellStyle('None', style)
    style[mxConstants.STYLE_DASHED] = 0
    this.graph.getStylesheet().putCellStyle('NoneDashed', style)
    style = mxUtils.clone(style)
    style.startArrow = 'connector_circle'
    style.endArrow = 'connector_has_foot'
    style[mxConstants.STYLE_DASHED] = 1 // DASHED
    style[mxConstants.STYLE_DASH_PATTERN] = '5 10'
    this.graph.getStylesheet().putCellStyle('ZeroOneOrMoreVirtual', style)

    let cardinalityTypeMap = {
      'ZeroOrOne': 'connector_circle',
      'ZeroOneOrMore': 'connector_has_foot',
      'OneOrMore': 'connector_has_foot_no_circle',
      'OneOnly': 'connector_basic',
      'None': 'connector_has_foot'
    }

    for (let startCardinalityType in cardinalityTypeMap) {
      for (let endCardinalityType in cardinalityTypeMap) {
        style = mxUtils.clone(style)
        style.startArrow = cardinalityTypeMap[startCardinalityType]
        style.endArrow = cardinalityTypeMap[endCardinalityType]
        style[mxConstants.STYLE_DASHED] = 0
        this.graph.getStylesheet().putCellStyle(`${startCardinalityType}:${endCardinalityType}`, style)
        style = mxUtils.clone(style)
        style[mxConstants.STYLE_DASHED] = 1
        style[mxConstants.STYLE_DASH_PATTERN] = '5 10'
        this.graph.getStylesheet().putCellStyle(`${startCardinalityType}:${endCardinalityType}Dashed`, style)
        style = mxUtils.clone(style)
        style[mxConstants.STYLE_DASHED] = 1
        style[mxConstants.STYLE_DASH_PATTERN] = '5 5'
        this.graph.getStylesheet().putCellStyle(`${startCardinalityType}:${endCardinalityType}DashedVirtual`, style)
      }
    }
  }
  registerEdgeStyle ({ EndCardinality = 'ZeroOrOne', points = [] } = {}) {
    let firstBendPoint = null
    let secondBendPoint = null
    let getBendPoints = str => {
      if (str) {
        let arr = str.split(/[,;]/)
        arr.forEach((item, index) => {
          arr[index] = Number.parseInt(item)
        })
        firstBendPoint = new MxPoint(arr[1], arr[2])
        if (arr.length >= 6) {
          secondBendPoint = new MxPoint(arr[6], arr[7])
        }
      }
    }

    let getSourceCellPoint = cell => {
      return getCellPoint(cell, firstBendPoint)
    }
    let getTargetCellPoint = cell => {
      return getCellPoint(cell, secondBendPoint)
    }
    let getCellPoint = (cell, point) => {
      let [left, right, top, bottom] = [cell.x, cell.x + cell.width, cell.y, cell.y + cell.height]
      let [x, y] = []
      //      if(point.x < left && point.y < top){
      //
      //      }else if(point.x > left && point.y > bottom){
      //
      //      }
      if (point.x < left) {
        x = left; y = point.y
      } else if (point.x > right) {
        x = right; y = point.y
      } else if (point.y > bottom) {
        x = point.x; y = bottom
      } else if (point.y < top) {
        x = point.x; y = top
      }
      return [new MxPoint(x, y)]
    }
    let style = mxUtils.clone(this.graph.getStylesheet().getCellStyle(EndCardinality))
    mxEdgeStyle.myStyle = function (state, source, target, points, result) {
      getBendPoints(state.cell.BendPoints)
      let sourcePoint = getSourceCellPoint(source)
      points = []
      // sourcePoint.forEach(item => {
      //   points.push(item)
      // })
      if (firstBendPoint) {
        points.push(firstBendPoint)
      }
      if (secondBendPoint) {
        points.push(secondBendPoint)
      }
      let targetPoint = getTargetCellPoint(target)
      // targetPoint.forEach(item => {
      //   points.push(item)
      // })
      mxEdgeStyle.TopToBottom(state, source, target, points, result)
    }
    mxStyleRegistry.putValue('tmpEdgeStyle', mxEdgeStyle.myStyle)
    style.edgeStyle = 'tmpEdgeStyle'
    this.graph.getStylesheet().putCellStyle('tmpStyle', style)
  }

  registerArrow () {
    function createArrow ({ hasCircle = false, hasFoot = false }) {
      return function (canvas, shape, type, pe, unitX, unitY, size, source, sw, filled) {
        return function () {
          let action = (type, x, y, ...args) => {
            if (Math.abs(unitY) < 0.1) {
              if (Math.abs(unitX - 1) < 0.1) {
                canvas[type](pe.x - y, pe.y + x, ...args)
              } else if (Math.abs(unitX + 1) < 0.1) {
                canvas[type](pe.x + y, pe.y + x, ...args)
              }
            } else {
              if (Math.abs(unitY - 1) < 0.1) {
                canvas[type](pe.x + x, pe.y - y, ...args)
              } else if (Math.abs(unitY + 1) < 0.1) {
                canvas[type](pe.x + x, pe.y + y, ...args)
              }
            }
            //            canvas[type](pe.x - x*unitY , pe.y-y*unitY)
          }
          let ellipseAction = (x, y, a, b) => {
            if (Math.abs(unitY) < 0.1) {
              if (Math.abs(unitX - 1) < 0.1) {
                canvas.ellipse(pe.x - y - b / 2, pe.y + x - a / 2, b, a)
              } else if (Math.abs(unitX + 1) < 0.1) {
                canvas.ellipse(pe.x + y - b / 2, pe.y + x - a / 2, b, a)
              }
            } else {
              if (Math.abs(unitY - 1) < 0.1) {
                canvas.ellipse(pe.x + x - a / 2, pe.y - y - b / 2, a, b)
              } else if (Math.abs(unitY + 1) < 0.1) {
                canvas.ellipse(pe.x + x - a / 2, pe.y + y - b / 2, a, b)
              }
            }
          }
          canvas.styleEnabled = true
          canvas.setFillColor('#F0F0F0')
          canvas.begin()

          if (hasFoot) {
            action('moveTo', -4, 13)
            action('lineTo', 4, 13)
            action('moveTo', 0, 12)
            action('lineTo', 2, 6)
            action('moveTo', 3, 3)
            action('lineTo', 4, 0)
            action('moveTo', 0, 12)
            action('lineTo', -1, 9)
            action('moveTo', -2, 6)
            action('lineTo', -4, 0)
          } else {
            action('moveTo', -6, 13)
            action('lineTo', 6, 13)
          }
          canvas.stroke()
          if (hasCircle) {
            ellipseAction(0, 18, 9, 9)
            canvas.fillAndStroke()
          }

          canvas.close()
        }
      }
    }

    mxMarker.addMarker('connector_basic', createArrow({ hasCircle: false }))
    mxMarker.addMarker('connector_circle', createArrow({ hasCircle: true }))
    mxMarker.addMarker('connector_has_foot', createArrow({ hasCircle: true, hasFoot: true }))
    mxMarker.addMarker('connector_has_foot_no_circle', createArrow({ hasCircle: false, hasFoot: true }))
  }
  drawEdge () {
    this.registerArrow()
    this.initEdgeStyle()

    let diagram = this.dataByType.diagram[this.param.diagramId].children
    let diagramThemeId = this.dataByType.diagram[this.param.diagramId].properties.StyleThemeRef
    if (!diagram) {
      this.dataByType.diagram[this.param.diagramId].children = []
    }
    let parent = this.graph.getDefaultParent()

    let diagramMap = {}
    diagram.forEach(item => {
      diagramMap[item.properties.Id] = item
    })

    diagram.forEach(d => {
      if (d.properties.TypeId === 80000009 || d.properties.TypeId === 80010287) {
        let themeStyle = null
        if (this.dataByType.theme) {
          if (diagramThemeId && this.dataByType.theme[diagramThemeId]) {
            themeStyle = _.cloneDeep(this.dataByType.theme[diagramThemeId].properties)
          }
          if (d.properties.StyleThemeRef && this.dataByType.theme[d.properties.StyleThemeRef]) {
            themeStyle = _.cloneDeep(this.dataByType.theme[d.properties.StyleThemeRef].properties)
          }
        }
        let showLabel = this.dataByType.diagram[this.param.diagramId].properties.ShowLabel
        if (!d.properties.BendPoints || window) {
          if (this.dataByType.relation[d.properties.OwneeRef]) {
            let relation = this.dataByType.relation[d.properties.OwneeRef].properties
            // let edgeStyle = relation.EndCardinality
            relation.BendPoints = d.properties.BendPoints
            // if (this.vertex['shape' + d.properties.ParentShapeRef] && this.vertex['shape' + d.properties.ParentShapeRef].style === 'fillColor=transparent;strokeColor=transparent;') {
            //   edgeStyle = 'Dashed'
            // } else if (!relation.EndCardinality) {
            //   relation.EndCardinality = 'ZeroOneOrMore'
            //   edgeStyle = 'ZeroOneOrMore'
            // }
            // if (relation.RelationalType === 'NonIdentifying') {
            //   edgeStyle = relation.EndCardinality + 'Dashed'
            // }
            // if (this.dataByType.relation[d.properties.OwneeRef].objectClass && this.dataByType.relation[d.properties.OwneeRef].objectClass.indexOf('Virtual') !== -1) {
            //   edgeStyle = relation.EndCardinality + 'Virtual'
            // }
            let edgeStyle = (relation.StartCardinality ? relation.StartCardinality : 'None') + ':' + (relation.EndCardinality ? relation.EndCardinality : 'None')
            if (relation.RelationalType === 'NonIdentifying') {
              edgeStyle += 'Dashed'
            }
            if (this.dataByType.relation[d.properties.OwneeRef].objectClass && this.dataByType.relation[d.properties.OwneeRef].objectClass.indexOf('Virtual') !== -1) {
              edgeStyle += 'Virtual'
            }
            let edge = this.graph.insertEdge(parent, null, showLabel ? relation.Label : null,
              this.vertex['shape' + d.properties.ParentShapeRef],
              this.vertex['shape' + d.properties.ChildShapeRef],
              `${edgeStyle};verticalLabelPosition=top;verticalAlign=bottom;labelPosition=right;align=left;${themeStyle ? this.addThemeStyleToEdge(themeStyle) : ''}${d.properties.StyleBackColor2 ? `strokeColor=${DrawGraph.colorFormatter(d.properties.StyleBackColor2)};` : ''} `
            )
            edge.BendPoints = d.properties.BendPoints
            edge.StartOrientation = d.properties.StartOrientation
            edge.EndOrientation = d.properties.EndOrientation
            // this.graph.orderCells(true, [edge])
          } else {
            let edge = this.graph.insertEdge(parent, null, null,
              this.vertex['shape' + d.properties.ParentShapeRef],
              this.vertex['shape' + d.properties.ChildShapeRef],
              `Dashed;${themeStyle ? this.addThemeStyleToEdge(themeStyle) : ''}${d.properties.StyleBackColor2 ? `strokeColor=${DrawGraph.colorFormatter(d.properties.StyleBackColor2)};` : ''}`
            )
            edge.BendPoints = d.properties.BendPoints
            edge.StartOrientation = d.properties.StartOrientation
            edge.EndOrientation = d.properties.EndOrientation
            // this.graph.orderCells(true, [edge])
          }
        } else {
          let relation = this.dataByType.relation[d.properties.OwneeRef].properties
          this.registerEdgeStyle(relation.EndCardinality)
          let edge = this.graph.insertEdge(parent, null, showLabel ? relation.Label : null,
            this.vertex['shape' + d.properties.ParentShapeRef],
            this.vertex['shape' + d.properties.ChildShapeRef],
            `tmpStyle;verticalLabelPosition=top;${themeStyle ? this.addThemeStyleToEdge(themeStyle) : ''}`
          )
          edge.BendPoints = d.properties.BendPoints
        }
      }
    })
  }
  draw () {
    mxEvent.disableContextMenu(this.container)
    const graph = new MyGraph(this.container)
    {
      // Creates a layout algorithm to be used
      // with the graph
      let layout = new MxHierarchicalLayout(graph)
      let organic = new MxFastOrganicLayout(graph)
      organic.forceConstant = 120
      let parent = graph.getDefaultParent()

      // Adds a button to execute the layout
      let button = document.createElement('button')
      $(button).css({
        position: 'absolute',
        right: '80px',
        top: '20px',
        display: 'none'
      })
      mxUtils.write(button, '自动布局')
      mxEvent.addListener(button, 'click', function (evt) {
        layout.execute(parent)
      })
      $('#consa-graph')[0].appendChild(button)
    }
    let c = new MxRubberband(graph)
    if (this.outlineContainer) {
      this.outline = new MxOutline(graph, this.outlineContainer)
      this.outline.setZoomEnabled(true)
    }
    const container = this.container
    this.graph = graph
    graph.htmlLabels = true
    graph.setCellsEditable(false)
    graph.setCellsResizable(false)
    graph.setAllowDanglingEdges(false)
    const model = graph.getModel()
    graph.panningHandler.useLeftButtonForPanning = true
    graph.container.style.cursor = 'move'
    graph.setPanning(true)
    model.beginUpdate()
    try {
      this.drawShape()
      this.drawEdge()
      //      this.doLayout();
    } catch (e) {
      this.param.$This.$message.error('绘图出错')
      console.error(e)
    }
    let beginTime = new Date().getTime()
    model.endUpdate()
    let endTime = new Date().getTime()
    let cost = endTime - beginTime
    console.debug(`用时${cost}毫秒`)
    if (this.outline) {
      setTimeout(() => {
        this.outline.refresh()
      })
    }
  }
  zoom (factor) {
    this.graph.zoom(factor)
  }
  resizeShapeHeight (table) {
    let dataHeight, height
    if (this.displaySetting.column === 'key') {
      dataHeight = table.attr('calc-key-height')
    } else if (this.displaySetting.column === 'all') {
      dataHeight = table.attr('calc-height')
    } else {
      dataHeight = 30
    }
    height = Number.parseInt(dataHeight)
    return height
  }
  initEventListener () {
    let root = $(this.container)
    root.off('click')
    root.off('mousedown')
    root.off('mouseup')
    window.move = false
    root.on('pointerdown', '.svg-table, .svg-view', function (e) {
      window.move = true
      window.connectionPoints = []
      $('.svg-table, .svg-view').each((index, value) => {
        let $header = $(value).find('.svg-tName')
        $header.css('backgroundColor', $header.attr('header-unselected-color') === 'Control' ? '#F0F0F0' : $header.attr('header-unselected-color'))
      })
      let $header = $(this).find('.svg-tName')
      $header.css('backgroundColor', $header.attr('header-selected-color'))
    })
    root.on('pointerup', '.svg-table, .svg-view', function (e) {
      window.move = false
    })
    root.on('click', function (e) {
      if (window.move) return
      let $header = $(this).find('.svg-tName')
      $header.each((index, value) => {
        let $h = $(value)
        $h.css('backgroundColor', $h.attr('header-unselected-color') === 'Control' ? '#F0F0F0' : $h.attr('header-unselected-color'))
      })
    })

    root.on('click', '.svg-table, .svg-view', function (e) {
      e.stopPropagation()
      $('.svg-table, .svg-view').each((index, value) => {
        let $header = $(value).find('.svg-tName')
        $header.css('backgroundColor', $header.attr('header-unselected-color') === 'Control' ? '#F0F0F0' : $header.attr('header-unselected-color'))
      })
      let $header = $(this).find('.svg-tName')
      $header.css('backgroundColor', $header.attr('header-selected-color'))
    })
    root.on('click', '.svg-col>span', (e) => {
      let id = $(e.target).parent().attr('data-id')
      let pId = $(e.target).parent().attr('p-id')
      // this.param.$This.showColDetail(id, pId)
      if (!this.param.$This.hideEntityClick) {
        this.param.$This.showTabDetail(pId)
      }
    })
    root.on('click', '.svg-tName>span', (e) => {
      let id = $(e.target).parent().attr('data-id')
      if (!this.param.$This.hideEntityClick) {
        this.param.$This.showTabDetail(id)
      }
    })
    root.on('click', '.svg-view', e => {
      let id = $(e.target).parent().attr('view-id')
      if (!this.param.$This.hideEntityClick && id) {
        this.param.$This.showViewDetail(id)
      }
    })
    let timeout = null
    root.on('click', '.collapse-btn', e => {
      let table = $(e.target).parent().parent()
      let height
      let vertex = this.vertex['shape' + table.attr('data-id')]
      if (table.hasClass('collapsed')) {
        if (this.displaySetting.column !== 'no') {
          height = vertex.viceHeight
          vertex.value = vertex.viceValue.replace('svg-table collapsed', 'svg-table').replace('svg-view collapsed', 'svg-view')
        } else {
          height = 30
          vertex.value = vertex.value?.replace(/height:\d+px;width/, 'height:30px;width').replace('svg-table collapsed', 'svg-table').replace('svg-view collapsed', 'svg-view')
        }
      } else {
        height = 30
        vertex.viceValue = vertex.value
        vertex.viceHeight = vertex.geometry.height
        vertex.value = vertex.value?.replace(/height:\d+px;width/, 'height:30px;width').replace('svg-table', 'svg-table collapsed').replace('svg-view', 'svg-view collapsed')
      }
      vertex.geometry.height = height
      this.graph.refresh(vertex)
      this.graph.getView().refresh()
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        if (this.displaySetting.type) {
          this.showDataType()
        } else {
          this.hideDataType()
        }
        if (this.displaySetting.name) {
          let name = this.displaySetting.name
          if (name === 'physical') {
            this.showPhysicalName()
          } else if (name === 'logical') {
            this.showLogicalName()
          } else if (name === 'full') {
            this.showFullName()
          }
        }
        if (this.displaySetting.column) {
          let table = $('.svg-table[data-id=' + $(e.target).parent().parent().attr('data-id') + ']')
          let col = this.displaySetting.column
          if (col === 'no') {
            table.find('.svg-col').hide()
          } else if (col === 'all') {
            table.find('.svg-col').show()
          } else if (col === 'key') {
            table.find('.svg-col').show()
            table.find('[class=svg-col]').hide()
            table.find('[class="svg-col ds"]').hide()
          }
        }
      })
    })
  }

  expandAll () {
    this.displaySetting.column = 'all'
    let tables = $('.svg-table, .svg-view').not('.svg-business')
    for (let i = 0; i < tables.length; i++) {
      let item = tables[i]
      if ($(item).hasClass('collapsed')) {
        $(item).find('.collapse-btn').click()
      }
      let table = $(item)
      let height = this.resizeShapeHeight(table)
      let vertex = this.vertex['shape' + table.attr('data-id')]
      vertex.value = vertex.value?.replace(/height:\d+px;width/, `height:${height}px;width`)
      vertex.geometry.height = height
      this.graph.refresh(vertex)
      this.graph.getView().refresh()
      $(item).find('.svg-col').show()
      if (this.displaySetting.type) {
        this.showDataType()
      } else {
        this.hideDataType()
      }
    }
  }
  collapseAll () {
    this.displaySetting.column = 'no'
    let tables = $('.svg-table, .svg-view').not('.svg-business')
    for (let i = 0; i < tables.length; i++) {
      let item = tables[i]
      if (!$(item).hasClass('collapsed')) {
        $(item).find('.collapse-btn').click()
      }
    }
  }
  showKeyColumn () {
    this.displaySetting.column = 'key'
    let tables = $('.svg-table, .svg-view').not('.svg-business')
    for (let i = 0; i < tables.length; i++) {
      let item = $(tables[i])
      if (item.hasClass('collapsed')) {
        item.find('.collapse-btn').click()
      }
      let table = $(item)
      let height = this.resizeShapeHeight(table)
      let vertex = this.vertex['shape' + table.attr('data-id')]
      vertex.value = vertex.value?.replace(/height:\d+px;width/, `height:${height}px;width`)
      let geo = _.cloneDeep(this.vertex['shape' + table.attr('data-id')].getGeometry())
      geo.height = height
      this.graph.getModel().setGeometry(vertex, geo)
    }
    setTimeout(() => {
      let table = $('.svg-table, .svg-view').not('.svg-business')
      table.find('[class=svg-col]').hide()
      table.find('[class="svg-col ds"]').hide()
      if (this.displaySetting.type) {
        this.showDataType()
      } else {
        this.hideDataType()
      }
    }, 0)
  }
  showDataType () {
    this.displaySetting.type = true
    $('.svg-col').html(function () {
      if (!$(this).text().includes($(this).attr('data-type'))) {
        return '<span>' + $(this).text() + ' : ' + $(this).attr('data-type') + '</span>'
      }
    })
  }
  hideDataType () {
    this.displaySetting.type = false
    $('.svg-col').html(function () {
      return '<span>' + $(this).text().split(' :')[0] + '</span>'
    })
  }
  showFullName (isDesignModel) {
    this.displaySetting.name = 'full'
    $('.svg-col').html(function () {
      let oldText = $(this).text()
      let physicalName = $(this).attr('data-columnName')
      let logicalName = $(this).attr('data-logicalName')

      let newText = isDesignModel ? logicalName || physicalName : physicalName
      if (isDesignModel) {
        if (physicalName) {
          newText = logicalName ? logicalName + '(' + physicalName + ')' : physicalName
        }
      } else {
        if (logicalName) {
          newText = physicalName + '(' + logicalName + ')'
        }
      }
      if (oldText.indexOf(' : ') > -1) {
        let type = $(this).attr('data-type')
        newText += ' : ' + type
      }
      return '<span>' + newText + '</span>'
    })
    $('.svg-tName span').text(function () {
      let physicalName = $(this).parent().attr('data-name')
      let logicalName = $(this).parent().attr('data-logicalName')
      if (isDesignModel) {
        if (physicalName) {
          return logicalName ? logicalName + '(' + physicalName + ')' : physicalName
        } else {
          return logicalName
        }
      } else {
        if (logicalName) {
          return physicalName + '(' + logicalName + ')'
        } else {
          return physicalName
        }
      }
    })
    $('.svg-view span').text(function () {
      let physicalName = $(this).parent().attr('data-name')
      let logicalName = $(this).parent().attr('data-logicalName')
      if (isDesignModel) {
        if (physicalName) {
          return logicalName ? logicalName + '(' + physicalName + ')' : physicalName
        } else {
          return logicalName
        }
      } else {
        if (logicalName) {
          return physicalName + '(' + logicalName + ')'
        } else {
          return physicalName
        }
      }
    })
  }
  showPhysicalName () {
    this.displaySetting.name = 'physical'
    $('.svg-col').html(function () {
      let oldText = $(this).text()
      let newText = $(this).attr('data-columnName')
      if (oldText.indexOf(' : ') > -1) {
        let type = $(this).attr('data-type')
        newText += ' : ' + type
      }
      return '<span>' + newText + '</span>'
    })
    $('.svg-tName span').text(function () {
      let physicalName = $(this).parent().attr('data-name')
      let logicalName = $(this).parent().attr('data-logicalName')
      return physicalName
    })
    $('.svg-view span').text(function () {
      let physicalName = $(this).parent().attr('data-name')
      let logicalName = $(this).parent().attr('data-logicalName')
      return physicalName
    })
  }
  showLogicalName () {
    this.displaySetting.name = 'logical'
    $('.svg-col').html(function () {
      let oldText = $(this).text()
      let physicalName = $(this).attr('data-columnName')
      let logicalName = $(this).attr('data-logicalName')
      let newText = ''
      if (logicalName) {
        newText = logicalName
      } else {
        newText = physicalName
      }
      if (oldText.indexOf(' : ') > -1) {
        let type = $(this).attr('data-type')
        newText += ' : ' + type
      }
      return '<span>' + newText + '</span>'
    })
    $('.svg-tName span').text(function () {
      let physicalName = $(this).parent().attr('data-name')
      let logicalName = $(this).parent().attr('data-logicalName')
      if (logicalName) {
        return logicalName
      } else {
        return physicalName
      }
    })
    $('.svg-view span').text(function () {
      let physicalName = $(this).parent().attr('data-name')
      let logicalName = $(this).parent().attr('data-logicalName')
      if (logicalName) {
        return logicalName
      } else {
        return physicalName
      }
    })
  }
}

export default DrawGraph
