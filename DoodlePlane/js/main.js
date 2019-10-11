import Player from './player/index'
import Enemy from './npc/enemy'
import Floatage from './npc/floatage'
import Bomb from './npc/bomb'
import Blood from './npc/blood'
import Freighter from './npc/freighter'
import BackGround from './runtime/background'
import GameInfo from './runtime/gameinfo'
import Music from './runtime/music'
import DataBus from './databus'
//import Config from './common/config'
import ControlLayer from './base/controllayer'
import Util from './common/util'
import Constants from './common/constants'

let ctx = canvas.getContext('2d')
let databus = new DataBus()
const Config = require('./common/config.js').Config
var bullettime = new Array(0, 0, 0, 0)
/**
 * 游戏主函数
 */
export default class Main {
  constructor() {

    console.log(`window.innerHeight = ${window.innerHeight}`)
    var bullettime=new Array(0,0,0,0)
    
    //1.两个主循环
    this.bindloopUpdate = this.loopUpdate.bind(this)
    this.bindloopRender = this.loopRender.bind(this)
    //2.不需重置的游戏数据、玩家操控处理机制
    ;//<--编译器BUG，不加";"会和下一语句拼成一句而出错
    ['touchstart', 'touchmove', 'touchend'].forEach((type) => {
      canvas.addEventListener(type, this.touchEventHandler.bind(this))
    })
    
     
    //3.初次/重新启动
    this.restart()
  }
  restart() {
    databus.reset()
   
    //0.与通用类的关联
    console.log(`Restart: Config.UpdateRate=${Config.UpdateRate}`)
    //1.需重置的游戏数据、玩家操控处理机制
    this.updateInterval = 1000 / Config.UpdateRate
    this.updateTimes = 0
    this.lastRenderTime = new Date().getTime()
    this.bg = new BackGround(ctx)
    this.player = new Player(ctx)
    this.gameinfo = new GameInfo()
    this.music = new Music()
    this.ctrlLayerUI = new ControlLayer('UI', [this.gameinfo])
    this.ctrlLayerSprites = new ControlLayer('Sprites', [this.player])
    this.ctrlLayerBackground = new ControlLayer('Background', [this.bg], 
        Config.CtrlLayers.Background.DefaultActive)  //this.CtrlLayers.Background.DefaultActive)
    Config.GodMode = false
    Config.Bullet.Type='single'
    Config.Bullet.Speed=10
    //2.两个主循环重启
    if (this.updateTimer)
      clearInterval(this.updateTimer)
    this.updateTimer = setInterval(
      this.bindloopUpdate,
      this.updateInterval
    )
    if (this.renderLoopId)
      window.cancelAnimationFrame(this.renderLoopId);
    this.renderLoopId = window.requestAnimationFrame(
      this.bindloopRender,
      canvas
    )
    databus.gameStatus=DataBus.GamePaused
  }
  bomb(){
    if(databus.bombnum==0)
      return 
    for (let i = 0, il = databus.enemys.length; i < il; i++) {
      let enemy = databus.enemys[i]

      if (enemy.isAlive() ) {
        enemy.destroy()
        databus.score += 1
        this.music.playExplosion()
    }
    }
    databus.bombnum-=1
  }
  pause() {
    if (databus.gameStatus == DataBus.GameOver)
      return
    databus.gameStatus = DataBus.GamePaused
    this.ctrlLayerSprites.active = false
    this.ctrlLayerBackground.active = false
  }
  resume() {
    if (databus.gameStatus == DataBus.GameOver)
      return
    databus.gameStatus = DataBus.GameRunning
    this.ctrlLayerSprites.active = true
    this.ctrlLayerBackground.active = Config.CtrlLayers.Background.DefaultActive
  }
  god(){
    databus.gameStatus = DataBus.GameRunning
    Config.Bullet.Type = 'quintuple'
    Config.Bullet.Speed = Constants.Bullet.SpeedBase * (Constants.Bullet.Types.indexOf(Config.Bullet.Type) + 1)
    Config.GodMode=true
  }
  /**
   * 随着帧数变化的敌机生成逻辑
   * 帧数取模定义成生成的频率
   */
  enemyGenerate() {
    if ((this.updateTimes * Constants.Enemy.SpawnRate) % Config.UpdateRate
      < Constants.Enemy.SpawnRate) {
      let enemy = databus.pool.getItemByClass('enemy', Enemy)
      enemy.init(Constants.Enemy.Speed)
      databus.enemys.push(enemy)
    }
  }

