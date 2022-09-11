function urlFormat (url, format = "md", describe = "") {
  // 如果是压缩文件
  if (url.indexOf(".zip") >= 0) {
    return url
  }

  switch (format) {
    case "md":
      return `![${describe}](${url})`
      break
    default:
      return url
  }
}