import multer from "multer";
import path from "path";
import { CustomError, messages, HttpStatusCodes } from "../utils/helpers";

const storage = multer.memoryStorage()
const upload = multer({storage, limits: {
    fileSize: 10 * 1024 * 1024
    },
    fileFilter: (req, file, cb) =>{
        try {
        const extensao = path.extname(file.originalname).toLowerCase()
        const permitidas = ['.jpg', '.jpeg', '.png']

        if(!permitidas.includes(extensao)){
            return cb(
                new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'unsupportedMediaType',
                    field:"Imagem",
                    details:[{path:"Imagem", message:"Extensão inválida"}],
                    customMessage:"Extensão de arquivo inválido."
                }), false
            )
        }
        if(!file.mimetype.startsWith('image/')) {
            return cb (
                new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType:'unsupportedMediaType',
                    field:"Imagem",
                    details:[{path:"Imagem", message:"Arquivo inválido"}],
                    customMessage:"O arquivo enviado não é uma imagem válida."
                }), false
            )
        }
        cb(null, false)
        }catch(error){
            cb(error, false)
        }
    }
})
export default upload.single('single')