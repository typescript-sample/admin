import { merge } from "config-plus"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import express, { json } from "express"
import { allow, loadTemplates, MiddlewareLogger, resources, start } from "express-ext"
import { createLogger } from "logger-core"
import { Pool } from "pg"
import { PoolManager } from "pg-extension"
import { buildTemplates, trim } from "query-mappers"
import { config, env } from "./config"
import { useContext } from "./context"
import { route } from "./route"

dotenv.config()
const cfg = merge(config, process.env, env, process.env.ENV)

const app = express()
const logger = createLogger(cfg.log)
resources.log = logger.error

const middleware = new MiddlewareLogger(logger.info, cfg.middleware)
app.use(allow(cfg.allow), json(), cookieParser(), middleware.log)

const templates = loadTemplates(cfg.template, buildTemplates, trim, ["./config/query.xml"])
const pool = new Pool(cfg.db)
const db = new PoolManager(pool)
const ctx = useContext(db, logger, middleware, cfg, templates)
route(app, ctx, cfg.secure)
start(app, cfg)
