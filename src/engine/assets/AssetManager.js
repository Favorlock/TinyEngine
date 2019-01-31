class AssetManager {
    constructor() {
        this.successCount = 0;
        this.errorCount = 0;
        this.cache = [];
        this.downloadQueue = [];
    }

    queueDownload(path) {
        this.downloadQueue.push(path);
    }

    isDone() {
        return this.downloadQueue.length === this.successCount + this.errorCount;
    }

    downloadAll(callback) {
        for (let i = 0; i < this.downloadQueue.length; i++) {
            let path = this.downloadQueue[i];
            let img = new Image();
            img.addEventListener('load', function () {
                this.successCount++;
                if (this.isDone()) callback();
            }.bind(this))

            img.addEventListener('error', function () {
                this.errorCount++;
                if (this.isDone()) callback();
            }.bind(this))

            img.src = path;
            this.cache[path] = img;
        }
    }
}

export default AssetManager;