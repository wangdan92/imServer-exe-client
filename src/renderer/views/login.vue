<template>
    <div class="login">
        <Top></Top>
        <div class="logo">
            <img src="~@/assets/icon.png" alt="icon">
        </div>
        <div class="login-panel" style="-webkit-app-region: no-drag">
            <div class="title">{{app_name}}</div>
            <Alert v-if="showErr" type="error">{{err}}</Alert>
            <div class="item">
                <label>账号：</label>
                <Input prefix="ios-contact-outline"  ref="username" v-model="username" placeholder="手机/用户名" class="item-input"/>
            </div>
            <div class="item">
                <label>密码：</label>
                <Input prefix="ios-lock-outline" ref="password" type="password" v-model="password" placeholder="密码"
                       class="item-input" @on-enter="quickLogin"/>
            </div>
            <div class="btn item">
                <Button type="primary" @click="login()"  :loading="loginLoading" icon="md-contact">登录</Button>
            </div>
        </div>

        <vue-particles color="#dedede" :particlesNumber="50" class="bg-login"></vue-particles>
    </div>
</template>

<script>
  import Top from './im/components/top.vue';
  import conf from './im/conf';
  import RequestUtils from '../utils/RequestUtils';
  import StoreUtils from '../utils/StoreUtils';
  import { ChatListUtils } from '../utils/ChatUtils';
  import { ErrorType } from '../utils/ChatUtils';

  export default {
    name: 'login',
    data() {
      return {
        oaToken:'',
        loginLoading:false,
        app_name: conf.app_name,
        username: '',
        password: '',
        registerPhone: '',
        registerUsername: '',
        registerPassword: '',
        err: '',
        showErr: false,
        showSetting: false,
        showRegister: false
      };
    },
    components: {
      Top
    },
    methods: {
      //刷新
      clickUser() {
        location.reload();
      },
      //提示错误
      showError(errorMsg){
        let that=this;
        if (errorMsg==null||errorMsg.length<1){
           errorMsg="登录有误,失败!";
        } ;
        that.showErr = true;
        that.err=errorMsg;
        setTimeout(function() {
          that.showErr = false;
          that.err="";
        },3000);
        return;
      },
      //登录
      login: function() {
        let that = this;
        if (that.username.trim().length<1){
          //this.$Message.error('用户名不能为空!');
          that.showError("用户名不能为空!");
          that.$refs.username.focus();
          return;
        } ;
        if (that.password.trim().length<1){
          //this.$Message.error('密码不能为空');
          that.showError("密码不能为空!");
          that.$refs.password.focus();
          return;
        } ;
        that.loginLoading=true;
        let requestApi = RequestUtils.getInstance();
        requestApi.login(that.username.trim(), that.password.trim()).then(res => {
              if(res.code==0||res.data==null){
                that.showError(res.msg);
                that.loginLoading=false;
                return;
              }
            // 将当前登录用户的token存入到本地sessionLocalStorage
            if (res.data.token!=null&&res.data.token!=undefined) {
                StoreUtils.setToken(res.data.token);
            };
            //将个人信息存入到全局状态管理中
              StoreUtils.setUser(res.data.userInfo);
              that.$store.commit('setUser', res.data.userInfo);
              ChatListUtils.initChatList(that, res.data.userInfo.id);
              setTimeout(function() {
                that.loginLoading=false;
                that.$router.push({
                  path: '/index/chatBox',
                  params: {}
                });
              },1000)
         }).catch(function(error) {
            console.log("登录异常信息",error);
            that.showErr = true;
            if (ErrorType.NET_ERROR === error.toString()) {
              that.err = '服务通讯失败，请检查服务设置';
            } else {
              that.err = error.toString();
            }
          });
        if (that.loginLoading){
            setTimeout(function() {
                that.loginLoading=false;
            },5000)
        } ;
        },

      quickLogin:function() {
        let that=this;
        that.login();
      },

      loginByToken:function(token) {
        let that=this;
        if (token==null||token==undefined||token.length<1){
              that.showErr = true;
              that.err ="自动登录凭证失效!";
              return;
        } ;
        console.log("token:",token);
        StoreUtils.setToken(token);
        that.loginLoading=true;
        let requestApi = RequestUtils.getInstance();
         requestApi.request(conf.loginByTokenUrl(), {"token":token}).then(res => {
          if(res.code==0||res.data==null){
            that.showError(res.msg);
            that.loginLoading=false;
            return;
          }
          // 将当前登录用户的token存入到本地sessionLocalStorage
          if (res.data.token!=null&&res.data.token!=undefined) {
            StoreUtils.setToken(res.data.token);
          };
          //将个人信息存入到全局状态管理中
          StoreUtils.setUser(res.data.userInfo);
          that.$store.commit('setUser', res.data.userInfo);
          ChatListUtils.initChatList(that, res.data.userInfo.id);
          setTimeout(function() {
            that.loginLoading=false;
            that.$router.push({
              path: '/index/chatBox',
              params: {}
            });
          },1000)
        }).catch(function(error) {
          console.log("登录异常信息",error);
          that.showErr = true;
          if (ErrorType.NET_ERROR === error.toString()) {
            that.err = '服务通讯失败，请检查服务设置';
          } else {
            that.err = error.toString();
          }
          setTimeout(function() {
              that.loginLoading=false;
              that.showErr=false;
              that.err="";
            },3000);
        });
      },

      oaStartApp: function() {
            let that = this;
            let param = that.$electron.remote.process.argv;
            let token="";
            console.log("params:",JSON.stringify(param));
            if (param.length>1){
                let oaToken=param[param.length-1];
                token=oaToken.substr(oaToken.indexOf("=")+1,oaToken.length-1);
                that.loginByToken(token);
                return;
            }else{
                 token=StoreUtils.getToken();
                 that.loginByToken(token);
                 return;
            }
        }
    },
    mounted() {
      let isNotAutoLogin = this.$route.query.isNotAutoLogin;
      if (isNotAutoLogin == null || isNotAutoLogin == false || isNotAutoLogin == undefined) {
        this.oaStartApp();
      }
    }
  };
