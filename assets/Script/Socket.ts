// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

// import { Socket } from "socket.io-client";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SocketClass extends cc.Component {
  // @property(cc.Label)
  // label: cc.Label = null;

  // @property
  // text: string = 'hello';

  client: SocketIOClient.Socket = null;

  timer1: number = 0;
  timer2: number = 0;

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    // 设置常驻节点
    cc.game.addPersistRootNode(this.node);
  }

  /**
   * 初始化socket服务
   */
  connect(opts?: any) {
    const token = cc.sys.localStorage.getItem("token");
    if (!token) {
      cc.director.loadScene("login");
      return;
    }
    // loading
    if (!opts || (opts && !opts.noloading)) {
      cc.find("Loading").getComponent("Loading").show("sockconn");
    }
    this.client = io.connect("http://game.stone2020.com?token=" + token);
    if (cc.sys.isNative) {
      (this.client.off as any) = function () {};
    }
    // this.client.removeAllListeners();
    this.client.off("connect");
    this.client.on("connect", () => {
      cc.find("Loading").getComponent("Loading").hide("sockconn");
      // cc.log("sock已连接");
      cc.find("Tip").getComponent("Tip").show("服务器已连接~");
    });
    this.client.off("reconnecting");
    this.client.on("reconnecting", () => {
      cc.find("Loading").getComponent("Loading").show("sockconn");
      // cc.log("sock正在重新连接");
      cc.find("Tip").getComponent("Tip").show("正在重新连接服务器~");
    });
    this.client.off("reconnect");
    this.client.on("reconnect", () => {
      cc.find("Loading").getComponent("Loading").hide("sockconn");
      // cc.log("sock重新连接");
      cc.find("Tip").getComponent("Tip").show("服务器已重新连接~");
    });
    this.client.off("disconnect");
    this.client.on("disconnect", () => {
      cc.find("Loading").getComponent("Loading").show("sockconn");
      // cc.log("sock断开连接");
      cc.find("Tip").getComponent("Tip").show("服务器断开连接~");
      // this.connect();
    });
    this.client.off("error");
    this.client.on("error", () => {
      cc.find("Loading").getComponent("Loading").show("sockconn");
      // cc.log("服务器断开连接！");
      cc.find("Tip").getComponent("Tip").show("服务器异常无法连接~");
      cc.game.restart();
    });

    // 自定义事件
    this.bindEvent();
  }

  /**
   * 发送事件
   */
  // emit(eventName: string, args: any[]) {
  //   // const token = cc.sys.localStorage.getItem("token");
  //   this.client.emit(eventName, ...args);
  // }

  bindEvent() {
    this.client.off("gotoRoom");
    this.client.on("gotoRoom", (roomCode: string) => {
      // cc.log("场景", cc.director.getScene().name, roomCode);
      const nowScene = cc.director.getScene();
      if (nowScene && nowScene.name == "main") {
        if (cc.find("Canvas") && cc.find("Canvas").getComponent("Main")) {
          cc.find("Canvas").getComponent("Main").setRoomStatus("房间准备中...");
          cc.find("Canvas").getComponent("Main").openRoom(null, roomCode);
          cc.find("Tip").getComponent("Tip").show("正在进入房间~");
        }
      }
    });

    // 战斗中
    this.client.off("fightingUpdate");
    this.client.on("fightingUpdate", (dataJson: string) => {
      // cc.log("场景", cc.director.getScene().name, roomCode);
      const nowScene = cc.director.getScene();
      if (nowScene && nowScene.name != "fighting") {
        if (cc.find("Canvas") && cc.find("Canvas").getComponent("Main")) {
          cc.find("Canvas").getComponent("Main").setRoomStatus("战斗中...");
          cc.find("Tip").getComponent("Tip").show("正在进入战斗场地~");
          cc.director.loadScene("fighting");
        }
      }
      // 战斗数据解析
      if (nowScene && nowScene.name == "fighting") {
        try {
          const data = JSON.parse(dataJson);
          cc.find("Canvas").getComponent("Fighting").refresh(data);
        } catch (error) {}
      }
    });

    // 离开房间
    this.client.off("closeRoom");
    this.client.on("closeRoom", (str: string) => {
      if (str == "ok") {
        cc.find("Canvas/room_page").getComponent("Room").close();
        cc.find("Canvas").getComponent("Main").closeRoomStatus();
        cc.find("Tip").getComponent("Tip").show("已离开房间~");
      }
    });

    // 聊天室
    this.client.off("chat");
    this.client.on("chat", (msg: string) => {
      const comp = cc.find("Canvas/chat_page")
        ? cc.find("Canvas/chat_page").getComponent("Chat")
        : 0;
      if (comp) {
        try {
          const arr = JSON.parse(msg);
          arr.reverse();
          comp.render(arr);
          comp.goToBot();
        } catch (error) {}
      }
    });

    // 打造技能
    this.client.off("newHero");
    this.client.on("newHero", (json: string) => {
      try {
        const data = JSON.parse(json);
        cc.find("Loading").getComponent("Loading").hide("herocreating");
        cc.find("Tip").getComponent("Tip").show("创建成功~");
        try {
          cc.find("Canvas/player_guide/mask").getComponent("Guide").nextStep();
        } catch (error) {
          cc.log(error);
        }
        this.timer2 = setTimeout(() => {
          cc.find("Modal")
            .getComponent("Modal")
            .alert({
              content: "英雄创建成功！",
              confirmText: "查看详情",
              closeText: "关闭",
              confirmFn: () => {
                cc.find("Canvas/my_hero_page")
                  .getComponent("MyHero")
                  .openDetail(data.id);
                cc.find("Canvas/hero_create_page")
                  .getComponent("HeroCreate")
                  .close();
              },
              closeFn: () => {
                cc.find("Canvas/hero_create_page")
                  .getComponent("HeroCreate")
                  .close();
                try {
                  cc.find("Canvas/player_guide/mask")
                    .getComponent("Guide")
                    .nextStep();
                } catch (error) {
                  cc.log(error);
                }
              },
            });
        }, 300);
      } catch (error) {}
    });
    this.client.off("newSkill");
    this.client.on("newSkill", (json: string) => {
      try {
        const data = JSON.parse(json);
        cc.find("Loading").getComponent("Loading").hide("skillcreating");
        cc.find("Tip").getComponent("Tip").show("打造成功~");
        try {
          cc.find("Canvas/player_guide/mask").getComponent("Guide").nextStep();
        } catch (error) {
          cc.log(error);
        }
        this.timer1 = setTimeout(() => {
          cc.find("Modal")
            .getComponent("Modal")
            .alert({
              content: "打造成功！",
              confirmText: "查看详情",
              closeText: "关闭",
              confirmFn: () => {
                cc.find("Canvas/my_skill_page")
                  .getComponent("MySkill")
                  .openDetail(data.id);
                cc.find("Canvas/skill_create_page")
                  .getComponent("SkillCreate")
                  .close();
              },
              closeFn: () => {
                cc.find("Canvas/skill_create_page")
                  .getComponent("SkillCreate")
                  .close();
                try {
                  cc.find("Canvas/player_guide/mask")
                    .getComponent("Guide")
                    .nextStep();
                } catch (error) {
                  cc.log(error);
                }
              },
            });
        }, 300);
      } catch (error) {}
    });

    // 小提示
    this.client.off("alert");
    this.client.on("alert", (json: string) => {
      cc.find("Tip").getComponent("Tip").show(json);
    });

    // 房间
    this.client.off("updateRoomInfo");
    this.client.on("updateRoomInfo", (json: string) => {
      const comp = cc.find("Canvas/room_page")
        ? cc.find("Canvas/room_page").getComponent("Room")
        : 0;
      if (comp) {
        try {
          const data = JSON.parse(json);
          comp.roomInfo = data;
          comp.updateLayout();
        } catch (error) {}
      }
    });
    this.client.off("welcome");
    this.client.on("welcome", (json: string) => {
      cc.find("Tip").getComponent("Tip").show(`[ ${json} ] 进入房间~`);
    });
    this.client.off("playerReady");
    this.client.on("playerReady", (json: string) => {
      const comp = cc.find("Canvas/room_page")
        ? cc.find("Canvas/room_page").getComponent("Room")
        : 0;
      if (comp) {
        if (
          comp.roomInfo.playerIndex == 0 &&
          comp.roomInfo.redPlayer.nickname == json
        ) {
          cc.find("Loading").getComponent("Loading").hide("setready");
        }
        if (
          comp.roomInfo.playerIndex == 1 &&
          comp.roomInfo.redPlayer.nickname != json
        ) {
          cc.find("Loading").getComponent("Loading").hide("setready");
        }
        cc.find("Tip").getComponent("Tip").show(`玩家 [ ${json} ] 准备完毕~`);
      }
    });

    // 战斗场景
    // 提示
    this.client.off("tips");
    this.client.on("tips", (json: string) => {
      try {
        const data = JSON.parse(json);
        if (data.msg) {
          cc.find("Tip").getComponent("Tip").show(data.msg);
        }
      } catch (error) {}
    });

    // 移动
    this.client.off("move");
    this.client.on("move", (json: string) => {
      const comp = cc.find("Canvas")
        ? cc.find("Canvas").getComponent("Fighting")
        : 0;
      if (comp) {
        try {
          const data = JSON.parse(json);
          if (data.msg) {
            const heroNode =
              data.action.from == comp.allData.myData.uid
                ? comp.myHeroNode
                : comp.emyHeroNode;
            heroNode.getComponent("Hero").say(data.action.remark);
            // 英雄位移
            // this.moveHero();
            // cc.find("Tip").getComponent("Tip").show(data.msg);
          }
        } catch (error) {}
      }
    });
    // 技能
    this.client.off("useSkill");
    this.client.on("useSkill", (json: string) => {
      const comp = cc.find("Canvas")
        ? cc.find("Canvas").getComponent("Fighting")
        : 0;
      if (comp) {
        try {
          const data = JSON.parse(json);
          comp.useSkill(data);
        } catch (error) {}
      }
    });

    // 读条技能
    this.client.off("reading");
    this.client.on("reading", (json: string) => {
      const comp = cc.find("Canvas")
        ? cc.find("Canvas").getComponent("Fighting")
        : 0;
      if (comp) {
        try {
          const data = JSON.parse(json);
          // {"command":"useSkill","params":["26","37","160","3348359713124352"],"needTime":1601}
          comp.readPercent(data.needTime, () => {
            this.client.emit(data.command, ...data.params);
          });
        } catch (error) {}
      }
    });
    // 游戏结束
    this.client.off("gameover");
    this.client.on("gameover", (json: string) => {
      const comp = cc.find("Canvas")
        ? cc.find("Canvas").getComponent("Fighting")
        : 0;
      if (comp) {
        // cc.find("Tip").getComponent("Tip").show(msg);
        comp.gameover = true;
        // 最后更新一次数据
        comp.updateGame();
        comp.leaveBtn.node.active = true;
        cc.director.preloadScene("main");
        cc.find("Modal")
          .getComponent("Modal")
          .alert({
            content: json,
            confirmText: "离开战场",
            closeText: "我再看看",
            confirmFn: async () => {
              cc.director.loadScene("main");
            },
          });
      }
    });
  }

  getClient() {
    return this.client;
  }

  onDestroy() {
    clearTimeout(this.timer1);
  }

  //   start() {}

  // update (dt) {}
}
