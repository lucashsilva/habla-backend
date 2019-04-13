
var mimeTypes = require('mimetypes');

const getPhotoDataWithBufferFromBase64 = (base64: string, fileNameWithoutExtension: string) => {
    let mimeType = base64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)[1],
    fileName = `${fileNameWithoutExtension}.${mimeTypes.detectExtension(mimeType)}`,
    base64EncodedImageString = base64.replace(/^data:image\/\w+;base64,/, ''),
    buffer = new Buffer(base64EncodedImageString, 'base64');
    
    return {
        mimeType, fileName, base64EncodedImageString, buffer
    }
}

export { getPhotoDataWithBufferFromBase64 };