import { _decorator, CCInteger, Collider2D, Component, instantiate, Label, Node, Prefab, view } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {
    @property({ type: CCInteger })
    private foodSpawnInterval: number = 2;

    @property({ type: Label })
    private scoreLabel: Label

    @property({ type: CCInteger })
    private maxFood: number = 10;

    @property({ type: Prefab })
    private foodPrefab: Prefab;

    @property(Node)
    public foodContainer: Node;

    private currFood: number = 0;

    private minX: number = -400;
    private maxX: number = 400;
    private minY: number = -300;
    private maxY: number = 300;
    private score: number = 0;

    start() {
        this.schedule(this.spawnFood, this.foodSpawnInterval);
        this.scoreLabel.string = this.score.toString();
    }

    //TODO: set so that it only spawns untill a max of x on screen at once
    spawnFood() {
        //stops if maxFood is reached
        //maxFood + 1 because there is an invisible food at the start 
        if (this.currFood >= this.maxFood + 1) return;

        let food: Node = instantiate(this.foodPrefab);
        food.setParent(this.foodContainer);

        let width = view.getVisibleSize().width;
        let height = view.getVisibleSize().height;

        let randX = (Math.random() - 0.5) * width;
        let randY = (Math.random() - 0.5) * height;

        food.setPosition(randX, randY, 0);
        this.currFood++;
    }

    onFoodEaten(foodNode: Node) {

        foodNode.removeFromParent();
        foodNode.destroy();

        this.currFood--;

        this.score += 10;
        this.updateScoreUI();
    }

    updateScoreUI() {
        this.scoreLabel.string = "" + this.score;
    }

    onGhostEaten(EnemyNode: Node) {
        //this.enemy.respawn or something
        this.score += 200;
        this.updateScoreUI;
    }

    update(deltaTime: number) {

    }
}


