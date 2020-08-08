// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class FightingClass extends cc.Component {
  @property(cc.Node)
  myHeroBox: cc.Node = null;
  @property(cc.Node)
  myHeroNode: cc.Node = null;
  @property(cc.Node)
  emyHeroBox: cc.Node = null;
  @property(cc.Node)
  emyHeroNode: cc.Node = null;

  @property(cc.Label)
  myHeroName: cc.Label = null;
  @property(cc.Label)
  emyHeroName: cc.Label = null;

  // 全部数据
  allData: any = null;
  // 初始化
  inited: boolean = false;
  // 客户端
  client: SocketIOClient.Socket = null;
  // 时间信息
  @property(cc.Label)
  timeInfoNode: cc.Label = null;

  // 位置信息
  distanceMap: any = null;

  // 生命值信息
  @property(cc.Node)
  statusBoxNode: cc.Node = null;

  // buff容器
  @property(cc.Node)
  myBuffBox: cc.Node = null;
  @property(cc.Node)
  emyBuffBox: cc.Node = null;
  // buff预置
  @property(cc.Prefab)
  buffPref: cc.Prefab = null;
  // 已存在的buff列表
  myBuffList: any[] = [];
  emyBuffList: any[] = [];
  // 已存在的buff节点列表
  myBuffNodeList: cc.Node[] = [];
  emyBuffNodeList: cc.Node[] = [];

  // 技能容器
  @property(cc.Node)
  skillBox: cc.Node = null;
  // 技能预置
  @property(cc.Prefab)
  skillPref: cc.Prefab = null;
  mySkillList: any[] = [];
  mySkillNodeList: cc.Node[] = [];

  // 计时器
  counter: any = null;
  maxTime: number = 0;
  countTime: number = 0;
  countSkillTimer: number = 0;
  // 读条界面
  @property(cc.Node)
  readingBox: cc.Node = null;

  // 游戏结束
  gameover: boolean = false;
  // 离开场景
  @property(cc.Button)
  leaveBtn: cc.Button = null;

  // 文字效果
  @property(cc.Node)
  myEffectNode: cc.Node = null;
  @property(cc.Node)
  emyEffectNode: cc.Node = null;
  @property(cc.Prefab)
  effectPref: cc.Prefab = null;

  // 做队列漂浮文字
  myEffectQueue: any[] = [];
  emyEffectQueue: any[] = [];

  // 战斗记录
  records: any[] = [];
  @property(cc.Node)
  recordBox: cc.Node = null;
  @property(cc.Prefab)
  ftPref: cc.Prefab = null;

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    // 初始化
    this.distanceMap = {
      1: "近距离",
      2: "中距离",
      3: "远距离",
      4: "超远距离",
    };
    this.counter = {
      dt: 0,
      ms: 0,
      delayactionTimer: 0,
      queue: 0,
    };
    this.leaveBtn.node.active = false;
    // this.initHero("icebear", "slim");
    // 开启碰撞检测
    // const manager = cc.director.getCollisionManager();
    // manager.enabled = true;
    // 连接通信
    cc.find("Socket").getComponent("Socket").connect({ noloading: true });
    this.client = cc.find("Socket").getComponent("Socket").getClient();
  }

  initHero() {
    if (this.inited) {
      return;
    }

    // 我方英雄形象
    const myKey = this.allData.myData.race;
    const myRes = cc.find("Icon").getComponent("Iconmap").getBoneAsset(myKey);
    this.myHeroNode.setScale(-myRes.Scale, Math.abs(myRes.Scale));
    // cc.tween(this.myHeroNode).then(cc.flipX(true)).start();
    this.myHeroNode.getComponent(dragonBones.ArmatureDisplay).dragonAsset =
      myRes.Asset;
    this.myHeroNode.getComponent(dragonBones.ArmatureDisplay).dragonAtlasAsset =
      myRes.AtlasAsset;
    this.myHeroNode.getComponent(dragonBones.ArmatureDisplay).armatureName =
      myRes.Name;
    this.myHeroNode
      .getComponent(dragonBones.ArmatureDisplay)
      .playAnimation("Idle", 0);
    this.myHeroNode.getComponent("Hero").init(myKey, 0);
    cc.log("我方", myKey, myRes);

    // 敌方英雄形象
    const emyKey = this.allData.emyData.IsBoss
      ? this.allData.emyData.uid
      : this.allData.emyData.race;
    const emyRes = cc.find("Icon").getComponent("Iconmap").getBoneAsset(emyKey);
    this.emyHeroNode.setScale(emyRes.Scale, emyRes.Scale);
    this.emyHeroNode.getComponent(dragonBones.ArmatureDisplay).dragonAsset =
      emyRes.Asset;
    this.emyHeroNode.getComponent(
      dragonBones.ArmatureDisplay
    ).dragonAtlasAsset = emyRes.AtlasAsset;
    this.emyHeroNode.getComponent(dragonBones.ArmatureDisplay).armatureName =
      emyRes.Name;
    this.emyHeroNode
      .getComponent(dragonBones.ArmatureDisplay)
      .playAnimation("Idle", 0);
    this.emyHeroNode.getComponent("Hero").init(emyKey, 1);
    cc.log("敌方", emyKey, emyRes);

    // 名称
    this.myHeroName.string = `${this.allData.myData.name} + ${this.allData.myData.lv}`;
    this.emyHeroName.string = `${this.allData.emyData.name} + ${
      this.allData.emyData.IsBoss
        ? this.allData.emyData.fblv
        : this.allData.emyData.lv
    }`;

    // 入场
    // this.moveHero();
    this.inited = true;
  }

  // 刷新战斗数据
  refresh(data: any) {
    this.allData = data;
    cc.log(this.allData);
    // 初始化英雄
    this.initHero();
  }

  pushEffectQueue(data: { funName: string; text: string; isMine: boolean }) {
    if (data.isMine) {
      this.myEffectQueue.push(data);
    } else {
      this.emyEffectQueue.push(data);
    }
  }
  solveMyEffectQueue() {
    if (this.myEffectQueue.length > 0) {
      const data = this.myEffectQueue[0];
      this.myEffectQueue.splice(0, 1);
      const node = cc.instantiate(this.effectPref);
      node.getComponent("Effect")[data.funName](data.text);
      this.myEffectNode.addChild(node);
    }
  }
  solveEmyEffectQueue() {
    if (this.emyEffectQueue.length > 0) {
      const data = this.emyEffectQueue[0];
      this.emyEffectQueue.splice(0, 1);
      const node = cc.instantiate(this.effectPref);
      node.getComponent("Effect")[data.funName](data.text);
      this.emyEffectNode.addChild(node);
    }
  }

  moveHero() {
    if (this.allData) {
      // 初始定位
      const distance = this.allData.myData.distance;
      const unit = (cc.winSize.width - 580) / 6;
      const map = {
        1: 50,
        2: unit * 1 + 50,
        3: unit * 2 + 50,
        4: unit * 3 + 50,
      };
      cc.tween(this.emyHeroBox).to(0.7, { x: map[distance] }).start();
      cc.tween(this.myHeroBox).to(0.7, { x: -map[distance] }).start();
    }
  }

  updateTimeInfo() {
    if (this.allData) {
      this.timeInfoNode.getComponent(cc.Label).string = `战斗时长 [ ${
        this.allData.timediff
      } ] 当前距离 [ ${this.distanceMap[this.allData.myData.distance]} ] `;
    }
  }

  updatePlayerStatus() {
    if (this.allData) {
      const myBox = this.statusBoxNode.getChildByName("my_status");
      myBox
        .getChildByName("hp")
        .getChildByName("text")
        .getComponent(cc.Label).string = `生命值 ${this.allData.myData.hp}`;
      myBox
        .getChildByName("mp")
        .getChildByName("text")
        .getComponent(cc.Label).string = `法力值 ${this.allData.myData.mp}`;
      myBox
        .getChildByName("sp")
        .getChildByName("text")
        .getComponent(cc.Label).string = `怒气值 ${this.allData.myData.sp}`;

      const emyBox = this.statusBoxNode.getChildByName("emy_status");
      emyBox
        .getChildByName("hp")
        .getChildByName("text")
        .getComponent(cc.Label).string = `生命值 ${this.allData.emyData.hp}`;
      emyBox
        .getChildByName("mp")
        .getChildByName("text")
        .getComponent(cc.Label).string = `法力值 ${this.allData.emyData.mp}`;
      emyBox
        .getChildByName("sp")
        .getChildByName("text")
        .getComponent(cc.Label).string = `怒气值 ${this.allData.emyData.sp}`;
    }
  }

  updateBuff() {
    if (this.allData) {
      const mybuffs = this.allData.myData.buffs;
      const emybuffs = this.allData.emyData.buffs;
      if (mybuffs.length == 0) {
        this.myBuffList = [];
        this.myBuffBox.destroyAllChildren();
      }
      if (emybuffs.length == 0) {
        this.emyBuffList = [];
        this.emyBuffBox.destroyAllChildren();
      }
      for (const key in mybuffs) {
        const buff = mybuffs[key];
        // 是否存在
        const have = this.myBuffList.findIndex((value, index, obj) => {
          return obj[index].sku == buff.sku;
        });
        if (have == -1) {
          // this.myBuffList.push(buff);
          this.myBuffList.unshift(buff);
          // 拷贝节点
          const buffNode = cc.instantiate(this.buffPref);
          buffNode
            .getChildByName("info_text")
            .getComponent(cc.Label).string = `${buff.name} ${
            buff.unlimited ? "" : `[ ${Math.round(buff.time)}s ]`
          }\r\n${buff.remark}`;
          this.myBuffBox.insertChild(buffNode, 0);
          // buffNode.parent = this.myBuffBox;
          buffNode.active = true;
          // this.myBuffNodeList.push(buffNode);
          this.myBuffNodeList.unshift(buffNode);
        } else {
          if (!buff.unlimited && buff.time < 1) {
            this.myBuffNodeList[have].removeFromParent();
            this.myBuffNodeList[have].destroy();
            this.myBuffList.splice(have, 1);
            this.myBuffNodeList.splice(have, 1);
          } else {
            this.myBuffNodeList[have]
              .getChildByName("info_text")
              .getComponent(cc.Label).string = `${buff.name} ${
              buff.unlimited ? "" : `[ ${Math.round(buff.time)}s ]`
            }\r\n${buff.remark}`;
          }
        }
      }
      for (const key in emybuffs) {
        const buff = emybuffs[key];
        // 是否存在
        const have = this.emyBuffList.findIndex((value, index, obj) => {
          return obj[index].sku == buff.sku;
        });
        if (have == -1) {
          this.emyBuffList.unshift(buff);
          // 拷贝节点
          const buffNode = cc.instantiate(this.buffPref);
          buffNode
            .getChildByName("info_text")
            .getComponent(cc.Label).string = `${buff.name} ${
            buff.unlimited ? "" : `[ ${Math.round(buff.time)}s ]`
          }\r\n${buff.remark}`;
          // buffNode.parent = this.emyBuffBox;
          this.emyBuffBox.insertChild(buffNode, 0);
          buffNode.active = true;
          this.emyBuffNodeList.unshift(buffNode);
        } else {
          if (!buff.unlimited && buff.time < 1) {
            this.emyBuffNodeList[have].removeFromParent();
            this.emyBuffNodeList[have].destroy();
            this.emyBuffList.splice(have, 1);
            this.emyBuffNodeList.splice(have, 1);
          } else {
            this.emyBuffNodeList[have]
              .getChildByName("info_text")
              .getComponent(cc.Label).string = `${buff.name} ${
              buff.unlimited ? "" : `[ ${Math.round(buff.time)}s ]`
            }\r\n${buff.remark}`;
          }
        }
      }
      for (const key in this.myBuffList) {
        const buff = this.myBuffList[key];
        const have = mybuffs.findIndex((value, index, obj) => {
          return obj[index].sku == buff.sku;
        });
        if (have == -1) {
          this.myBuffNodeList[key].removeFromParent();
          this.myBuffNodeList[key].destroy();
          this.myBuffList.splice(Number(key), 1);
          this.myBuffNodeList.splice(Number(key), 1);
        }
      }
      for (const key in this.emyBuffList) {
        const buff = this.emyBuffList[key];
        const have = emybuffs.findIndex((value, index, obj) => {
          return obj[index].sku == buff.sku;
        });
        if (have == -1) {
          this.emyBuffNodeList[key].removeFromParent();
          this.emyBuffNodeList[key].destroy();
          this.emyBuffList.splice(Number(key), 1);
          this.emyBuffNodeList.splice(Number(key), 1);
        }
      }
    }
  }

  useSkill(data: any) {
    if (data.action) {
      const action = data.action;
      cc.log("使用技能描述", action);
      const heroNode =
        action.from == this.allData.myData.uid
          ? this.myHeroNode
          : this.emyHeroNode;
      const anotherHeroNode =
        action.from == this.allData.myData.uid
          ? this.emyHeroNode
          : this.myHeroNode;
      // 施法方英雄报技能名称
      heroNode.getComponent("Hero").say(action.name);
      // heroNode.getComponent("Hero").skill();
      // 插入战斗播报
      // cc.find("Tip").getComponent("Tip").show(data.msg);
      this.records.push(data);
      this.pushRecord(data);
      // 漂浮文字效果
      // 消耗
      this.pushEffectQueue({
        funName: "showSpend",
        text: action.spendremark,
        isMine: action.from == this.allData.myData.uid,
      });
      // 给自己加状态
      if (action.target == 1) {
        // 技能动作
        heroNode.getComponent("Hero").skill();
        // 飘字
        if (action.type == 1) {
          this.pushEffectQueue({
            funName: "showHeal",
            text: action.remark + (action.buff ? ` [ ${action.buff} ]` : ""),
            isMine: action.from == this.allData.myData.uid,
          });
        }
        if (action.type == 2) {
          this.pushEffectQueue({
            funName: "showDamage",
            text: action.remark + (action.buff ? ` [ ${action.buff} ]` : ""),
            isMine: action.from == this.allData.myData.uid,
          });
        }
      }
      // 对敌方造成伤害
      if (action.target == 2) {
        // 攻击动作
        heroNode.getComponent("Hero").attack();
        // 受伤动作
        this.counter.delayactionTimer = setTimeout(() => {
          anotherHeroNode.getComponent("Hero").damage();
        }, 600);
        if (action.type == 1) {
          this.pushEffectQueue({
            funName: "showHeal",
            text:
              action.remark +
              (action.buff ? ` [ ${action.buff} ]` : "") +
              (action.bao ? ` [ 暴击! ]` : ""),
            isMine: action.from != this.allData.myData.uid,
          });
        }
        if (action.type == 2) {
          // 飘字
          this.pushEffectQueue({
            funName: "showDamage",
            text:
              action.remark +
              (action.buff ? ` [ ${action.buff} ]` : "") +
              (action.bao ? ` [ 暴击! ]` : ""),
            isMine: action.from != this.allData.myData.uid,
          });
          // 反伤
          if (action.fan > 0) {
            this.pushEffectQueue({
              funName: "showDamage",
              text: `反弹伤害 减少 ${action.fan} 生命值`,
              isMine: action.from == this.allData.myData.uid,
            });
          }
        }
        // 吸血吸蓝
        if (action.xixue > 0) {
          this.pushEffectQueue({
            funName: "showHeal",
            text: `吸取 ${action.xixue} 生命值`,
            isMine: action.from == this.allData.myData.uid,
          });
        }
        if (action.xilan > 0) {
          this.pushEffectQueue({
            funName: "showHeal",
            text: `吸取 ${action.xixue} 法力值`,
            isMine: action.from == this.allData.myData.uid,
          });
        }
      }
    }
  }

  updateSkill() {
    if (this.allData) {
      const myskills = this.allData.myData.skills;
      for (const key in myskills) {
        const skill = myskills[key];
        if (skill.id != 999999 && skill.type != 9) {
          // 是否存在
          const have = this.mySkillList.findIndex((value, index, obj) => {
            return obj[index].id == skill.id;
          });
          if (have == -1) {
            this.mySkillList.push(skill);
            // 拷贝节点
            const cloneNode = cc.instantiate(this.skillPref);
            cloneNode
              .getChildByName("Background")
              .getChildByName("Label")
              .getComponent(cc.Label).string = `${skill.name} ${Number(
              (skill.need / 1000).toFixed(2)
            )}s\r\n${skill.spend}\r\n${skill.remark}`;
            // 添加点击事件
            const clickEventHandler = new cc.Component.EventHandler();
            clickEventHandler.target = cc
              .find("Canvas")
              .getComponent("Fighting");
            clickEventHandler.component = "Fighting";
            clickEventHandler.handler = "playerUseSkill";
            clickEventHandler.customEventData = skill.id;
            cloneNode
              .getComponent(cc.Button)
              .clickEvents.push(clickEventHandler);
            // 加载节点
            cloneNode.parent = this.skillBox;
            cloneNode.active = true;
            this.mySkillNodeList.push(cloneNode);
          } else {
            // 更新冷却时间
            // cc.log("更新技能", have);
            this.mySkillList[have].cold = skill.cold;
            const node = this.mySkillNodeList[have];
            if (skill.cold > 0) {
              node
                .getChildByName("mask")
                .getChildByName("time")
                .getComponent(cc.Label).string = `${Math.ceil(skill.cold)}s`;
              node.getChildByName("mask").active = true;
            } else {
              node.getChildByName("mask").active = false;
              node.getComponent(cc.Button).interactable = true;
            }
          }
        }
        // 移动类
        if (skill.type == 9) {
          const moveUpNode = cc.find("Canvas/control/moveup");
          const moveBackNode = cc.find("Canvas/control/moveback");
          let node = skill.code == "mu" ? moveUpNode : moveBackNode;
          if (skill.cold > 0) {
            node
              .getChildByName("mask")
              .getChildByName("time")
              .getComponent(cc.Label).string = `${Math.ceil(skill.cold)}s`;
            node.getChildByName("mask").active = true;
          } else {
            node.getChildByName("mask").active = false;
            node.getComponent(cc.Button).interactable = true;
          }
        }
      }
    }
  }

  loseGame() {
    if (this.gameover) {
      return;
    }
    cc.find("Modal")
      .getComponent("Modal")
      .alert({
        content: "确定要投降？",
        confirmFn: async () => {
          try {
            // useSkill
            this.playerUseSkill(null, "999999");
            cc.find("Tip")
              .getComponent("Tip")
              .show("胜败乃兵家常事，不要气馁，再接再厉~");
          } catch (error) {}
        },
      });
  }

  leaveGame() {
    this.client.disconnect();
    cc.director.loadScene("main");
  }

  playerUseSkill(event: any, skill_id: string) {
    if (this.gameover) {
      return;
    }
    if (event) {
      const node: cc.Node = event.target;
      // node
      //   .getChildByName("mask")
      //   .getChildByName("time")
      //   .getComponent(cc.Label).string = "";
      // node.getChildByName("mask").active = true;
      node.getComponent(cc.Button).interactable = false;
      // cc.log("按钮", event);
    }
    this.client.emit(
      "useSkill",
      this.allData.myData.id,
      this.allData.emyData.id,
      skill_id,
      this.allData.myData.roomCode
    );
  }

  moveup(event: any) {
    if (this.gameover) {
      return;
    }
    if (event) {
      const node: cc.Node = event.target;
      node.getComponent(cc.Button).interactable = false;
    }
    this.client.emit(
      "move",
      this.allData.myData.roomCode,
      this.allData.myData.id,
      "mu"
    );
  }
  moveback(event: any) {
    if (this.gameover) {
      return;
    }
    if (event) {
      const node: cc.Node = event.target;
      node.getComponent(cc.Button).interactable = false;
    }
    this.client.emit(
      "move",
      this.allData.myData.roomCode,
      this.allData.myData.id,
      "md"
    );
  }

  // 技能读条
  readPercent(needTime: number, callback: Function) {
    this.countTime = needTime;
    this.maxTime = needTime;
    if (this.countSkillTimer) {
      clearTimeout(this.countSkillTimer);
    }
    this.countSkillTimer = setTimeout(() => {
      this.countTime = 0;
      this.updatePercent();
      this.readingBox.active = false;
      if (callback) {
        callback();
        // 更新遮罩
        this.updateSkill();
      }
    }, needTime);
  }
  // 施法条更新
  updatePercent() {
    const percent = this.countTime / this.maxTime;
    this.readingBox.active = true;
    this.readingBox
      .getChildByName("process")
      .getComponent(cc.ProgressBar).progress = 1 - percent;
    // cc.log("进度", 1 - percent);
  }

  // 战斗播报切换
  toggleFightingRecord() {
    cc.find("Canvas/background/report_page").active = !cc.find(
      "Canvas/background/report_page"
    ).active;
  }
  pushRecord(record: any) {
    const node = cc.instantiate(this.ftPref);
    node.getComponent(cc.Label).string = `${record.time} ${record.msg}`;
    this.recordBox.addChild(node);
    this.recordBox.parent.parent.getComponent(cc.ScrollView).scrollToBottom();
  }

  //   start() {}

  updateGame() {
    // 时间记录
    this.updateTimeInfo();
    // 英雄位移
    this.moveHero();
    // 血量数值
    this.updatePlayerStatus();
    // buff
    this.updateBuff();
    // 技能
    this.updateSkill();
  }

  update(dt: number) {
    if (!this.gameover) {
      this.counter.dt += dt;
      if (this.countTime > 0) {
        this.counter.ms += dt;
        if (this.counter.ms >= 0.05) {
          this.countTime -= 50;
          this.counter.ms = 0;
          this.updatePercent();
        }
      }
      if (this.counter.dt >= 1) {
        this.counter.dt = 0;
        this.updateGame();
      }
    }
    this.counter.queue += dt;
    if (this.counter.queue >= 0.4) {
      this.solveMyEffectQueue();
      this.solveEmyEffectQueue();
      this.counter.queue = 0;
    }
  }

  onDestroy() {
    clearTimeout(this.counter.delayactionTimer);
    clearTimeout(this.countSkillTimer);
  }
}
