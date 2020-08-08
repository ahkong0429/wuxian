// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class IconmapClass extends cc.Component {
  // 商城道具对应icon
  @property(cc.SpriteFrame)
  a01: cc.SpriteFrame = null; //chai
  @property(cc.SpriteFrame)
  a02: cc.SpriteFrame = null; //xilian
  @property(cc.SpriteFrame)
  a03: cc.SpriteFrame = null; //"skill_up";
  @property(cc.SpriteFrame)
  a04: cc.SpriteFrame = null; //"hero_up";
  @property(cc.SpriteFrame)
  b01: cc.SpriteFrame = null; //"xinshou";
  @property(cc.SpriteFrame)
  b03: cc.SpriteFrame = null; // "jifen";
  @property(cc.SpriteFrame)
  b04: cc.SpriteFrame = null; // "jifen";
  @property(cc.SpriteFrame)
  b06: cc.SpriteFrame = null; // "vip";
  @property(cc.SpriteFrame)
  b07: cc.SpriteFrame = null; // "vsuper";
  @property(cc.SpriteFrame)
  b08: cc.SpriteFrame = null; // "lucky";

  // 副本怪物头像
  @property(cc.SpriteFrame)
  slim: cc.SpriteFrame = null;
  @property(cc.SpriteFrame)
  icebear: cc.SpriteFrame = null;
  @property(cc.SpriteFrame)
  fireteam: cc.SpriteFrame = null;
  @property(cc.SpriteFrame)
  skydragon: cc.SpriteFrame = null;

  //   副本怪物龙骨资源
  @property(dragonBones.DragonBonesAsset)
  slimBossAsset: dragonBones.DragonBonesAsset = null;
  @property(dragonBones.DragonBonesAtlasAsset)
  slimBossAtlasAsset: dragonBones.DragonBonesAtlasAsset = null;
  slimBossName: string = "Flynn";
  slimBossATK: string = "Skill Special B";
  slimBossDMG: string = "Damage";
  slimBossSKL: string = "Skill Special";
  slimBossScale: number = 0.7;

  @property(dragonBones.DragonBonesAsset)
  icebearAsset: dragonBones.DragonBonesAsset = null;
  @property(dragonBones.DragonBonesAtlasAsset)
  icebearAtlasAsset: dragonBones.DragonBonesAtlasAsset = null;
  icebearName: string = "ArcaneGolem";
  icebearATK: string = "Attack E";
  icebearDMG: string = "Damage";
  icebearSKL: string = "Attack A";
  icebearScale: number = 0.35;

  @property(dragonBones.DragonBonesAsset)
  fireteamAsset: dragonBones.DragonBonesAsset = null;
  @property(dragonBones.DragonBonesAtlasAsset)
  fireteamAtlasAsset: dragonBones.DragonBonesAtlasAsset = null;
  fireteamName: string = "Dynamo";
  fireteamATK: string = "Attack C";
  fireteamDMG: string = "Damage";
  fireteamSKL: string = "Attack E";
  fireteamScale: number = 0.4;

  @property(dragonBones.DragonBonesAsset)
  skydragonAsset: dragonBones.DragonBonesAsset = null;
  @property(dragonBones.DragonBonesAtlasAsset)
  skydragonAtlasAsset: dragonBones.DragonBonesAtlasAsset = null;
  skydragonName: string = "HuangLong";
  skydragonATK: string = "Attack E";
  skydragonDMG: string = "Damage";
  skydragonSKL: string = "Attack C";
  skydragonScale: number = 0.45;

  // 英雄种族
  @property(cc.SpriteFrame)
  human: cc.SpriteFrame = null;
  @property(cc.SpriteFrame)
  orcs: cc.SpriteFrame = null;
  @property(cc.SpriteFrame)
  energy: cc.SpriteFrame = null;
  @property(cc.SpriteFrame)
  mechanical: cc.SpriteFrame = null;
  @property(cc.SpriteFrame)
  undead: cc.SpriteFrame = null;
  @property(cc.SpriteFrame)
  vegetation: cc.SpriteFrame = null;

  // 英雄龙骨
  @property(dragonBones.DragonBonesAsset)
  humanAsset: dragonBones.DragonBonesAsset = null;
  @property(dragonBones.DragonBonesAtlasAsset)
  humanAtlasAsset: dragonBones.DragonBonesAtlasAsset = null;
  humanName: string = "SpiritFighter";
  humanATK: string = "Single Punch Spirit";
  humanDMG: string = "Damage";
  humanSKL: string = "Spirit Knuckle";
  humanScale: number = 0.2;

  @property(dragonBones.DragonBonesAsset)
  orcsAsset: dragonBones.DragonBonesAsset = null;
  @property(dragonBones.DragonBonesAtlasAsset)
  orcsAtlasAsset: dragonBones.DragonBonesAtlasAsset = null;
  orcsName: string = "Grunt";
  orcsATK: string = "Attack A";
  orcsDMG: string = "Damage";
  orcsSKL: string = "Attack B";

  @property(dragonBones.DragonBonesAsset)
  energyAsset: dragonBones.DragonBonesAsset = null;
  @property(dragonBones.DragonBonesAtlasAsset)
  energyAtlasAsset: dragonBones.DragonBonesAtlasAsset = null;
  energyName: string = "Demeres";
  energyATK: string = "Attack B";
  energyDMG: string = "Damage";
  energySKL: string = "Attack C";
  energyScale: number = 0.2;

  @property(dragonBones.DragonBonesAsset)
  mechanicalAsset: dragonBones.DragonBonesAsset = null;
  @property(dragonBones.DragonBonesAtlasAsset)
  mechanicalAtlasAsset: dragonBones.DragonBonesAtlasAsset = null;
  mechanicalName: string = "ClockworkPrototype";
  mechanicalATK: string = "Skill";
  mechanicalDMG: string = "Damage";
  mechanicalSKL: string = "Attack";
  mechanicalScale: number = -0.5;

  @property(dragonBones.DragonBonesAsset)
  undeadAsset: dragonBones.DragonBonesAsset = null;
  @property(dragonBones.DragonBonesAtlasAsset)
  undeadAtlasAsset: dragonBones.DragonBonesAtlasAsset = null;
  undeadName: string = "Jiangshi";
  undeadATK: string = "Skill";
  undeadDMG: string = "Damage";
  undeadSKL: string = "Attack";
  undeadScale: number = 0.46;

  @property(dragonBones.DragonBonesAsset)
  vegetationAsset: dragonBones.DragonBonesAsset = null;
  @property(dragonBones.DragonBonesAtlasAsset)
  vegetationAtlasAsset: dragonBones.DragonBonesAtlasAsset = null;
  vegetationName: string = "Daidarabotchi";
  vegetationATK: string = "Attack";
  vegetationDMG: string = "Damage";
  vegetationSKL: string = "Skill";

  // LIFE-CYCLE CALLBACKS:
  // 获取图集资源
  getIconsf(key: string) {
    return this[key];
  }

  //   获取龙骨资源
  getBoneAsset(key: string) {
    return {
      Asset: this[key + "Asset"],
      AtlasAsset: this[key + "AtlasAsset"],
      Name: this[key + "Name"],
      ATK: this[key + "ATK"],
      DMG: this[key + "DMG"],
      SKL: this[key + "SKL"],
      Scale: this[key + "Scale"] || 0.3,
    };
  }

  onLoad() {
    // 设置常驻节点
    cc.game.addPersistRootNode(this.node);
  }

  // start () {

  // }

  // update (dt) {}
}
