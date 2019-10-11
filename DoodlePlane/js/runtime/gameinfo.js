import Util from '../common/util'
import Constants from '../common/constants'

const screenWidth  = window.innerWidth
const screenHeight = window.innerHeight

let atlas = new Image()
atlas.src = 'images/logo.png'
let atlas1 = new Image()
atlas1.src = 'images/common1.png'
let atlas2 = new Image()
atlas2.src = 'images/common2.png'
let atlas3 = new Image()
atlas3.src = 'images/common3.png'

export default class GameInfo {
  constructor() {
    this.showGameOver = false
    this.showGamePuse = false
    this.showGameContinue=false
  }

  onTouchEvent(type, x, y, callback) {
    switch (type) {
      case 'touchstart':
        if (Util.inArea({ x, y }, this.areaSetting)){
          callback({ message: 'pause' })
          this.showGameContinue=true
        }
        else if (!this.showGameOver && Util.inArea({ x, y }, this.btnmode1)){
          callback({ message: 'resume' })
          this.showGamePause=false
        }
        else if (!this.showGameOver && Util.inArea({ x, y }, this.btnmode2)) {
          if (!this.showGameContinue)
            callback({ message: 'God' })
          else
            callback({message:'restart'})
          this.showGamePause = false
        }
        else if (!this.showGameOver&&Util.inArea({ x, y }, this.btnbomb)){
          callback({message:'bomb'})
        }
        else if (this.showGameOver && Util.inArea({ x, y }, this.btnRestart)) {
          callback({ message: 'restart' })
          this.showGameOver = false
        }
        break
    }
  }
  renderGameStart(ctx) {
    this.showGameOver = false
    this.showGamePuse=true
    ctx.drawImage(
      atlas,
      15, 0, 360, 100,
      screenWidth/2-160,
      screenHeight/2-150,
      320,90 
    )
    ctx.fillStyle = "#ffffff"
    ctx.font = "20px Arial"
    if(this.showGameContinue==false){
    ctx.fillText(
      '经典模式',
      screenWidth / 2 - 35,
      screenHeight / 2
    )
    ctx.fillText(
      '无敌模式',
      screenWidth / 2 - 35,
      screenHeight / 2+50
    )
    }
    if (this.showGameContinue == true) {
      ctx.fillText(
        '继续游戏',
        screenWidth / 2 - 35,
        screenHeight / 2
      )
      ctx.fillText(
        '返回菜单',
        screenWidth / 2 - 35,
        screenHeight / 2 + 50
      )
    }

    this.btnmode1 = {
      startX: screenWidth / 2 - 40,
      startY: screenHeight / 2 - 20,
      endX: screenWidth / 2 + 50,
      endY: screenHeight / 2 +10
    }
    this.btnmode2 = {
      startX: screenWidth / 2 - 40,
      startY: screenHeight / 2 +30,
      endX: screenWidth / 2 + 50,
      endY: screenHeight / 2 + 80
    }
  }
  renderGameScore(ctx, score,bombnum,bloodnum) {
    if(this.showGamePause==false){
    ctx.fillStyle = "#000000"
    ctx.font      = "20px Arial"
    ctx.fillText(
        score,
        110, 28
      )
    //visualize area boundary
     ctx.drawImage(
       atlas,
       140, 120, 320, 60,
       5, 5,
       155, 30
    )
    ctx.drawImage(
      atlas,
      20, 180, 80, 60,
      5, 50,
      40, 30
    )
      ctx.fillStyle = "#ffffff"
      ctx.font = "30px Arial"
      ctx.fillText(
        bombnum,
        85, screenHeight - 20 
      )
      ctx.fillText(
        bloodnum,
        85, screenHeight - 70
      )
      ctx.drawImage(
        atlas,
        105, 250, 80, 60,
        10,
        screenHeight - 100,
        60, 45
      )
      ctx.drawImage(
        atlas,
        20,250 , 80, 60,
        10 ,
        screenHeight-50 ,
        60, 45
      )
    
    }
    this.areaSetting = {
      startX: 5,
      startY: 50,
      endX: 45, //ctx.font = '20px Arial'
      endY: 80
    }
    this.btnbomb={
      startX: 10,
      startY: screenHeight - 50,
      endX: 80, 
      endY: screenHeight-10 
    }
  }

  renderGameOver(ctx, score) {
    this.showGameOver = true
    ctx.drawImage(atlas1, 0, 0, 119, 108, screenWidth / 2 - 150, screenHeight / 2 - 100, 300, 300)
    ctx.drawImage(atlas2, 0, 0, 119, 108, screenWidth / 2 - 100, screenHeight / 2 - 40, 200, 200)
    ctx.fillStyle = "#ffffff"
    ctx.font    = "20px Arial"

    ctx.fillText(
      '游戏结束',
      screenWidth / 2 - 35,
      screenHeight / 2 - 100 + 50
    )

    ctx.fillText(
      '得分: ' + score,
      screenWidth / 2 - 30,
      screenHeight / 2 - 100 + 130
    )

    ctx.drawImage(
      atlas3,
      0, 0, 115, 35,
      screenWidth / 2 - 60,
      screenHeight / 2 - 100 + 180,
      120, 48
    )

    ctx.fillText(
      '返回菜单',
      screenWidth / 2 - 40,
      screenHeight / 2 - 100 + 210
    )

    /**
     * 重新开始按钮区域
     * 方便简易判断按钮点击
     */
    this.btnRestart = {
      startX: screenWidth / 2 - 40,
      startY: screenHeight / 2 - 100 + 180,
      endX: screenWidth / 2 + 60,
      endY: screenHeight / 2 - 100 + 228
    }
  }
}

