class StoreUtils {
  //本地缓存存入json数据
  static setJson(key,json){
    sessionStorage.setItem(key,JSON.stringify(json));
  }
  //本地缓存获取对应的json数据
  static getJson(key){
    if(!key) {
      return null;
    }
    return JSON.parse(sessionStorage.getItem(key));
  }
  //本地缓存存入字符串
  static setValue(key,value){
    sessionStorage.setItem(key,value)
  }
//本地缓存获取字符串
  static getValue(key){
    return sessionStorage.getItem(key);
  }
  //本地缓存存入token
  static setToken(token){
    return StoreUtils.setValue("token",token);
  }
  //本地缓存获取token
  static getToken(){
    return StoreUtils.getValue("token");
  }
  //本地缓存存入用户信息
  static setUser(user){
    return StoreUtils.setJson("user",user);
  }
//本地缓存获取用户信息
  static getUser(){
    return StoreUtils.getJson("user");
  }
}

export default StoreUtils;
