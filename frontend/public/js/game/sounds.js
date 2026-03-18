export class Sounds{
    constructor() {
        this.bgMusic = new Audio('/assets/sounds/music.mp3');
        this.endSound = new Audio('/assets/sounds/end_sound.mp3')
        this.active = false;
    }

    start(){
        if (this.active) return;
        this.bgMusic.currentTime = 0
        this.endSound.pause()
        this.bgMusic.play()
        this.active = true;
    }

    stop(){
        if (!this.active) return;
        this.bgMusic.pause()
        this.endSound.currentTime = 0
        this.endSound.play()
        this.active = false;
    }
}