  //漂浮物生成逻辑
  floatageGenerate() {
    if ((this.updateTimes * Constants.Floatage.SpawnRate) % Config.UpdateRate
      < Constants.Floatage.SpawnRate
      && databus.floatages.length < Constants.Floatage.SpawnMax) {
      let floatage = databus.pool.getItemByClass('floatage', Floatage)
      floatage.init(Constants.Floatage.Speed)
      databus.floatages.push(floatage)
    }
  }
  bloodGenerate() {
    if ((this.updateTimes * Constants.Blood.SpawnRate) % Config.UpdateRate
      < Constants.Blood.SpawnRate
      && databus.blood.length < Constants.Blood.SpawnMax) {
      let blood = databus.pool.getItemByClass('blood', Blood)
      blood.init(Constants.Blood.Speed)
      databus.blood.push(blood)
    }
  }
  bombGenerate() {
    if ((this.updateTimes * Constants.Bomb.SpawnRate) % Config.UpdateRate
      < Constants.Bomb.SpawnRate
      && databus.bomb.length < Constants.Bomb.SpawnMax) {
      let bomb = databus.pool.getItemByClass('bomb', Bomb)
      bomb.init(Constants.Bomb.Speed)
      databus.bomb.push(bomb)
    }
  }

  //运输机生成逻辑
  freighterGenerate() {
    if ((this.updateTimes * Constants.Freighter.SpawnRate) % Config.UpdateRate
      < Constants.Freighter.SpawnRate) {
      let freighter = databus.pool.getItemByClass('freighter', Freighter)
      freighter.init(Constants.Freighter.Speed)
      databus.enemys.push(freighter)  //freighter is an enemy
    }
  }

  // 全局碰撞检测
  collisionDetection() {
    let that = this
    databus.bullets.forEach((bullet) => {
      for (let i = 0, il = databus.enemys.length; i < il; i++) {
        let enemy = databus.enemys[i]

        if (enemy.isAlive() && enemy.isCollideWith(bullet)) {
          enemy.destroy()
          bullet.destroy()
          that.music.playExplosion()

          databus.score += 1

          break
        }
      }
    })

    databus.floatages.forEach( floatage => {
      if (this.player.isCollideWith(floatage)) {
        floatage.dispose()
        if (Config.Bullet.Type !='quintuple'){
          Config.Bullet.Type = Util.findNext(Constants.Bullet.Types, Config.Bullet.Type)
          Config.Bullet.Speed = Constants.Bullet.SpeedBase * (Constants.Bullet.Types.indexOf(Config.Bullet.Type) + 1)
        wx.showToast({
          title: '获得子弹'
        })
        }
        else
          wx.showToast({
            title: '子弹装载已满'
          })
      }
    })
  
    databus.bomb.forEach(bomb => {
        if (this.player.isCollideWith(bomb)) {
          bomb.dispose()
          if(databus.bombnum<3){
          databus.bombnum += 1
          wx.showToast({
            title: '获得导弹'
          })
          }
          else
            wx.showToast({
              title: '导弹装载已满'
            })
        }
      })
    databus.blood.forEach(blood => {
      if (this.player.isCollideWith(blood)) {
        blood.dispose()
        if(databus.bloodnum<3){
        databus.bloodnum += 1
        wx.showToast({
          title: '获得血瓶'
        })
        }
        else
          wx.showToast({
            title: '血瓶装载已满'
          })
      }
    })

    if (!Config.GodMode){
      if (Config.Bullet.Type == 'double') {
        bullettime[0] += 1
      }
      if (Config.Bullet.Type == 'triple') {
        bullettime[0] += 1
        bullettime[1] += 1
      }
      if (Config.Bullet.Type == 'quadruple') {
        bullettime[0] += 1
        bullettime[1] += 1
        bullettime[2] += 1
      }
      if (Config.Bullet.Type == 'quintuple') {
        bullettime[0] += 1
        bullettime[1] += 1
        bullettime[2] += 1
        bullettime[3] += 1
      }
      for (var i = 0; i < 4; i++) {
        if (bullettime[i] == 500) {
          bullettime[i] = 0
          Config.Bullet.Type = Util.findBefore(Constants.Bullet.Types, Config.Bullet.Type)
          Config.Bullet.Speed = Constants.Bullet.SpeedBase * (Constants.Bullet.Types.indexOf(Config.Bullet.Type) + 1)
        }
      }
      for (let i = 0, il = databus.enemys.length; i < il; i++) {
        let enemy = databus.enemys[i]

        if (this.player.isCollideWith(enemy)) {
        if(databus.bloodnum == 0){
            databus.gameStatus = DataBus.GameOver
            break
        }
        else{
          enemy.destroy()
          that.music.playExplosion()
          databus.score += 1
          databus.bloodnum -= 1
          break
        }
        }
      }
    }
  }

