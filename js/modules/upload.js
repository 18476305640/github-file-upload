import '../jquery.js'
// 引入配置对象
import configObj from './config.js'
import '../utils.js'
// dns加速
function dns (url) {
  let dnsUrl =  "https://cdn.jsdelivr.net/gh"
  if (dnsUrl.lastIndexOf("/") != dnsUrl.length - 1) dnsUrl += "/";
  let delimiter = configObj.branch + "/";
  let start_index = url.indexOf(delimiter);
  let _last_str = url.substring(start_index, url.length)
  let last_str = configObj.userAndRepo + "@" + _last_str
  // 返回加速后的链接
  return dnsUrl + last_str;
}


// 过渡式更改标题的函数
function transitionChangeTitle(title,transition_time = 0) {
  if (!window.recoveTitle) {
    // 恢复之前的标题
    window.recoveTitle = (function recoverTitle(){
      let title = document.title;
      return function(){
        setTimeout(function() {
          document.title = title;
        },window.recoveTitleTime)
      }
    })();
  }
  document.title = title;
  // 如果没有设置恢复时间，就不恢复
  if(transition_time != 0 && transition_time != null) {
    window.recoveTitleTime = transition_time;
    window.recoveTitle();
  }
}
// 获取文件sha
function getSha(path,fileName,callback) {
  $.ajax({
    type: 'GET',
    url: `https://api.github.com/repos/${configObj.userAndRepo}/contents${path}`,
    headers: {
      'Authorization': 'token ' + configObj.token,
    },
    success (data) {
      console.log("测试data=",data)
      if(data instanceof Array) {
        //是数组
        for(let i = 0; i < data.length; i++) {
          let item = data[i];
          let name = item.name;
          if(fileName.trim() == name.trim()) {
            let sha = item.sha;
            callback(sha);
            return;
          }
        }
        // 如果没有找到
        callback(null);
      }else {
        //是对象
        let item = data;
        let sha = item.sha; 
        callback(sha);
      }
    },
    error (errInfo) {
      callback(null)
    }
  })
}

