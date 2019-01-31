const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

function sliceImage(src,
                    frameWidth,
                    frameHeight,
                    xOffset = 0,
                    yOffset = 0,
                    frameCount = Number.MAX_SAFE_INTEGER) {
    let images = [];
    let nTilesX = Math.floor((src.width - xOffset) / frameWidth);
    let nTilesY = Math.floor((src.height - yOffset) / frameHeight);

    canvas.width = frameWidth;
    canvas.height = frameHeight;

    for (let ty = 0; ty < nTilesY; ty++) {
        if (ty * nTilesX >= frameCount) break;
        for (let tx = 0; tx < nTilesX; tx++) {
            if (ty * nTilesX + tx >= frameCount) break;
            let x = tx * frameWidth + xOffset;
            let y = ty * frameHeight + yOffset;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(src, -x, -y);

            let img = new Image();
            img.src = canvas.toDataURL('image/png');

            images.push(img);
        }
    }

    return images;
}

class ImageUtils {
}

ImageUtils.sliceImage = sliceImage;

export default ImageUtils;