const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

function sliceImage(src,
                    frameWidth,
                    frameHeight,
                    xOffset = 0,
                    yOffset = 0,
                    frameCount = Number.MAX_SAFE_INTEGER) {
    let images = [];
    let nTilesY = Math.floor(src.height / frameHeight);
    let nTilesX = Math.floor(src.width / frameWidth);

    let nOffsetY = Math.floor( yOffset / frameHeight);
    let nOffsetX = Math.floor( xOffset / frameWidth);
    canvas.width = frameWidth;
    canvas.height = frameHeight;

    for (let ty = 0; ty < nTilesY && images < frameCount; ty++) {
        if (ty < nOffsetY) continue;
        for (let tx = 0; tx < nTilesX && images < frameCount; tx++) {
            if (ty == nOffsetY && tx < nOffsetX) continue;
            let x = tx * frameWidth + (ty == nOffsetX ? xOffset : 0);
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