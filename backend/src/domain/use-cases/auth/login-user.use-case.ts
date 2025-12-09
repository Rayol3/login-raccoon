import { LoginUserDto } from '../../dtos/auth/login-user.dto';
import { UserEntity } from '../../entities/user.entity';
import { AuthRepository } from '../../repositories/auth.repository';

interface LoginUserUseCase {
    execute(loginUserDto: LoginUserDto): Promise<UserToken>;
}

type UserToken = {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
};

type SignToken = (payload: Object, duration?: string) => Promise<string | null>;

export class LoginUser implements LoginUserUseCase {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly signToken: SignToken = async () => { throw Error('SignToken not implemented'); }
    ) { }

    async execute(loginUserDto: LoginUserDto): Promise<UserToken> {
        const user = await this.authRepository.login(loginUserDto);

        const token = await this.signToken({ id: user.id }, '2h');
        if (!token) throw Error('Error signing token');

        return {
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        };
    }
}
