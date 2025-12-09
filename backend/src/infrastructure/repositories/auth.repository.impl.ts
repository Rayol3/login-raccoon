import { AuthDatasource } from '../../domain/datasources/auth.datasource';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { LoginUserDto } from '../../domain/dtos/auth/login-user.dto';
import { RegisterUserDto } from '../../domain/dtos/auth/register-user.dto';
import { UserEntity } from '../../domain/entities/user.entity';

export class AuthRepositoryImpl implements AuthRepository {
    constructor(
        private readonly authDatasource: AuthDatasource,
    ) { }

    login(loginUserDto: LoginUserDto): Promise<UserEntity> {
        return this.authDatasource.login(loginUserDto);
    }

    register(registerUserDto: RegisterUserDto): Promise<UserEntity> {
        return this.authDatasource.register(registerUserDto);
    }
}
