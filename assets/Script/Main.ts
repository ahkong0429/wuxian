// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainClass extends cc.Component {
  // 顶部用户数据
  @property(cc.EditBox)
  nicknameNode: cc.EditBox = null;
  @property(cc.EditBox)
  uuidNode: cc.EditBox = null;
  @property(cc.EditBox)
  levelNode: cc.EditBox = null;
  // 用户第一栏
  @property(cc.Label)
  scoreNode: cc.Label = null;
  @property(cc.Label)
  balanceNode: cc.Label = null;
  @property(cc.Label)
  winperNode: cc.Label = null;
  // 用户第二栏
  @property(cc.Label)
  heroNode: cc.Label = null;
  @property(cc.Label)
  skillNode: cc.Label = null;
  @property(cc.Label)
  fightNode: cc.Label = null;
  // 用户第三栏
  @property(cc.Label)
  vipNode: cc.Label = null;
  @property(cc.Label)
  superNode: cc.Label = null;
  @property(cc.Label)
  luckNode: cc.Label = null;
  // rank分
  @property(cc.Label)
  rankNode: cc.Label = null;

  // 用户数据对象
  user: any = null;

  // 签到
  @property(cc.Button)
  qdBtn: cc.Button = null;

  // 菜单栏
  @property(cc.Node)
  menuBoxNode: cc.Node = null;
  @property(cc.Node)
  shopMenu: cc.Node = null;

  // 房间状态栏
  @property(cc.Node)
  roomStatusNode: cc.Node = null;
  @property(cc.Label)
  roomStatusTxt: cc.Label = null;

  // 当前房间号
  roomCode: string = null;

  // @property
  // text: string = 'hello';

  // LIFE-CYCLE CALLBACKS:

  async onLoad() {
    //   菜单布局调整
    const cellWidth = (cc.winSize.width - 50 - 38 * 2 - 40 * 3) / 4;
    this.menuBoxNode.getComponent(cc.Layout).cellSize.width = cellWidth;

    // 版本号检测
    try {
      const version = await cc
        .find("Network")
        .getComponent("Network")
        .request({ name: "version" });
      if (version && typeof version == "string") {
        const lastVersion = cc.sys.localStorage.getItem("version");
        if (lastVersion && lastVersion != version) {
          cc.find("Modal")
            .getComponent("Modal")
            .alert({
              content: `当前客户端版本v${lastVersion}\r\n最新版本v${version}\r\n请及时更新到最新版客户端`,
              hideClose: true,
            });
        }
        if (!lastVersion) {
          cc.sys.localStorage.setItem("version", version);
        }
      }
    } catch (error) {
      cc.find("Modal")
        .getComponent("Modal")
        .alert({
          content: `网络异常，请尝试重新载入`,
          hideClose: true,
          confirmFn: () => {
            cc.game.restart();
          },
        });
      return;
    }

    //   加载用户数据
    await this.reloadUserInfo();

    // 连接通信
    cc.find("Socket").getComponent("Socket").connect({ noloading: true });

    // 新手引导，通过本地缓存和用户英雄数量技能数量判断
    this.newPlayerGuide();

    // 预加载其他场景
    cc.director.preloadScene("fighting");
  }

  // 新手引导，通过本地缓存和用户英雄数量技能数量判断
  newPlayerGuide() {
    const haveCache = cc.sys.localStorage.getItem("pGuide");
    if ((this.user.heronum > 0 && this.user.skillnum > 0) || haveCache) {
      // cc.log("退出新手指导");
      return;
    }
    // 进入引导过程
    cc.find("Modal")
      .getComponent("Modal")
      .alert({
        content: "需要新手指导吗？",
        confirmText: "我是新手",
        confirmFn: () => {
          cc.find("Canvas/player_guide/mask").getComponent("Guide").guide();
        },
        closeText: "我是高手",
        closeFn: () => {
          cc.sys.localStorage.setItem("pGuide", "1");
        },
      });
  }

  async reloadUserInfo(noloading?: boolean) {
    await this.userPerson(noloading);
    // 签到按钮状态
    if (this.user.qdstatus && this.qdBtn) {
      this.qdBtn.interactable = false;
    }
  }

  // 查询用户信息
  async userPerson(noloading?: boolean) {
    try {
      const res = await cc
        .find("Network")
        .getComponent("Network")
        .request({ name: "userperson", noloading: noloading });
      cc.log("用户信息", res);
      this.user = res;
      this.nicknameNode.string = res.nickname;
      this.uuidNode.string = `玩家编号：${res.uid}`;
      this.levelNode.string = `LV ${res.level} ${res.rankName}斗士`;

      this.scoreNode.string = res.score;
      this.balanceNode.string = res.balance;
      this.winperNode.string = `${Number(res.winPercent.toFixed(1))}%`;

      this.heroNode.string = res.heronum;
      this.skillNode.string = res.skillnum;
      this.fightNode.string = res.total;

      this.vipNode.string = res.vipStatus == 1 ? res.vipEndTime : "无";
      this.superNode.string = res.superStatus == 1 ? res.superEndTime : "无";
      this.luckNode.string = res.lucky == 1 ? "有" : "无";

      this.rankNode.string = res.rank;
    } catch (error) {
      cc.find("Tip").getComponent("Tip").show("读取玩家数据异常~");
    }
  }

  // 修改昵称
  async editNickName() {
    cc.find("Modal")
      .getComponent("Modal")
      .alert({
        content: "确定要修改昵称吗？\r\n（格式：2-6位中文）",
        confirmFn: () => {
          this.nicknameNode.enabled = true;
          this.nicknameNode.focus();
        },
        closeFn: () => {
          this.nicknameNode.enabled = false;
          this.nicknameNode.blur();
        },
      });
  }
  async editNickNameDone() {
    this.nicknameNode.enabled = false;
    this.nicknameNode.blur();
    try {
      await cc
        .find("Network")
        .getComponent("Network")
        .request({
          name: "personUpdate",
          data: { nickname: this.nicknameNode.string },
        });
      await this.reloadUserInfo();
    } catch (error) {
      cc.find("Tip").getComponent("Tip").show("昵称未改变~");
    }
  }

  // 加持祝福状态
  async useItem(event: any, ItemId: string) {
    try {
      await cc
        .find("Network")
        .getComponent("Network")
        .request({
          name: "itemuse",
          data: { id: Number(ItemId) },
        });
      cc.find("Tip").getComponent("Tip").show("祝福成功，快去强化吧~");
      await this.reloadUserInfo();
    } catch (error) {}
  }

  //   签到
  async qiandao() {
    try {
      await cc.find("Network").getComponent("Network").request({
        name: "qiandao",
      });
      cc.find("Tip").getComponent("Tip").show("签到成功，奖励已发放~");
      await this.reloadUserInfo();
    } catch (error) {}
  }

  //   注销
  async signout() {
    cc.find("Modal")
      .getComponent("Modal")
      .alert({
        content:
          "确定要注销当前账号吗？\r\n（试玩账号登录用户名是玩家编号\r\n密码默认123456）",
        confirmFn: async () => {
          try {
            await cc.find("Network").getComponent("Network").request({
              name: "signout",
            });
            cc.sys.localStorage.removeItem("token");
            cc.find("Socket")
              .getComponent("Socket")
              .getClient()
              .removeAllListeners();
            cc.find("Tip").getComponent("Tip").show("已注销当前登录账号~");
            cc.director.loadScene("login");
          } catch (error) {}
        },
      });
  }

  // 设置房间状态
  setRoomStatus(txt: string) {
    this.roomStatusNode.active = true;
    this.roomStatusTxt.string = txt;
  }
  closeRoomStatus() {
    this.roomStatusNode.active = false;
  }
  // 打开房间
  openRoom(event: any, roomCode?: string) {
    if (roomCode) {
      this.roomCode = roomCode;
    }
    cc.find("Canvas")
      .getChildByName("room_page")
      .getComponent("Room")
      .open(this.roomCode);
  }

  // 安全设置
  setPassword() {
    cc.find("Modal")
      .getComponent("Modal")
      .alert({
        inputMode: true,
        title: "请输入新密码",
        confirmFn: async (newpassword: string) => {
          try {
            await cc
              .find("Network")
              .getComponent("Network")
              .request({
                name: "userupdateInfo",
                data: { passowrd: newpassword },
              });
            cc.find("Tip").getComponent("Tip").show("设置成功~");
          } catch (error) {}
        },
      });
  }
  //   start() {}
  // update (dt) {}
}
