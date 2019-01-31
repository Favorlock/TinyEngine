import ObjectUtils from "../utils/ObjectUtils.js";

class AssetManager {
    constructor() {
        this.successCount = 0;
        this.errorCount = 0;
        this.cache = {};
        this.downloadQueue = {};
    }

    queueDownload(key, path = key) {
        this.downloadQueue[key] = path;
    }

    isDone() {
        return ObjectUtils.getLength(this.downloadQueue) === this.successCount + this.errorCount;
    }

    downloadAll(callback) {
        for (let property in this.downloadQueue) {
            let img = new Image();

            img.addEventListener('load', function () {
                this.successCount++;
                if (this.isDone()) callback();
            }.bind(this))

            img.addEventListener('error', function () {
                this.errorCount++;
                if (this.isDone()) callback();
            }.bind(this))

            img.src = this.downloadQueue[property];
            this.cache[property] = img;
        }
    }
}

export default AssetManager;