//configObj
export default {
  token: "",
  userAndRepo: "",
  branch: "",
  path: "",
  ...JSON.parse(localStorage.getItem("config")) // 加载配置
}
