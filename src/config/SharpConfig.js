import sharp from "sharp";
import path from "path";

export default async function Compress(arquivo){
    if(path.extname(arquivo.originalname).toLowerCase() === ".jpg"){
        const novoArquivo = await sharp(arquivo)
        .resize(1024, 1024)
        .jp2({quality:70})
        .toBuffer()
        return novoArquivo

    }else if(path.extname(arquivo.originalname).toLowerCase() === ".jpeg"){
        const novoArquivo = await sharp(arquivo)
        .resize(1024, 1024)
        .jpeg({quality:70})
        .toBuffer()
        return novoArquivo
    }else {
        const novoArquivo = await sharp(arquivo)
        .resize(1024, 1024)
        .png({quality:70})
        .toBuffer()
        return novoArquivo
    }
}