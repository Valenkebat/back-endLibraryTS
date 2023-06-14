import path from "path";
import { fileURLToPath } from 'url';
import { DataSource } from "typeorm";
import { enviroment } from "./enviroment";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

export const AppDataSource = new DataSource({
    type: "postgres",
    host: enviroment.DB_HOST,
    port: Number(enviroment.DB_HOST),
    username: enviroment.DB_USERNAME,
    password: enviroment.DB_PASSWORD,
    database: enviroment.DB_DATABASE,
    synchronize: false,
    logging: false,
    entities: [path.join(__dirname, '../entity/**/**.ts'),],
    subscribers: [],
    migrations: [],
})

