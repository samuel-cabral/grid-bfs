class BreadthFirstSearch {
  widthMap = 480;
  heightMap = 480;
  paddingMap = 20;
  cellSize = 40;
  canvas = document.getElementById('canvas');
  context = this.canvas.getContext('2d');

  colours = {
    board: '#dabfff', 
    tortoise: '#ec0b43', 
    earthworm: '#37cc7d', 
    adjacent: '#582080', 
    explored: '#af40ff', 
    path: '#f8c630', 
    wall: '#0b003d'
  };
  
  reachable = [];
  explored = [];
  path = [];
  tortoise = {};
  earthworm = {};
  wallNodes = [
    {x: 7, y: 5}, 
    {x: 7, y: 6}, 
    {x: 7, y: 7}, 
    {x: 7, y: 8}, 
    {x: 8, y: 8}, 
    {x: 9, y: 8}, 
    {x: 10, y: 8}, 
    {x: 8, y:5}
  ];
  
  
  constructor(tortoise, earthworm) {
    // Clear canvas
    this.clearCanvas();
    
    // Add start node
    this.reachable.push({current: tortoise, previous: {}});
    this.earthworm = earthworm;
    
    this.fillNode(tortoise, this.colours.tortoise);
    this.fillNode(earthworm, this.colours.earthworm);
    this.context.fillStyle = 'black';
    
    this.drawBoard();
    this.drawWalls();
    this.findPath();
    BreadthFirstSearch.disableControls(true);
  }
  
  async findPath() {
    let previousNode = {};
    let i = 0;
    while (this.reachable.length) {
      // Slow down the search to visualize it
      await BreadthFirstSearch.wait();
      let nodeData = this.chooseNode(),
      node = nodeData.current;
      
      if ( BreadthFirstSearch.areObjectsEqual(node, this.earthworm)) {
        BreadthFirstSearch.disableControls(false);
        return this.buildPath(nodeData);
      }
      this.explored.push({current: node, previous: nodeData.previous, direction: nodeData.direction});
      document.querySelector('.breadth-search-container .explored .explored-list').innerHTML = JSON.stringify(this.explored);
      
      if (i > 0) {
        this.fillNode(node, this.colours.explored);
      }
      
      // Where can we get from here?
      this.getAdjacent(node);
      document.querySelector('.breadth-search-container .reachable .reachable-list').innerHTML = JSON.stringify(this.reachable);
      
      previousNode = node;
      i++;
    }
  }
  
  chooseNode() {
    return this.reachable.shift();
  }
  
  getAdjacent(node) {
    let adjacentNodes = [];
    if (node.x - 1 > 0 ) { //!this.wallNodes.includes(node)
      adjacentNodes.push({x: node.x - 1, y: node.y});
    }
    if (node.x + 1 <= this.widthMap / this.cellSize ) {
      adjacentNodes.push({x: node.x + 1, y: node.y});
    }
    if (node.y - 1 > 0 ) {
      adjacentNodes.push({x: node.x, y: node.y - 1});
    }
    if (node.y + 1 <= this.heightMap / this.cellSize) {
      adjacentNodes.push({x: node.x, y: node.y + 1});
    }
    
    const self = this;
    adjacentNodes.forEach( (adjacentNode) => {
      if (!self.isExplored(adjacentNode) && !BreadthFirstSearch.isIncludeObject(self.wallNodes, adjacentNode)) {
        if (!BreadthFirstSearch.areObjectsEqual(adjacentNode, self.earthworm)) {
          self.fillNode(adjacentNode, self.colours.adjacent);
        }
        self.reachable.push({current: adjacentNode, previous: node});
      }
    });
  }
  
  buildPath(node) {
    this.path.push(this.earthworm);
    while (node) {
      let prevNode = this.explored.find((e) => BreadthFirstSearch.areObjectsEqual(e.current, node.previous));
      if (prevNode == null) {
        break;
      }
      
      node = prevNode;
      if (JSON.stringify(node.previous) !== JSON.stringify(this.tortoise)) {
        this.fillNode(node.current, this.colours.path);
      }
      this.path.push(prevNode.current);
    }
    document.querySelector('.breadth-search-container .path .path-list').innerHTML = JSON.stringify(this.path.reverse());
  }
  
  drawBoard() {
    // horizontal
    let i = 1;
    for (let x = 0; x <= this.heightMap; x += this.cellSize) {
      this.context.moveTo(this.paddingMap, 0.5 + x + this.paddingMap);
      this.context.lineTo(this.widthMap + this.paddingMap, 0.5 + x + this.paddingMap);
      if (i <= this.widthMap/this.cellSize) {
        this.context.font = '20px Arial';
        this.context.fillText(i, x + this.cellSize / 2 + this.paddingMap / 2, this.paddingMap-5);
        i++;
      }
    }
    // vertical
    i = 1;
    for (let x = 0; x <= this.widthMap; x += this.cellSize) {
      this.context.moveTo(0.5 + x + this.paddingMap, this.paddingMap);
      this.context.lineTo(0.5 + x + this.paddingMap, this.heightMap + this.paddingMap);
      
      if (i <= this.widthMap/this.cellSize) {
        this.context.font = '20px Arial';
        this.context.fillText(i, 0, x + this.cellSize / 2 + this.paddingMap + 5);
        i++;
      }
    }
    this.context.strokeStyle = 'black';
    this.context.stroke();
  }
  
  drawWalls() {
    for (let node of this.wallNodes) {
      this.fillNode(node, this.colours.wall);
    }
  }
  
  fillNode(node, colour) {
    this.context.fillStyle = colour;
    this.context.fillRect(this.cellSize * (node.x - 1) + this.paddingMap,this.cellSize * (node.y - 1) + this.paddingMap, this.cellSize, this.cellSize);
    this.context.stroke();
  }
  
  isExplored(node) {
    return (this.reachable.filter(e => BreadthFirstSearch.areObjectsEqual(e.current, node)).length > 0 ||
    this.explored.filter(e => BreadthFirstSearch.areObjectsEqual(e.current, node)).length > 0)
  }
  
  clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = this.colours.board;
    this.context.fillRect(this.paddingMap, this.paddingMap, this.widthMap, this.heightMap);
    document.querySelector('.breadth-search-container .path .path-list').innerHTML = '...';
  }
  
  static areObjectsEqual(firstObject, secondObject) {
    return JSON.stringify(firstObject) === JSON.stringify(secondObject);
  }
  
  static disableControls(disabled = true) {
    document.querySelector('#start-button').disabled = disabled;
  }
  
  static isIncludeObject(array, object) {
    for(let i = 0; i < array.length; i++) {
      if (BreadthFirstSearch.areObjectsEqual(array[i], object)) {
        return true;
      }
    }
    return false;
  }
  
  static wait() {
    return new Promise(function(resolve) {
      setTimeout(resolve, 10);
    });
  }
}

function start() {
  let xStart = parseInt(document.getElementById('x_start').value),
  yStart = parseInt(document.getElementById('y_start').value),
  xGoal = parseInt(document.getElementById('x_goal').value),
  yGoal = parseInt(document.getElementById('y_goal').value);
  const map = new BreadthFirstSearch({x: xStart,y: yStart}, {x: xGoal, y: yGoal});
}

window.addEventListener('load', () => {
  const map = new BreadthFirstSearch({x: 4,y: 5}, {x: 9, y: 11});
});