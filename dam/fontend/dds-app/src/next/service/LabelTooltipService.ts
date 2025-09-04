import $ from 'jquery'
class LabelTooltipService {
  public static basicTitle (containerElement, labelClassName): void {
    setTimeout(() => {
      const labels = $(containerElement).find(`.${labelClassName}`)
      for (let i = 0; i < labels.length; i++) {
        const label = $(labels[i])
        const fullText = label.text()
        const span = $(
          '<span style="visibility: hidden">' + fullText + '</span>'
        )
        $(containerElement).append(span)
        const innerWidth = parseInt(span.css('width'))
        const outerWidth = parseInt(label.css('width'))
        if (innerWidth === 0 || outerWidth === 0) {
          break
        }
        if (innerWidth >= outerWidth * 2) {
          let partText = fullText
          let partWidth = innerWidth
          let cnt = 0
          do {
            cnt ++
            partText = partText.slice(0, -1)
            span.text(partText)
            partWidth = parseInt(span.css('width'))
          } while (cnt < 10000 && partWidth > outerWidth * 2 - 32)
          $(label).html(`<span>${partText}...</span>`)
          $(label).attr('title', fullText)
        }
        span.remove()
      }
    })
  }
}
export default LabelTooltipService
