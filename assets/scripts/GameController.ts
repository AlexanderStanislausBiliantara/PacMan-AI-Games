import { _decorator, CCInteger, Component, instantiate, Node, Prefab, view } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {
    @property({type:CCInteger})
    private foodSpawnInterval;

    @property({type:Prefab})
    private foodPrefab:Prefab;

    private minX:number = -400;
    private maxX:number = 400;
    private minY:number = -300;
    private maxY:number = 300;

    start() {
        this.schedule(this.spawnFood, this.foodSpawnInterval);
    }

    spawnFood() {
        let food:Node = instantiate(this.foodPrefab);
        food.setParent(this.node);

        let randX = Math.random() * view.getVisibleSize().width;
        let randY = Math.random() * view.getVisibleSize().height;

        food.setWorldPosition(randX, randY, 0);
    }

    update(deltaTime: number) {
        
    }
}


