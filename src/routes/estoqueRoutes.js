import express from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import AuthPermission from "../middlewares/AuthPermission.js";
import EstoqueController from '../controllers/EstoqueController.js';
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();

const estoqueController = new EstoqueController(); 

router
    .get("/estoques", AuthMiddleware, AuthPermission, asyncWrapper(estoqueController.listar.bind(estoqueController)))
    .get("/estoques/:id", AuthMiddleware, AuthPermission, asyncWrapper(estoqueController.listar.bind(estoqueController)))

export default router;