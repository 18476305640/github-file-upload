function urlFormat(url, format = "md", describe = new Date().Format('yyyy-MM-dd')) {

  switch (format) {
    case "md":
      return `![](${url})`
      break
    default:
      return url
  }
}

// 给元素绑定可点击复制的功能
// 参数描述：给哪个父元素的要绑定的哪个子元素的哪个属性值作为copy对象，当执行什么事件时
function bindCopy(parent, target, targetAttr, even) {
  $(parent).on(even, target, function (e) {
    // 阻止默认事件
    e.preventDefault();
    event.stopPropagation();
    // 将链接复制到剪切板
    let fileInitUrl = $(e.target).attr(targetAttr)
    navigator.clipboard.writeText(fileInitUrl).then(()=> {
      $(e.target).text("复制成功！\(￣︶￣*\))") //  $(e.target) 表示是点击的对象
    }, ()=> {
      $(e.target).text("复制失败了 (;´༎ຶД༎ຶ`)")  //  $(e.target) 表示是点击的对象
    });
  })

}