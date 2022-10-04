// 引入要使用的函数
import { githubUpload,UploadFromFile } from './upload.js'
// 引入 jquery 
import '../jquery.js'


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
  let files = window.currentChooseFiles;
  if(files == null || files.length == 0) return;
  
  for(let i = 0; i < files.length; i++) {
    let file = files[i];
    console.log(file)
    UploadFromFile(file);
  }

  // if (window.FileReader) {
  //   var reader = new FileReader();
  // } else {
  //   console.log('你的浏览器不支持读取文件');
  // }
  // var myFile = document.querySelector('#myFile');
  // var file = myFile.files[0];
  // reader.readAsDataURL(file);
  // reader.onload = function (data) {
  //   // 只要是图片，文件名就是时间戳
  //   let namePath = $("#myFile").val()
  //   let fileData = data.currentTarget.result.split(",")[1];
  //   let fileName_char = namePath.substring(namePath.lastIndexOf("\\") + 1, namePath.length).trim().split(".")
  //   let suffix = fileName_char[fileName_char.length - 1]
  //   let fileName = new Date().getTime()+"."+suffix;
  //   githubUpload(fileName, fileData);
  // };
  // reader.onerror = function () {
  //   console.log('读取失败');
  //   console.log(reader.error);
  // }


})
// 第二种触发: 粘贴动作
document.addEventListener('paste', function (e) {
  
  var files = e.clipboardData.items;
  
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    // file.getAsString(function (s){

    // });
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

// 第二种触发: 粘贴动作
document.addEventListener('paste', function (e) {
  var files = e.clipboardData.items;
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    if(file.kind != "string") continue;
    file.getAsString(function (sourceUrl){
      if(sourceUrl.indexOf("http") != 0) return;
      console.log("*** 是http链接")
      alert("暂不支持图片链接上传~")
    });
  }
});
