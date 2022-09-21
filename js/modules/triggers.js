// 引入要使用的函数
import { githubUpload, toUplog } from './upload.js'
// 引入 jquery 
import '../jquery.js'

// 公共工具类
function UploadFromFile(file) {
  // 如果是DataTransferItem 就转为File
  if(file.kind == "file" ) file = file.getAsFile();
  if(file.size <= 0) return;
    var fr = new FileReader(); //FileReader方法： https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader
    // 读取为base64格式的数据
    fr.readAsDataURL(file);
    fr.onload = function (e) {
      let result = e.target.result
      console.log("result", result)
      let suffix = result.split("/")[1].split(";")[0]
      suffix = suffix.indexOf("zip") >= 0 ? "zip" : suffix
      // 如果是zip压缩文件，对后缀进行修改
      let fileData = e.target.result.split(",")[1];
      let fileName = new Date().getTime() + "." + suffix
      toUplog(fileName, fileData)
    }

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
function FileToBase64(file) {
  var reader = new FileReader();
  // 传入一个参数对象即可得到基于该参数对象的文本内容
  reader.readAsDataURL(file);
  reader.onload = function (e) {
    // target.result 该属性表示目标对象的DataURL
    return e.target.result;
  };
}



// 第一种触发方式： 点击“上传”
$("#img_pre_show").click(function () {
  if (window.FileReader) {
    var reader = new FileReader();
  } else {
    console.log('你的浏览器不支持读取文件');
  }
  var myFile = document.querySelector('#myFile');
  var file = myFile.files[0];
  reader.readAsDataURL(file);
  reader.onload = function (data) {
    let namePath = $("#myFile").val()
    let fileData = data.currentTarget.result.split(",")[1];
    let fileName = namePath.substring(namePath.lastIndexOf("\\") + 1, namePath.length).trim()
    toUplog(fileName, fileData);
  };
  reader.onerror = function () {
    console.log('读取失败');
    console.log(reader.error);
  }


})
// 第二种触发: 粘贴动作
document.addEventListener('paste', function (e) {
  var files = e.clipboardData.items;
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    UploadFromFile(file);
  }
});

// 第三种方式
$("#choose_img")[0].addEventListener("dragover", function (e) {
  e.preventDefault();
  e.stopPropagation();
}, false);
$("#choose_img")[0].addEventListener("drop", function (e) {
  // 处理拖拽文件的逻辑
  e.preventDefault();
  e.stopPropagation();
  var df = e.dataTransfer;
  if (df.items !== undefined) {
    // Chrome拖拽文件逻辑
    let files = df.files
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      console.log("=>",file)
      UploadFromFile(file);
    }
  }



}, false)
