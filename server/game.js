export class Game {
    constructor(){
        this.multiplier = 1.0;
    }    

    fly(){
        this.multiplier = this.multiplier + 0.01
        return this.multiplier
    }

}