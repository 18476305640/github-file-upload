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
    // 将链接复制到剪切板
    
    // 防止点击到i标签，如果点到i标签应向上找a标签
    let aElement = $(e.target).closest('a'); 
    let fileInitUrl = aElement.attr(targetAttr)
    navigator.clipboard.writeText(fileInitUrl).then(()=> {
      if(aElement != null) aElement.text("复制成功！\(￣︶￣*\))")
    }, ()=> {
      if(aElement != null) aElement.text("复制失败了 (;´༎ຶД༎ຶ`)")
    });
  })

}
// 将字符串转为文本对象
function StringToTextFile(text,fileName) {
  var reader = new FileReader();
  let file = new File([text],fileName ,{
      type: 'text/plain'
  });
  return file;
}
// 读取文本文件
function readTextFile(file, readFun) {
  reader.readAsText(file, 'utf-8');
  reader.onload = function(){
    readFun(reader.result)
  };
}

// 数据格式转换函数
function Base64ToBlob(base64) {
  var arr = base64.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  console.log(new Blob([u8arr], { type: mime }))
  return new Blob([u8arr], { type: mime })
}
//FileReader方法： https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader
function FileToBase64(file) {
  return new Promise((resolve,reject)=>{
    let reader = new FileReader();
    // 传入一个参数对象即可得到基于该参数对象的文本内容
    reader.readAsDataURL(file);
    reader.onload = function (e) {
      // target.result 该属性表示目标对象的DataURL
      resolve(e.target.result);
    };
  })
  
}


// 过渡式更改标题的函数
let recoveTitle = (function recoverTitle() {
  let originalTitle = document.title;
  return function (transitionTime) {
    if(transitionTime == null) {
      document.title = originalTitle;
      return;
    }
    setTimeout(function () {
      document.title = originalTitle;
    }, transitionTime)
  }
})();
// 如果transitionTime为空，则不恢复原来的标题
function transitionChangeTitle(title = "", transitionTime) {
  document.title = title;
  // 如果没有设置恢复时间，就不恢复
  if (title.length == 0 || transitionTime != null) {
    recoveTitle(transitionTime)
  }
}
export {transitionChangeTitle,FileToBase64,bindCopy,urlFormat}