</script>

<style lang="scss" scoped>
    @import "../../../static/styles/theme.scss";

    .login {
        height: 100%;
        background: url("../assets/bg.png") no-repeat;
        background-size: 100% 100%;
        position: relative;

        .bg-login {
            height: 100%;
            position: absolute;
            top: 0;
            width: 100%;
            z-index: 1;
        }

        .logo {
            width: 33rem;
            height: 100%;
            display: flex;
            justify-content: center;
            flex-direction: column;
            text-align: center;
        }

        .logo > img {
            width: 10rem;
            height: 10rem;
            margin-left: 15rem;
        }

        .login-panel {
            width: 33rem;
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 2rem 3rem 3rem 3rem;
            position: absolute;
            right: 8rem;
            top: 12rem;
            z-index: 2;
            box-shadow: 0 0 5px 3px rgba(186, 186, 186, 0.3);

            .item {
                margin-top: 2rem;

                label {
                    width: 5rem;
                    text-align: right;
                    display: inline-block;
                }

                .item-input {
                    width: auto !important;
                }
            }

            .btn {
                text-align: center;

                button {
                    width: 86%;
                }
            }

            .title {
                color: $color-default;
                font-size: 20px;
                font-weight: bold;
                text-align: center;
            }
        }

        .setting {
            color: #fff;
            font-size: 2rem;
            display: block;
            right: 1rem;
            position: absolute;
            bottom: 1rem;
            cursor: pointer;
            z-index: 3;
        }

        .save-setting-btn {
            margin: 1rem 0 !important;
        }

        .register {
            padding: 0 2.2rem;
            a{
                color: #ffffff;
                i{
                    font-size: 14px;
                    letter-spacing: 5px;
                }
            }
        }
    }

    .setting-item {
        margin-bottom: 1rem;

        .ivu-input {
            border: 1px solid #84eeba !important;
            background-color: #2baee9;
        }
    }
</style>
