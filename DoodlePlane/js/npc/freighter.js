import Enemy from './enemy'
import Floatage from './floatage'
import Blood from './blood'
import Bomb from './bomb'
import Constants from '../common/constants'
import DataBus from '../databus'

const FREIGHTER_IMG_SRC = 'images/freighter.png'
const FREIGHTER_WIDTH = 90
const FREIGHTER_HEIGHT = 90

let databus = new DataBus()

export default class Freighter extends Enemy {
  constructor() {
    super(FREIGHTER_IMG_SRC, FREIGHTER_WIDTH, FREIGHTER_HEIGHT)
  }

  destroy() {
    super.destroy()
    var Rand = Math.random()
    var flag = 1+Math.round(Rand*2) 
    //spawn a floatage
    if (databus.floatages.length < Constants.Floatage.SpawnMax&&flag==1) {
      let floatage = databus.pool.getItemByClass('floatage', Floatage)
      floatage.init(Constants.Floatage.Speed,
        this.x + this.width / 2 - floatage.width / 2,
        this.y + this.height / 2 - floatage.height / 2)
      databus.floatages.push(floatage)
    }
    //spawn a bomb
    if (databus.bomb.length < Constants.Bomb.SpawnMax&&flag==2) {
      let bomb = databus.pool.getItemByClass('bomb', Bomb)
      bomb.init(Constants.Bomb.Speed,
        this.x + this.width / 2 - bomb.width / 2,
        this.y + this.height / 2 - bomb.height / 2)
      databus.bomb.push(bomb)
    }
     //spawn a blood
    if (databus.blood.length < Constants.Blood.SpawnMax && flag == 3) {
      let blood = databus.pool.getItemByClass('blood', Blood)
      blood.init(Constants.Blood.Speed,
        this.x + this.width / 2 - blood.width / 2,
        this.y + this.height / 2 - blood.height / 2)
      databus.blood.push(blood)
    }
  }
}
