/**
 * 卦象可视化组件
 */
var HexagramView = {
  render: function(opts) {
    opts = opts || {};
    var primaryLines = opts.primaryLines || [true,true,true,true,true,true];
    var transformedLines = opts.transformedLines || null;
    var changingLines = opts.changingLines || [];
    var primaryName = opts.primaryName || '本卦';
    var transformedName = opts.transformedName || '变卦';
    var showLiuQin = opts.showLiuQin !== false;
    var lineRelations = opts.lineRelations || [];
    var shiYao = opts.shiYao !== undefined ? opts.shiYao : -1;
    var yingYao = opts.yingYao !== undefined ? opts.yingYao : -1;

    var fullNames = ['初','二','三','四','五','上'];
    var labelsHtml = '';

    // 从下往上生成（显示时倒序）
    for (var i = 5; i >= 0; i--) {
      var pYang = primaryLines[i];
      var tYang = transformedLines ? transformedLines[i] : pYang;
      var isC = changingLines.indexOf(i) >= 0;
      var isS = i === shiYao, isY = i === yingYao;
      var yaoName = fullNames[i] + (pYang ? '九' : '六');

      var markerHtml = '';
      if (isS) markerHtml = '<span class="marker-shi">世</span>';
      else if (isY) markerHtml = '<span class="marker-ying">应</span>';

      var primaryYaoHtml;
      if (pYang) {
        primaryYaoHtml = '<div class="yao-line yang"><div class="line-segment"></div></div>';
      } else {
        primaryYaoHtml = '<div class="yao-line yin"><div class="line-segment"></div><div class="line-gap"></div><div class="line-segment"></div></div>';
      }

      var relationHtml = showLiuQin && lineRelations[i] ? '<span class="yao-rel">' + lineRelations[i] + '</span>' : '';

      labelsHtml += '<div class="yao-row' + (isC ? ' changing' : '') + '">' +
        '<div class="yao-marker">' + markerHtml + '</div>' +
        '<div class="yao-line-wrap">' + primaryYaoHtml + '</div>' +
        '<div class="yao-relation">' + relationHtml + '</div>' +
        '</div>';
    }

    var transHtml = '';
    if (transformedLines) {
      var tLabels = '';
      for (var j = 5; j >= 0; j--) {
        var tYang2 = transformedLines[j];
        var isC2 = changingLines.indexOf(j) >= 0;
        var tYaoHtml;
        if (tYang2) {
          tYaoHtml = '<div class="yao-line yang' + (isC2 ? ' changed' : '') + '"><div class="line-segment"></div></div>';
        } else {
          tYaoHtml = '<div class="yao-line yin' + (isC2 ? ' changed' : '') + '"><div class="line-segment"></div><div class="line-gap"></div><div class="line-segment"></div></div>';
        }
        tLabels += '<div class="yao-row"><div class="yao-line-wrap">' + tYaoHtml + '</div></div>';
      }
      transHtml = '<div class="hexagram-column transformed"><div class="column-title text-serif">' + transformedName + '</div><div class="yao-list">' + tLabels + '</div></div>';
    }

    var legendHtml = changingLines.length > 0 ? '<div class="legend"><span class="legend-dot changing"></span><span class="legend-text">圆点 = 动爻（老阳或老阴，发生变化）</span></div>' : '';

    return '<div class="hexagram-view">' +
      '<div class="hexagram-content">' +
      '<div class="hexagram-column"><div class="column-title text-serif">' + primaryName + '</div><div class="yao-list">' + labelsHtml + '</div></div>' +
      transHtml +
      '</div>' + legendHtml + '</div>';
  }
};
