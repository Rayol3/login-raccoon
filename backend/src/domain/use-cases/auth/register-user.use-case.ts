import { RegisterUserDto } from '../../dtos/auth/register-user.dto';
import { UserEntity } from '../../entities/user.entity';
import { AuthRepository } from '../../repositories/auth.repository';

interface RegisterUserUseCase {
    execute(registerUserDto: RegisterUserDto): Promise<UserToken>;
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

export class RegisterUser implements RegisterUserUseCase {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly signToken: SignToken = async () => { throw Error('SignToken not implemented'); }
    ) { }

    async execute(registerUserDto: RegisterUserDto): Promise<UserToken> {
        const user = await this.authRepository.register(registerUserDto);

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