  //-- 游戏【操控】事件处理 ----
  touchEventHandler(e){
    e.preventDefault()
    let [x, y] = (e.type == 'touchstart' || e.type == 'touchmove') ?
      [e.touches[0].clientX, e.touches[0].clientY] : [null, null]

    //规则：1.只会从上层往下层传(只有捕获capture，没有冒泡bubble) 
    //     2.当上层发生过处理时下层不再处理(parent-catch)
    //     3.同一层中，有一个元素处理过（队头优先）其他元素即不再处理(sibling-catch)
    let upperLayerHandled = false
    for (let ctrlLayer of [this.ctrlLayerUI, this.ctrlLayerSprites, this.ctrlLayerBackground]) {
      if (upperLayerHandled)
        break //stop handling
      if (!ctrlLayer.active)
        continue //next layer
      //console.log(`${e.type}: ${ctrlLayer.name}`)
      ctrlLayer.elements.some((element) => {
        //console.log(`${e.type}: ${element.__proto__.constructor.name}`)
        element.onTouchEvent(e.type, x, y, ((res) => {
          switch (res.message) {
            //--- Game Status Switch ---
            case 'bomb':
              this.bomb()
              break
            case 'restart':
              this.restart()
              break
            case 'pause':
              this.pause()
              break
            case 'resume':
              this.resume()
              break
            case 'God':
              this.god()
          }
          if (res.message.length > 0){
            upperLayerHandled = true
            return true //if any element handled the event, stop iteration
          }
        }).bind(this))
      })
    }

  }

  //-- 游戏数据【更新】主函数 ----
  update(timeElapsed) {
    if ([DataBus.GameOver, DataBus.GamePaused].indexOf(databus.gameStatus) > -1)
      return

    this.bg.update()

    databus.bullets
      .concat(databus.enemys)
      .concat(databus.floatages)
      .concat(databus.bomb)
      .concat(databus.blood)
      .forEach((item) => {
        item.update(timeElapsed)
      })

    this.enemyGenerate()

    //this.floatageGenerate()  //Freighters spawn floatages in turn
    this.freighterGenerate()

    this.collisionDetection()

    //即使GameOver仍可能发最后一颗子弹..仇恨的子弹..
    if ((this.updateTimes * Constants.Bullet.SpawnRate) % Config.UpdateRate
       < Constants.Bullet.SpawnRate) {
      this.player.shoot()
      this.music.playShoot()
    }
    
    //GameOver can only be caused by collisionDetection
    if (databus.gameStatus == DataBus.GameOver) {
      this.ctrlLayerSprites.active = false
      this.ctrlLayerBackground.active = false
    }

  }

  //-- 游戏数据【渲染】主函数 ----
  render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
     
    this.bg.render(ctx)
      if(databus.gameStatus==DataBus.GamePaused)
        this.gameinfo.renderGameStart(ctx)
        else{
        
        databus.bullets
        .concat(databus.enemys)
        .concat(databus.floatages)
        .concat(databus.bomb)
        .concat(databus.blood)
        .forEach((item) => {
        item.render(ctx)
      })
     
    this.player.render(ctx)
    // databus.animations.forEach((anim) => {
    //   anim.render(ctx)
    // })
        }
    this.gameinfo.renderGameScore(ctx, databus.score,databus.bombnum,databus.bloodnum)
    // 游戏结束停止帧循环
    if (databus.gameStatus == DataBus.GameOver) {
      this.gameinfo.renderGameOver(ctx, databus.score)
    }
        
  }

  //-- 游戏数据【更新】主循环 ----
  loopUpdate() {
    this.updateTimes++
    let timeElapsed = new Date().getTime() - this.lastRenderTime
    this.lastRenderTime = new Date().getTime()
    this.update(timeElapsed)
  }

  //-- 游戏数据【渲染】主循环 ----
  loopRender() {
    this.render()
    this.renderLoopId = window.requestAnimationFrame(
      this.bindloopRender,
      canvas
    )
  }

}
