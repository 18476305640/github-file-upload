
// 引入配置对象
import configObj from './config.js'
import '../utils.js'
// 获取文件sha
function getSha(path, fileName, callback) {
    $.ajax({
      type: 'GET',
      url: `https://api.github.com/repos/${configObj.userAndRepo}/contents${path}`,
      headers: {
        'Authorization': 'token ' + configObj.token,
      },
      success(data) {
        console.log("测试data=", data)
        if (data instanceof Array) {
          //是数组
          for (let i = 0; i < data.length; i++) {
            let item = data[i];
            let name = item.name;
            if (fileName.trim() == name.trim()) {
              let sha = item.sha;
              callback(sha);
              return;
            }
          }
          // 如果没有找到
          callback(null);
        } else {
          //是对象
          let item = data;
          let sha = item.sha;
          callback(sha);
        }
      },
      error(errInfo) {
        callback(null)
      }
    })
  }
  
  let coverUpload = function (fullPath, file, callback) {
    // 异步去转base64
    var fileToBase64 = new Promise((resolve, reject) => {
      FileToBase64(file, function (base64Data) {
        console.log("异步成功：", base64Data)
        resolve(base64Data)
      })
    });
    fileToBase64.then(function (base64Data) {
      let validBase64 = base64Data.split(",")[1];
      console.log("通知成功", base64Data)
      // 查看是否有远程文件
      getSha(fullPath, "", function (sha) {
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
          success(data) {
            callback(data)
          },
          error(errInfo) {
            callback(null)
          }
        })
      })
  
    })
  
    //   GET https://api.github.com/repos/18476305640/typora/contents/images HTTP/1.1
    // Authorization: token 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
  
  
    // 没有直接上传
  
    // 有的话，先获取has，再使用has覆盖上传
  
  }
  let getUploadFile = function (fullPath, callback) {
    $.ajax({
      type: 'GET',
      url: `https://raw.githubusercontent.com/${configObj.userAndRepo}/${configObj.branch}${fullPath}?stamp=${new Date().getTime()}`,
  
      success(data) {
        console.log("success:", data)
        callback(data)
      },
      error(errInfo) {
        if (errInfo.status == 403) {
          callback(null)
        } else {
          callback("error")
        }
      }
    })
  }
  // getUploadFile("/github-file-upload/abc.json",function() {
  //   console.log("data===>",data)
  // })
  
  // 多端同步
  function SYNC(callback = () => { }) {
    // 判断远程是否有
    let dataFullName = "/github-file-upload/data.json";
    getUploadFile(dataFullName, function (data) {
      data = JSON.parse(data)
      if (data == null) {
        console.log("同步任务：远程没有")
        // 如果远程没有，需要准备
        LOCAL_GIT_READY(function (isOk) {
          callback(isOk);
        });
  
      } else if (data != "error") {
        console.log("同步任务：远程存在")
        // 远程有，进行同步操作
        let localString = null;
        let local = JSON.parse(localString = localStorage.getItem("data"));
        if ((local == null || local.version == null) && data.version != null) {
          console.log("同步任务：远程 -> 本地")
          // 本地没有。 远程覆盖 -> 本地
          localStorage.setItem("data", JSON.stringify(data))
          callback(true);
          return;
        }
        console.log("同步检查：",(typeof data.version) == "number" && (typeof local.version) == "number")
        if ((typeof data.version) == "number" && (typeof local.version) == "number") {
          // 正式进行双向同步
          console.log("远程:"+data.version ,"本地："+local.version )
          if (data.version > local.version || (data.version == local.version && JSON.stringify(data) != localStorage.getItem("data"))) {
            // 远程 > 本地
            console.log("同步任务：远程 -> 本地")
            localStorage.setItem("data", JSON.stringify(data));
            callback(true);
            return;
          } else if (data.version < local.version) {
            
            console.log("同步任务：远程 <- 本地",data.version , local.version)
            // 远程 < 本地
            coverUpload(dataFullName, StringToTextFile(localString), function (data) {
              if (data != null) {
                callback(true);
              } else {
                callback(false);
              }
            })
          }else if(data.version == local.version){
            callback(true);
          }
        }
  
      }
    })
  
  }
  function LOCAL_GIT_VALID(callback = ()=>{}) {
    // 检查是否有github的配置
    if(localStorage.getItem("config") == null ) {
      callback(false);
      return;
    }
    let default_data = `{
      "version": -1
    }`
    // 本地有效性判断 
    let localData = JSON.parse(localStorage.getItem("data"));
    if (localData == null || (typeof localData.version) != "number") {
      // 本地无效
      console.log("有效性检查：本地无效")
      localStorage.setItem("data", default_data)
    }
    // 远程有效性判断 
    let dataFullName = "/github-file-upload/data.json";
    getUploadFile(dataFullName, function (data) {
      data = JSON.parse(data)
      if (data == null || (typeof data.version) != "number") {
        // 远程无效
        console.log("有效性检查：远程无效")
        let default_data = `{
          "version": -1
        }`
        coverUpload(dataFullName, StringToTextFile(default_data), function (data) {
          if (data != null) {
            callback(true);
          }
        })
      }else {
        callback(true);
      }
    })
  }
  
  // 检测远程是否存在，如果不存在，初始化远程再初始化本地
  function LOCAL_GIT_READY(callback = () => { }) {
    
    LOCAL_GIT_VALID(function () {
      console.log("有效性检查完毕，开始同步")
      // 判断远程是否有
      let dataFullName = "/github-file-upload/data.json";
      getUploadFile(dataFullName, function (data) {
        data = JSON.parse(data)
        if (data == null) {
          console.log("就绪性检查：远程没有")
          // 403远程没有
          let initData = `{
          version: ${new Data().getTime()}
        }`
          coverUpload(dataFullName, StringToTextFile(initData), function (data) {
            if (data != null) {
              // 创建远程文件成功,同时存储到本地
              localStorage.setItem("data", initData)
              callback(true);
              return;
            } else {
              callback(false);
            }
          })
        } else if (data != "error") {
          console.log("就绪性检查：远程有")
          // 远程有，进行同步操作
          SYNC(function (isOk) {
            console.log("同步状态：", isOk)
            callback(isOk);
            return;
          });
        }
      })
    })
  
  }
  function GIT_GET(space, key, callback) {
    LOCAL_GIT_READY(function (isOk) {
      if (isOk) {
        let localData = JSON.parse(localStorage.getItem("data"))
        if (localData != null && localData[space] != null && localData[space][key] != null) {
          callback(localData[space][key])
        } else {
          callback(null)
        }
      } else {
        callback(null)
      }
    })
  }
  
function GIT_SET(space, key, value, callback) {
    LOCAL_GIT_READY(function (isOk) {
      console.log("======ready",isOk)
      if (isOk) {
        let localData = JSON.parse(localStorage.getItem("data"))
        let newLocalData = localData
        if (localData != null && localData[space] == null) {
          // 初始化应用数据
          newLocalData[space] = {}
        } 
        if (localData != null && localData[space] != null) {
          newLocalData[space][key] = value;
        }
        newLocalData.version = new Date().getTime()
        console.log("将要更新到")
        // 更新到本地
        localStorage.setItem("data", JSON.stringify(newLocalData));
        // 更新到远程
        SYNC(function (isOK) {
          if (isOK) {
            console.log("更新到远程成功！")
            callback(true);
          }else {
            // 更新到远程失败，重试
            SYNC()
          }
        });
      }
    });
}

window.LOCAL_GIT_READY = LOCAL_GIT_READY;
window.GIT_GET = GIT_GET;
window.GIT_SET = GIT_SET;
