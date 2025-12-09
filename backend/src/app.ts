import { envs } from './config/envs';
import { MongoDatabase } from './data/mongodb/mongo-database';
import { AppRoutes } from './presentation/routes';
import { Server } from './presentation/server';

(async () => {
    main();
})();

async function main() {
    await MongoDatabase.connect({
        dbName: 'products',
        mongoUrl: envs.MONGO_URL,
    });

    const server = new Server({
        port: envs.PORT,
        routes: AppRoutes.routes,
    });

    server.start();
}