let coverUpload = function (fullPath,file,callback) {
  // 异步去转base64
  var fileToBase64 = new Promise((resolve, reject)=>{
    FileToBase64(file,function(base64Data) {
      console.log("异步成功：",base64Data)
      resolve(base64Data)
    })
  });
  fileToBase64.then(function(base64Data) {
    let validBase64 = base64Data.split(",")[1];
    console.log("通知成功",base64Data)
    // 查看是否有远程文件
    getSha(fullPath,"",function(sha) {
      $.ajax({
        type: 'PUT',
        url: `https://api.github.com/repos/${configObj.userAndRepo}/contents${fullPath}`,
        headers: {
          'Authorization': 'token ' + configObj.token,
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({
          message: "Upload via web tool",
          branch: configObj.branch,
          content: validBase64,
          sha: sha
        }),
        success (data) {
          callback(data)
        },
        error (errInfo) {
          
        }
      })
    })

  })
  
  //   GET https://api.github.com/repos/18476305640/typora/contents/images HTTP/1.1
  // Authorization: token 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
    

  // 没有直接上传

  // 有的话，先获取has，再使用has覆盖上传

}
// coverUpload("/images/2022/10/30/1667104212.png",StringToTextFile("你好兄弟999","zjazn.txt"),function(data) {
//   console.log("成功回调",data)
// } )

// 主要给 UploadFromFile 使用，是UploadFromFile的支撑
let githubUpload = function (fileName, fileData,isImage = true) {

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
    success (data) {
      console.log("上传成功的原始数据 ：",data)
      // 对原始链接进行nds加速
      let initUrl = data.content.download_url
      let dnsUrl = dns(initUrl)
      // 将内容写到剪切板
      let finallyUrl = dnsUrl;
      
      if(isImage) {
        // 如果是图片用md图片格式进行包装
        // console.log(">>> 正在上传的是图片");
        finallyUrl = urlFormat(dnsUrl, "md")
      }
      console.log(initUrl)
      navigator.clipboard.writeText(finallyUrl).then(function () {
        console.log('OK，Template copied to clipboard！')        
        $("#msg").html($("#msg").html() + "<p id='uploadSuccessTis'>② 上传成功了，请查看剪切板！ヾ(^▽^*)))</p>")
        transitionChangeTitle("success",1000);
        if (isImage) {
          $("#resource_box").html(`<img src="${dnsUrl}" />`)
        }else {
          $("#resource_box").html(`<p style="color:#2cb144;" class="resource_box" > <a href="${initUrl}" class="copyUrl" >文件原链<i class="fa fa-clone" aria-hidden="true"></i></a>&nbsp;&nbsp;&nbsp;<a href="${dnsUrl}" class="copyUrl">加速链接<i class="fa fa-clone" aria-hidden="true"></i></a></p>`)
          $("#msg").html($("#msg").html() + `<span style="background:#9e9831;" >( 默认复制加速链接，如果是一些特殊文件加速链接可能打不开，所以在这里给出了原链~ )<span>`)
          // 给资源链接绑定copy功能
          bindCopy(".resource_box",".copyUrl","href","click");
        }
      }, function () {
        $("#msg").html("<span style='color:red'>Error,Unable to write to clipboard. :-(</span>")
        transitionChangeTitle("No way!",1);
      });

    },
    error (errInfo) {
      if(errInfo.status == 422) {
        let initUrl = `https://raw.githubusercontent.com/${configObj.userAndRepo}/${configObj.branch}${configObj.path}/${new Date().Format("yyyy")}/${new Date().Format("MM")}/${new Date().Format("dd")}/${fileName}`
        let dnsUrl = dns(initUrl)
        // 远程仓库已存在重名文件！
        $("#msg").html($("#msg").html() + `<p style="color:#2cb144;" class="resource_box" >远程仓库已存在重名文件！<a href="${initUrl}" class="copyUrl">原始链接<i class="fa fa-clone" aria-hidden="true"></i></a>&nbsp;&nbsp;&nbsp;<a href="${dnsUrl}" class="copyUrl" >加速链接<i class="fa fa-clone" aria-hidden="true"></i></a> <p>`)
        $("#msg").html($("#msg").html() + `<span style="background:#9e9831;" >( 默认复制加速链接，如果是一些特殊文件加速链接可能打不开，所以在这里给出了原链~ )<span>`)
        // 给资源链接绑定copy功能
        bindCopy(".resource_box",".copyUrl","href","click");
        transitionChangeTitle("ed",1000);
        return;
      }
      // console.log("error",errInfo)
      transitionChangeTitle("fail",1000);
      $("#msg").html($("#msg").html() + "<p style='color:red'>② 上传失败了，请检查配置与网络是否正常！  ┗|｀O′|┛ 嗷~~</p>")
    }
  })
  
  
}

// 公共工具类
let UploadFromFile = function (file,fileName = null) {
  console.log("file->",file);
  // 如果是DataTransferItem 就转为File

  if( file.kind == 'file' && file instanceof DataTransferItem ) {
    file = file.getAsFile(); // 如果是DataTransferItem 就转换成File类型
  }else if(file.kind == 'string') { // 解决复制网页图片无法上传问题
    return;
  }
  if(!(file instanceof File) || file.size <= 0) return; // 下面需要确保是File类型
  var fr = new FileReader(); //FileReader方法： https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader
  // 如果是图片进行压缩，如果不是不压缩 file == compressionFile
  let compression_config = JSON.parse(localStorage.getItem("config")).compression_config;
  ImgFileCompression(file, compression_config,()=>{
    return (JSON.parse(localStorage.getItem("config")).compression) == 1?true:false;
  },
  (compressionFile)=>{
      // 读取为base64格式的数据
      fr.readAsDataURL(compressionFile);
      fr.onload = function (e) {
        let result = e.target.result
        let fileData = e.target.result.split(",")[1];
        console.log(result,"to",fileData)
        fileName = fileName || file.name;
        // 如果是图片，都以时间缀进行命名,否则是文件原名
        let isImage = false;
        if((result+"").indexOf("data:image") == 0) {
          let suffix = fileName.split(".")[1];
          fileName = new Date().getTime() + "." + suffix
          isImage = true;
        }
        githubUpload(fileName, fileData,isImage);
      }
  })

  
  



}

export { githubUpload, UploadFromFile }