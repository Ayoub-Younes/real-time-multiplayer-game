let canvas = {width :600, height:400}

class Player {
  constructor({x, y, score = 0, id, speed, size = 50,dir={}}) {
   this.x = x;
   this.y = y;
   this.score = score;
   this.id = id;
   this.speed = speed;
   this.dir = dir;
   this.size = size;
  }


  movePlayer(dir, num) {
    switch (dir){
      case'up' :
        this.y -= num;
        break;
      case'down' :
        this.y += num;
        break;
      case'left' :
        this.x -= num;
        break;
      case'right' :
        this.x += num;
        break;
    }
    
  }

  /*
  movePlayer(dir, speed , isPressed = false) {
    //dir = 'Arrow' + dir.charAt(0).toUpperCase() + dir.slice(1);
    switch (dir){
      case'ArrowUp' :
        this.dir.up = isPressed
        break;
      case'ArrowDown' :
        this.dir.down = isPressed
        break;
      case'ArrowLeft' :
        this.dir.left = isPressed
        break;
      case'ArrowRight' :
        this.dir.right = isPressed
        break;
    }
    
  }*/
  
  collision(item) {
    let rightCol = this.x < item.x + item.size;
    let leftCol = this.x + this.size > item.x;
    let downCol = this.y < item.y + item.size;
    let upCol = this.y +  this.size > item.y;
    if(leftCol && rightCol && upCol &&  downCol){return true}
    return false;
  }
   

  calculateRank(arr) {
    let a = arr.sort((a, b) => b.score - a.score )
    let index = a.findIndex(pok => pok.id == this.id)
    let rank  = index + 1
    return `Rank: ${rank}/${a.length}`
  }
}

export default Player;
