import 'dotenv/config';
import { get } from 'env-var';

export class envs {
    static get PORT(): number {
        return get('PORT').required().asPortNumber();
    }

    static get MONGO_URL(): string {
        return get('MONGO_URL').required().asString();
    }

    static get JWT_SEED(): string {
        return get('JWT_SEED').required().asString();
    }
}
