//configObj
export default {
  token: "",
  userAndRepo: "",
  branch: "",
  path: "",
  dns: "",
  ...JSON.parse(localStorage.getItem("config")) // 加载配置
}
