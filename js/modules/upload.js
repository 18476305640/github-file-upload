import '../jquery.js'
// 引入配置对象
import configObj from './config.js'
import '../utils.js'

window.upload = {
  evens: [],
  onUpload: function (callback){
    this.evens.push(callback)
  },
  emit: function(data) {
    for(let i = 0; i<this.evens.length; i++) {
      this.evens[i](data)
    }
  } 
}
// dns加速
function dns(url) {
  let dnsUrl = (configObj.dns != null && configObj.dns.indexOf("http") == 0) ? configObj.dns : "https://cdn.jsdelivr.net/gh";
  if (dnsUrl.lastIndexOf("/") != dnsUrl.length - 1) dnsUrl += "/";
  let delimiter = configObj.branch + "/";
  let start_index = url.indexOf(delimiter);
  let _last_str = url.substring(start_index, url.length)
  let last_str = configObj.userAndRepo + "@" + _last_str
  // 返回加速后的链接
  return dnsUrl + last_str;
}


// 过渡式更改标题的函数
function transitionChangeTitle(title, transition_time = 0) {
  if (!window.recoveTitle) {
    // 恢复之前的标题
    window.recoveTitle = (function recoverTitle() {
      let title = document.title;
      return function () {
        setTimeout(function () {
          document.title = title;
        }, window.recoveTitleTime)
      }
    })();
  }
  document.title = title;
  // 如果没有设置恢复时间，就不恢复
  if (transition_time != 0 && transition_time != null) {
    window.recoveTitleTime = transition_time;
    window.recoveTitle();
  }
}


// 主要给 UploadFromFile 使用，是UploadFromFile的支撑
let githubUpload = function (fileName, fileData, isImage = true) {

  $("#resource_box").html("")
  $("#msg").html("<p>① 正在上传，请稍等...</p>")
  transitionChangeTitle("ing...");
  $.ajax({
    type: 'put',
    url: `https://api.github.com/repos/${configObj.userAndRepo}/contents${configObj.path}/${new Date().Format("yyyy")}/${new Date().Format("MM")}/${new Date().Format("dd")}/${fileName}`,
    headers: {
      'Authorization': 'token ' + configObj.token,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      message: "Upload via web tool",
      branch: configObj.branch,
      content: fileData
    }),
    success(data) {
      // 对原始链接进行nds加速
      let initUrl = data.content.download_url
      let dnsUrl = dns(initUrl)
      // 将内容写到剪切板
      // 如果不是文件，那就是图片用md图片格式进行包装
      // console.log(">>> 正在上传的是图片");
      let imgUrl = urlFormat(dnsUrl, "md")
      navigator.clipboard.writeText(isImage?imgUrl:dnsUrl).then(function () {
        console.log('OK，Template copied to clipboard！')
        $("#msg").html($("#msg").html() + "<p id='uploadSuccessTis'>② 上传成功了，请查看剪切板！ヾ(^▽^*)))</p>")
        transitionChangeTitle("success", 1000);
        console.log("正在触发上传成功事件,订阅者：",window.upload.evens)
        window.upload.emit({
          isImage: isImage,
          initUrl,
          cdnURL: dns(initUrl)
        })
        if (! isImage) {
          // 如果不是图片，显示下载链接复制选项
          $("#resource_box").html(`<p style="color:#2cb144;" class="resource_box" > <a href="${initUrl}" class="copyUrl" >文件原链<i class="fa fa-clone" aria-hidden="true"></i></a>&nbsp;&nbsp;&nbsp;<a href="${dnsUrl}" class="copyUrl">加速链接<i class="fa fa-clone" aria-hidden="true"></i></a></p>`)
          $("#msg").html($("#msg").html() + `<span style="background:#9e9831;" >( 默认复制加速链接，如果是一些特殊文件加速链接可能打不开，所以在这里给出了原链~ )<span>`)
          // 给资源链接绑定copy功能
          bindCopy(".resource_box", ".copyUrl", "href", "click");
          transitionChangeTitle("success", 1000);
        }else {
          // 图片回显
          $("#resource_box").html(`<img src="${dnsUrl}" />`)
        }
        
      }, function () {
        $("#msg").html("<span style='color:red'>Writing to the clipboard failed because you are not on this page :-( </span>")
        $("#resource_box").html(`<p style="color:#2cb144;" class="resource_box" > <a href="${dnsUrl}" class="copyUrl" >手动复制（MD图片）<i class="fa fa-clone" aria-hidden="true"></i></a></p>`)
        // 给资源链接绑定copy功能
        bindCopy(".resource_box", ".copyUrl", "href", "click");
        transitionChangeTitle("No way!", 500);
      });

    },
    error(errInfo) {
      if (errInfo.status == 422) {
        let initUrl = `https://raw.githubusercontent.com/${configObj.userAndRepo}/${configObj.branch}${configObj.path}/${new Date().Format("yyyy")}/${new Date().Format("MM")}/${new Date().Format("dd")}/${fileName}`
        let dnsUrl = dns(initUrl)
        // 远程仓库已存在重名文件！
        $("#msg").html($("#msg").html() + `<p style="color:#2cb144;" class="resource_box" >远程仓库已存在重名文件！<a href="${initUrl}" class="copyUrl">原始链接<i class="fa fa-clone" aria-hidden="true"></i></a>&nbsp;&nbsp;&nbsp;<a href="${dnsUrl}" class="copyUrl" >加速链接<i class="fa fa-clone" aria-hidden="true"></i></a> <p>`)
        $("#msg").html($("#msg").html() + `<span style="background:#9e9831;" >( 默认复制加速链接，如果是一些特殊文件加速链接可能打不开，所以在这里给出了原链~ )<span>`)
        // 给资源链接绑定copy功能
        bindCopy(".resource_box", ".copyUrl", "href", "click");
        transitionChangeTitle("ed", 1000);
        return;
      }
      // console.log("error",errInfo)
      transitionChangeTitle("fail", 1000);
      $("#msg").html($("#msg").html() + "<p style='color:red'>② 上传失败了，请检查配置与网络是否正常！  ┗|｀O′|┛ 嗷~~</p>")
    }
  })


}

// 公共工具类
let UploadFromFile = function (file, fileName = null) {
  // 如果是DataTransferItem 就转为File

  if (file.kind == 'file' && file instanceof DataTransferItem) {
    file = file.getAsFile(); // 如果是DataTransferItem 就转换成File类型
  } else if (file.kind == 'string') { // 解决复制网页图片无法上传问题
    return;
  }
  if (!(file instanceof File) || file.size <= 0) return; // 下面需要确保是File类型
  var fr = new FileReader(); //FileReader方法： https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader
  // 如果是图片进行压缩，如果不是不压缩 file == compressionFile
  let compression_config = JSON.parse(localStorage.getItem("config")).compression_config;
  ImgFileCompression(file, compression_config, () => {
    return (JSON.parse(localStorage.getItem("config")).compression) == 1 ? true : false;
  },
    (compressionFile) => {
      // 读取为base64格式的数据
      fr.readAsDataURL(compressionFile);
      fr.onload = function (e) {
        let result = e.target.result
        let fileData = e.target.result.split(",")[1];
        fileName = fileName || file.name;
        // 如果是图片，都以时间缀进行命名,否则是文件原名
        let isImage = false;
        if ((result + "").indexOf("data:image") == 0) {
          let suffix = fileName.split(".")[1];
          fileName = new Date().getTime() + "." + suffix
          isImage = true;
        }
        githubUpload(fileName, fileData, isImage);
      }
    })






}

export { githubUpload, UploadFromFile }