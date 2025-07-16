class Collectible {
  constructor({x, y, value, id, size = 20}) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.id = id;
    this.state  = false;
    this.size = size
  }

}

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Collectible;
} catch(e) {}

export default Collectible;
