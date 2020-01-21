<template>
    <div class="user-box">
        <div class="user-box-list">
            <Search class="search-box" @showChat="showChat"></Search>
            <div class="group-box">
                <ul class="group-list">
                    <li v-for="group in chatGroupList">
                        <h5 v-on:click="isShowMember(group)">
                            <Icon type="ios-arrow-forward"/>
                            <span>{{ group.departmentName}} </span>
                            <span class="count">({{ group.userCounts}})</span>
                        </h5>
                        <!--群成员列表-->
                  <transition name="fade">
                            <ul class="userList" v-if="group.expansion">
                                <li class="user" v-for="user in userFriends">
                                    <a href="javascript:;" @click="showUser(user)">
                                        <img :src="user.photoPath?urlPrefix+user.photoPath:defaultPhoto">
                                        <b>{{ user.realName }}</b>
                                       <!-- <p>{{ user.realName }}</p>-->
                                    </a>
                                </li>
                            </ul>
                  </transition>
                    </li>
                </ul>
            </div>
        </div>
        <div class="chat-box">
            <Top></Top>
            <Welcome v-if="showLogo"></Welcome>
            <UserInfo class="user-box-view" v-if="!showLogo" v-bind:user="user"></UserInfo>
        </div>
    </div>
</template>
<script>
  import Search from '../components/search.vue';
  import Top from '../components/top.vue';
  import Welcome from '../components/welcome.vue';
  import UserInfo from '../components/userInfo.vue';
  import conf from '../conf';
  import { MessageTargetType } from '../../../utils/ChatUtils';
  const { ChatListUtils } = require('../../../utils/ChatUtils.js');
  import RequestUtils from '../../../utils/RequestUtils';
  export default {
    components: {
      Search,
      Top,
      Welcome,
      UserInfo
    },
    data() {
      return {
        urlPrefix:conf.getFileUrl(),
        chat: {},
        user: {},
        currentUser: {},
        host: conf.getHostUrl(),
        userFriends: [],
        showLogo: true,
        chatGroupList:[],
        requestApi : RequestUtils.getInstance(),
        defaultPhoto: '/static/img/defaultPhoto.png',
      };
    },
    mounted(){
      let that=this;
      that.initData();
    },
    methods: {
      //初始化群组列表
      initData: function() {
        let that=this;
        let params={};
        that.requestApi.request(conf.getAllDepartment(), params).then(res => {
          console.log("通讯录列表",res);
          that.chatGroupList=res.data;
        }).catch(function(error) {
          console.log("群组列表接口触发异常",error);
        });
      },

      isShowMember:function(group){
        let that=this;
        group.expansion = !group.expansion;
        if (group.expansion==false){
          this.showLogo=true;
          return;
        } ;
        let deptId=group.departmentId;
        if (deptId!=null&&deptId>0){
          //根据部门名称后台查询部门人员
          let params={"departmentId":deptId};
          that.requestApi.request(conf.getDeptMembersUrl(), params).then(res => {
            if (res.code==1&&res.data.length>0){
              that.userFriends=res.data;
            }else{
              console.log("该部门暂无人员记录");
              group.expansion=false;
            }
          }).catch(function(error) {
            console.log("群组列表接口触发异常",error);
          });
        } ;
      },
      // 打开一个聊天对话框
      showChat: function(user) {

      },
      // 打开一个用户信息对话框
      showUser: function(user) {
        let self = this;
        self.showLogo = false;
        self.user=user;
        console.log("user:",user);
        return;
        //不显示空白了,显示用户信息
        //后台查询用户信息
  /*      let userId=user.id;
        self.requestApi.request(conf.getUserInfoUrl(), {"userId":userId}).then(res => {
          self.user=res.data;
          self.showLogo = false;
          console.log("user",self.user);
        }).catch(function(error) {
          console.log("查询用户详情触发异常",error);
        });*/
      }
    },
  };
</script>
<style lang="scss" scoped>
    @import '../../../../../static/styles/theme';

    .ivu-tabs-content {
        height: 100%;
    }

    .user-box {
        width: 26rem;
        background-color: $color-light-gray;
        height: 100%;
        display: flex;
        flex-direction: row;

        .chat-box {
            flex: 1;
            background-color: $color-box-bg;
            display: flex;
            flex-direction: column;
            position: relative;

            .user-box-view {
                position: absolute;
                width: 100%;
                top: 40px;
                padding: 100px;
            }
        }

        .user-box-list {
            height: 100%;
            width: 22rem;
            display: flex;
            flex-direction: column;

            .search-box {
                margin: 1.5rem;
                width: 19rem;
            }

            .group-box {
                overflow-y: scroll;
                flex: 1;

                .group-list {
                    margin: 0 1rem;

                    .count {
                        color: #aaaaaa;
                    }

                    li {
                        list-style: none;
                        position: relative;
                        font-size: 1.2rem;
                        cursor: pointer;
                        font-weight: 200;

                        h5 {
                            padding: 0.5rem 0;
                            cursor: pointer;
                            font-size: 1.3rem;
                            font-weight: 200;

                            i {
                                vertical-align: baseline;
                            }
                        }

                        img {
                            width: 4.4rem;
                            height: 4.4rem;
                            border-radius: 50%;
                            position: absolute;
                            top: 0.4rem;
                            left: 2.5rem;
                        }

                        .outline {
                            filter: grayscale(100%);
                        }

                        b {
                            position: absolute;
                            font-size: 1.3rem;
                            left: 7.5rem;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            font-weight: 600;
                            top: 0.6rem;
                        }

                        p {
                            position: absolute;
                            left: 7.5rem;
                            bottom: 0.4rem;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            width: 75%;
                            font-size: 1.1rem;
                            color: #aaaaaa;
                        }
                    }

                    .user {
                        padding-left: 1.3rem;
                        height: 5.2rem;

                        a {
                            display: block;
                            width: 100%;
                            height: 100%;
                            color: $color-default;
                        }
                    }

                    > li:hover {
                        /*background-color: #efefef;*/
                    }

                    > li > ul {
                        /*background-color: #ffffff;*/
                    }

                    li.user:hover {
                        /*background-color: #efefef;*/
                    }
                }
            }
        }

    }
</style>
